package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/heal/internal/care"
	"github.com/heal/internal/notify"
	"github.com/heal/internal/reports"
)

var (
	ErrInvalidCase  = errors.New("invalid case")
	ErrCaseNotFound = errors.New("case not found")
)

// East Africa Time, fixed so alert times read the same on every server.
var eat = time.FixedZone("EAT", 3*60*60)

// CareService opens cases, routes alerts to partners' WhatsApp groups, records
// what partners do, and escalates anything nobody answers (Workflows 2 to 9).
type CareService struct {
	db       *sql.DB
	cipher   *reports.Cipher
	notifier notify.Notifier
	appURL   string
	now      func() time.Time
}

func NewCareService(db *sql.DB, cipher *reports.Cipher, notifier notify.Notifier, appURL string) *CareService {
	return &CareService{db: db, cipher: cipher, notifier: notifier, appURL: strings.TrimRight(appURL, "/"), now: time.Now}
}

// ---------- partners ----------

// ---------- cases ----------

type ScreeningSummary struct {
	Instrument string `json:"instrument"`
	Band       string `json:"band"`
	Score      int    `json:"score"`
}

// ContactDetails are sealed; partners see them only after accepting the case.
type ContactDetails struct {
	Method    string `json:"method"` // 'call', 'sms', 'whatsapp', 'none'
	Detail    string `json:"detail"`
	SafeTimes string `json:"safeTimes"`
	Silent    bool   `json:"silent"` // SMS only, never call back
	CodeWord  string `json:"codeWord"`
	Name      string `json:"name"` // only if they chose to give it
}

type CreateCaseRequest struct {
	CaseCode  string            `json:"caseCode"`
	Source    string            `json:"source" binding:"required"`
	Pathway   string            `json:"pathway" binding:"required"`
	Urgent    bool              `json:"urgent"`
	Needs     []string          `json:"needs"`
	Consent   []string          `json:"consent"`
	County    string            `json:"county"`
	Ward      string            `json:"ward"`
	Latitude  *float64          `json:"latitude"`
	Longitude *float64          `json:"longitude"`
	Language  string            `json:"language"`
	Screening *ScreeningSummary `json:"screening"`
	Contact   *ContactDetails   `json:"contact"`
	Summary   string            `json:"summary"`
}

var caseSources = map[string]bool{"screening": true, "emergency": true, "report": true, "nia": true, "chp": true}

type caseRow struct {
	ID, Code, Source, Pathway, County, Ward, Language, Status, Outcome string
	Urgent                                                             bool
	Needs, Consent                                                     []string
	Screening                                                          *ScreeningSummary
	ContactSealed, SummarySealed                                       sql.NullString
	FailedAttempts                                                     int
	FollowUpAt, ClosedAt                                               sql.NullTime
	FeedbackHelped                                                     sql.NullBool
	CreatedAt, UpdatedAt                                               time.Time
	Lat, Lng                                                           *float64
}

func (c *caseRow) loc() care.Location {
	return care.Location{County: c.County, Ward: c.Ward, Lat: c.Lat, Lng: c.Lng}
}

const caseSelect = `SELECT id, case_code, source, pathway, county, ward, language, status, outcome, urgent, needs, consent, screening,
	contact_encrypted, summary_encrypted, failed_attempts, follow_up_at, closed_at, feedback_helped, created_at, updated_at, latitude, longitude FROM cases`

func scanCase(row interface{ Scan(...any) error }) (*caseRow, error) {
	var c caseRow
	var needs, consent, screening []byte
	err := row.Scan(&c.ID, &c.Code, &c.Source, &c.Pathway, &c.County, &c.Ward, &c.Language, &c.Status, &c.Outcome, &c.Urgent,
		&needs, &consent, &screening, &c.ContactSealed, &c.SummarySealed, &c.FailedAttempts, &c.FollowUpAt, &c.ClosedAt,
		&c.FeedbackHelped, &c.CreatedAt, &c.UpdatedAt, &c.Lat, &c.Lng)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrCaseNotFound
	}
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal(needs, &c.Needs)
	_ = json.Unmarshal(consent, &c.Consent)
	if len(screening) > 0 && string(screening) != "null" {
		c.Screening = &ScreeningSummary{}
		_ = json.Unmarshal(screening, c.Screening)
	}
	return &c, nil
}

func (s *CareService) caseByID(id string) (*caseRow, error) {
	return scanCase(s.db.QueryRow(caseSelect+` WHERE id = $1`, id))
}

func (s *CareService) caseByCode(code string) (*caseRow, error) {
	return scanCase(s.db.QueryRow(caseSelect+` WHERE case_code = $1`, strings.ToUpper(strings.TrimSpace(code))))
}

func (s *CareService) event(caseID, actor, kind, detail string) {
	if _, err := s.db.Exec(`INSERT INTO case_events (id, case_id, actor, kind, detail, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
		uuid.New().String(), caseID, actor, kind, detail, s.now()); err != nil {
		log.Println("case event:", err)
	}
}

func (s *CareService) setStatus(c *caseRow, next string) {
	status := care.Advance(c.Status, next)
	if status == c.Status && next != care.StatusClosed {
		return
	}
	c.Status = status
	if _, err := s.db.Exec(`UPDATE cases SET status = $2, updated_at = $3 WHERE id = $1`, c.ID, status, s.now()); err != nil {
		log.Println("case status:", err)
	}
}

func validTypes(list []string, ok func(string) bool) []string {
	seen := map[string]bool{}
	out := []string{}
	for _, v := range list {
		v = strings.TrimSpace(v)
		if ok(v) && !seen[v] {
			seen[v] = true
			out = append(out, v)
		}
	}
	return out
}

// CreateCase opens a case and routes it straight away. The case code may come
// from the device (offline-first); resending the same code returns the case.
func (s *CareService) CreateCase(req CreateCaseRequest) (*CaseStatus, bool, error) {
	if !caseSources[req.Source] {
		return nil, false, fmt.Errorf("%w: unknown source %q", ErrInvalidCase, req.Source)
	}
	if !care.IsPathway(req.Pathway) {
		return nil, false, fmt.Errorf("%w: unknown pathway %q", ErrInvalidCase, req.Pathway)
	}
	code := strings.ToUpper(strings.TrimSpace(req.CaseCode))
	if code == "" {
		var err error
		if code, err = reports.NewCaseCode(); err != nil {
			return nil, false, err
		}
	} else if !reports.ValidCaseCode(code) {
		return nil, false, fmt.Errorf("%w: malformed case code", ErrInvalidCase)
	}
	if existing, err := s.caseByCode(code); err == nil {
		st, err := s.status(existing)
		return st, false, err
	} else if !errors.Is(err, ErrCaseNotFound) {
		return nil, false, err
	}
	if len(req.Summary) > 2000 {
		return nil, false, fmt.Errorf("%w: summary is too long", ErrInvalidCase)
	}
	if req.Language != "sw" {
		req.Language = "en"
	}
	consent := validTypes(req.Consent, care.IsResponderType)
	needs := validTypes(req.Needs, care.IsNeed)
	// Approximate location only (~1 km), as for screenings and reports.
	for _, v := range []*float64{req.Latitude, req.Longitude} {
		if v != nil {
			*v = math.Round(*v*100) / 100
		}
	}

	var contactSealed, summarySealed any
	if req.Contact != nil {
		b, _ := json.Marshal(req.Contact)
		sealed, err := s.cipher.Seal(b, code)
		if err != nil {
			return nil, false, err
		}
		contactSealed = sealed
	}
	if strings.TrimSpace(req.Summary) != "" {
		sealed, err := s.cipher.Seal([]byte(req.Summary), code)
		if err != nil {
			return nil, false, err
		}
		summarySealed = sealed
	}
	needsJSON, _ := json.Marshal(needs)
	consentJSON, _ := json.Marshal(consent)
	var screeningJSON any
	if req.Screening != nil {
		b, _ := json.Marshal(req.Screening)
		screeningJSON = string(b)
	}

	id := uuid.New().String()
	now := s.now()
	_, err := s.db.Exec(`INSERT INTO cases (id, case_code, source, pathway, urgent, needs, consent, county, ward, latitude, longitude,
		language, screening, contact_encrypted, summary_encrypted, status, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'created',$16,$16)`,
		id, code, req.Source, req.Pathway, req.Urgent, string(needsJSON), string(consentJSON), strings.TrimSpace(req.County),
		strings.TrimSpace(req.Ward), req.Latitude, req.Longitude, req.Language, screeningJSON, contactSealed, summarySealed, now)
	if err != nil {
		return nil, false, fmt.Errorf("failed to store case: %w", err)
	}
	s.event(id, "survivor", "created", fmt.Sprintf("%s via %s", req.Pathway, req.Source))
	c, err := s.caseByID(id)
	if err != nil {
		return nil, false, err
	}
	s.route(c)
	st, err := s.status(c)
	return st, true, err
}

// CreateFromReport opens the case for a report, so every report is followed up.
func (s *CareService) CreateFromReport(r CreateReportRequest) {
	recipient := map[string]string{
		"heal": care.CHP, "hotline_1195": care.Coordinator, "gbvrc": care.Facility,
		"fida": care.Legal, "police_gender_desk": care.Police,
	}[r.Recipient]
	if recipient == "" {
		recipient = care.CHP
	}
	recent := r.WhenHappened == "In the last 3 days"
	sexual := strings.Contains(strings.ToLower(r.IncidentType), "sexual")
	var needs []string
	if sexual && recent {
		needs = append(needs, "medical")
	}
	var contact *ContactDetails
	if r.WantsContact {
		contact = &ContactDetails{Method: strings.ToLower(r.ContactMethod), Detail: r.ContactDetail, SafeTimes: r.SafeTimes}
	}
	county := ""
	if r.County != nil {
		county = *r.County
	}
	_, _, err := s.CreateCase(CreateCaseRequest{
		CaseCode: r.CaseCode, Source: "report", Pathway: care.Report,
		Urgent: r.SafeNow == "No" || (sexual && recent), Needs: needs, Consent: []string{recipient},
		County: county, Latitude: r.Latitude, Longitude: r.Longitude,
		Contact: contact, Summary: strings.TrimSpace(r.IncidentType + ". " + r.WhenHappened + ". " + r.Description),
	})
	if err != nil {
		log.Println("could not open a case for report", r.CaseCode, err)
	}
}

// route sends the first round of alerts for a case.
func (s *CareService) route(c *caseRow) {
	types := care.Responders(c.Pathway, c.Needs, c.Consent)
	if c.Pathway == care.Report {
		for _, t := range c.Consent {
			if t == care.Coordinator {
				types = append(types, care.Coordinator)
			}
		}
	}
	for _, t := range types {
		s.alertNext(c, t, 0)
	}
	// The coordinator desk sees every urgent case at once, and any case nobody could be alerted for.
	if c.Urgent || len(types) == 0 {
		why := "Urgent case opened"
		if len(types) == 0 {
			why = "Case opened with no responder the survivor agreed to: please follow up"
		}
		s.notifyCoordinator(c, why)
	}
}

// alertNext alerts the best partner of a type that has not been tried yet.
func (s *CareService) alertNext(c *caseRow, responder string, level int) {
	partners, byID, err := s.routingPartners()
	if err != nil {
		log.Println("routing partners:", err)
		return
	}
	tried := map[string]bool{}
	rows, err := s.db.Query(`SELECT partner_id FROM case_alerts WHERE case_id = $1 AND responder_type = $2`, c.ID, responder)
	if err == nil {
		for rows.Next() {
			var pid string
			if rows.Scan(&pid) == nil {
				tried[pid] = true
			}
		}
		rows.Close()
	}
	p, ok := care.Pick(partners, responder, c.loc(), tried)
	if !ok {
		s.event(c.ID, "system", "no_partner", responderLabel(responder))
		if responder != care.Coordinator {
			s.notifyCoordinator(c, fmt.Sprintf("No %s available to alert (tried %d). Please arrange this yourself.", responderLabel(responder), len(tried)))
		}
		return
	}
	head := "NEW CASE"
	if level > 0 {
		head = "CASE REASSIGNED TO YOU"
	}
	s.alertTo(c, byID[p.ID], responder, level, head, "system")
}

// alertTo opens an alert for one partner and posts it to its WhatsApp group.
func (s *CareService) alertTo(c *caseRow, partner PartnerRecord, responder string, level int, head, actor string) {
	now := s.now()
	deadline := now.Add(care.Deadline(responder, c.Pathway, c.Urgent))
	_, err := s.db.Exec(`INSERT INTO case_alerts (id, case_id, partner_id, responder_type, escalation_level, deadline_at, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7)`, uuid.New().String(), c.ID, partner.ID, responder, level, deadline, now)
	if err != nil {
		log.Println("case alert:", err)
		return
	}
	kind := "alerted"
	if actor != "system" {
		kind = "referred"
	}
	s.event(c.ID, actor, kind, fmt.Sprintf("%s: %s", responderLabel(responder), partner.Name))
	s.setStatus(c, care.StatusAlerted)
	s.send(c.ID, partner, s.alertText(c, head, responder, deadline))
}

func (s *CareService) notifyCoordinator(c *caseRow, why string) {
	partners, byID, err := s.routingPartners()
	if err != nil {
		return
	}
	p, ok := care.Pick(partners, care.Coordinator, c.loc(), nil)
	if !ok {
		log.Printf("NO COORDINATOR DESK CONFIGURED: %s %s", c.Code, why)
		return
	}
	text := fmt.Sprintf("HEAL-Impact · COORDINATOR · %s%s\n%s\nPathway: %s\nArea: %s\nOpen: %s/care/case?id=%s",
		c.Code, urgentTag(c), why, pathwayLabel(c.Pathway), areaLabel(c), s.appURL, c.ID)
	s.send(c.ID, byID[p.ID], text)
}

func (s *CareService) send(caseID string, p PartnerRecord, text string) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := s.notifier.Send(ctx, p.WhatsAppGroupID, text); err != nil {
		log.Printf("whatsapp to %s failed: %v", p.Name, err)
		if caseID != "" {
			s.event(caseID, "system", "delivery_failed", fmt.Sprintf("%s: %v", p.Name, err))
		}
	}
}

// alertText is what a stakeholder group sees: never the survivor's name, story or contact.
func (s *CareService) alertText(c *caseRow, head, responder string, deadline time.Time) string {
	needs := ""
	if len(c.Needs) > 0 {
		needs = "\nNeeds: " + strings.Join(c.Needs, ", ")
	}
	return fmt.Sprintf("HEAL-Impact · %s · %s%s\nNeeded from you: %s\nPathway: %s%s\nArea: %s\nAccept by: %s EAT\nOpen the case: %s/care/case?id=%s\nReply ACC %s to accept, or PASS %s to pass it on.",
		head, c.Code, urgentTag(c), responderLabel(responder), pathwayLabel(c.Pathway), needs, areaLabel(c),
		deadline.In(eat).Format("Mon 2 Jan 15:04"), s.appURL, c.ID, c.Code, c.Code)
}

func urgentTag(c *caseRow) string {
	if c.Urgent {
		return " (URGENT)"
	}
	return ""
}

func areaLabel(c *caseRow) string {
	switch {
	case c.County != "" && c.Ward != "":
		return c.County + ", " + c.Ward
	case c.County != "":
		return c.County
	default:
		return "not shared (default route)"
	}
}

func responderLabel(t string) string {
	return map[string]string{
		care.CHP: "Community Health Promoter", care.Rescue: "rescue centre / safe house", care.Facility: "GVRC or medical facility",
		care.Police: "police gender desk", care.Counsellor: "counsellor", care.Legal: "legal aid", care.Coordinator: "HEAL coordinator",
	}[t]
}

func pathwayLabel(p string) string {
	return map[string]string{
		care.Emergency: "Emergency", care.FacilityToday: "Facility today (sexual violence within 72 h)",
		care.Refer: "Refer to counsellor", care.CHPFollowUp: "CHP follow-up", care.Report: "Report",
	}[p]
}

// ---------- survivor side ----------

type CaseStatus struct {
	CaseCode  string            `json:"caseCode"`
	Status    string            `json:"status"`
	Pathway   string            `json:"pathway"`
	Timeline  map[string]string `json:"timeline"`
	Feedback  *bool             `json:"feedback"`
	CreatedAt time.Time         `json:"createdAt"`
}

// status is what the survivor sees with their case code: progress only, never details.
func (s *CareService) status(c *caseRow) (*CaseStatus, error) {
	st := &CaseStatus{CaseCode: c.Code, Status: c.Status, Pathway: c.Pathway, CreatedAt: c.CreatedAt, Timeline: map[string]string{"received": c.CreatedAt.Format(time.RFC3339)}}
	if c.FeedbackHelped.Valid {
		v := c.FeedbackHelped.Bool
		st.Feedback = &v
	}
	rows, err := s.db.Query(`SELECT kind, MIN(created_at) FROM case_events WHERE case_id = $1 AND kind IN ('accepted','contacted','seen','follow_up','closed','declined_by_survivor','lost_to_follow_up') GROUP BY kind`, c.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var kind string
		var at time.Time
		if rows.Scan(&kind, &at) == nil {
			st.Timeline[kind] = at.Format(time.RFC3339)
		}
	}
	return st, nil
}

func (s *CareService) StatusByCode(code string) (*CaseStatus, error) {
	c, err := s.caseByCode(code)
	if err != nil {
		return nil, err
	}
	return s.status(c)
}

// Withdraw stops a case at the survivor's request; every alerted partner is told to stand down.
func (s *CareService) Withdraw(code string) (*CaseStatus, error) {
	c, err := s.caseByCode(code)
	if err != nil {
		return nil, err
	}
	if care.IsOpen(c.Status) {
		s.closeAlerts(c, "withdrawn", fmt.Sprintf("HEAL-Impact · %s\nThe survivor has stopped this case. Please take no further action and do not contact them.", c.Code))
		s.db.Exec(`UPDATE cases SET status = $2, closed_at = $3, updated_at = $3 WHERE id = $1`, c.ID, care.StatusDeclined, s.now())
		c.Status = care.StatusDeclined
		s.event(c.ID, "survivor", care.StatusDeclined, "")
	}
	return s.status(c)
}

func (s *CareService) Feedback(code string, helped bool) error {
	c, err := s.caseByCode(code)
	if err != nil {
		return err
	}
	s.db.Exec(`UPDATE cases SET feedback_helped = $2 WHERE id = $1`, c.ID, helped)
	s.event(c.ID, "survivor", "feedback", map[bool]string{true: "got the help needed", false: "did not get the help needed"}[helped])
	if !helped {
		s.notifyCoordinator(c, "The survivor says they did NOT get the help they needed. Please review this case.")
	}
	return nil
}

// closeAlerts ends every open alert on a case and tells those partners.
func (s *CareService) closeAlerts(c *caseRow, status, text string) {
	_, byID, _ := s.routingPartners()
	rows, err := s.db.Query(`SELECT id, partner_id FROM case_alerts WHERE case_id = $1 AND status IN ('alerted','accepted')`, c.ID)
	if err != nil {
		return
	}
	type open struct{ id, partner string }
	var list []open
	for rows.Next() {
		var o open
		if rows.Scan(&o.id, &o.partner) == nil {
			list = append(list, o)
		}
	}
	rows.Close()
	for _, o := range list {
		s.db.Exec(`UPDATE case_alerts SET status = $2, responded_at = COALESCE(responded_at, $3) WHERE id = $1`, o.id, status, s.now())
		if text != "" {
			s.send(c.ID, byID[o.partner], text)
		}
	}
}

// ---------- partner side ----------

type CaseAlertView struct {
	ID            string     `json:"id"`
	PartnerID     string     `json:"partnerId"`
	PartnerName   string     `json:"partnerName"`
	ResponderType string     `json:"responderType"`
	Status        string     `json:"status"`
	Level         int        `json:"escalationLevel"`
	DeadlineAt    time.Time  `json:"deadlineAt"`
	RespondedAt   *time.Time `json:"respondedAt"`
	Note          string     `json:"note"`
	CreatedAt     time.Time  `json:"createdAt"`
}

type CaseEventView struct {
	Actor     string    `json:"actor"`
	Kind      string    `json:"kind"`
	Detail    string    `json:"detail"`
	CreatedAt time.Time `json:"createdAt"`
}

type CaseView struct {
	ID             string            `json:"id"`
	CaseCode       string            `json:"caseCode"`
	Source         string            `json:"source"`
	Pathway        string            `json:"pathway"`
	Urgent         bool              `json:"urgent"`
	Needs          []string          `json:"needs"`
	Consent        []string          `json:"consent"`
	County         string            `json:"county"`
	Ward           string            `json:"ward"`
	Language       string            `json:"language"`
	Screening      *ScreeningSummary `json:"screening"`
	Status         string            `json:"status"`
	Outcome        string            `json:"outcome"`
	FailedAttempts int               `json:"failedAttempts"`
	FollowUpAt     *time.Time        `json:"followUpAt"`
	Feedback       *bool             `json:"feedback"`
	CreatedAt      time.Time         `json:"createdAt"`
	UpdatedAt      time.Time         `json:"updatedAt"`
	MyAlert        *CaseAlertView    `json:"myAlert"`
	Alerts         []CaseAlertView   `json:"alerts,omitempty"`
	Events         []CaseEventView   `json:"events,omitempty"`
	Contact        *ContactDetails   `json:"contact,omitempty"`
	Summary        string            `json:"summary,omitempty"`
}

func (c *caseRow) view() CaseView {
	v := CaseView{ID: c.ID, CaseCode: c.Code, Source: c.Source, Pathway: c.Pathway, Urgent: c.Urgent, Needs: c.Needs, Consent: c.Consent,
		County: c.County, Ward: c.Ward, Language: c.Language, Screening: c.Screening, Status: c.Status, Outcome: c.Outcome,
		FailedAttempts: c.FailedAttempts, CreatedAt: c.CreatedAt, UpdatedAt: c.UpdatedAt}
	if c.FollowUpAt.Valid {
		t := c.FollowUpAt.Time
		v.FollowUpAt = &t
	}
	if c.FeedbackHelped.Valid {
		b := c.FeedbackHelped.Bool
		v.Feedback = &b
	}
	if v.Needs == nil {
		v.Needs = []string{}
	}
	if v.Consent == nil {
		v.Consent = []string{}
	}
	return v
}

func (s *CareService) alerts(caseID string) ([]CaseAlertView, error) {
	rows, err := s.db.Query(`SELECT a.id, a.partner_id, p.name, a.responder_type, a.status, a.escalation_level, a.deadline_at, a.responded_at, a.note, a.created_at
		FROM case_alerts a JOIN partners p ON p.id = a.partner_id WHERE a.case_id = $1 ORDER BY a.created_at`, caseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []CaseAlertView{}
	for rows.Next() {
		var a CaseAlertView
		var responded sql.NullTime
		if err := rows.Scan(&a.ID, &a.PartnerID, &a.PartnerName, &a.ResponderType, &a.Status, &a.Level, &a.DeadlineAt, &responded, &a.Note, &a.CreatedAt); err != nil {
			return nil, err
		}
		if responded.Valid {
			t := responded.Time
			a.RespondedAt = &t
		}
		out = append(out, a)
	}
	return out, nil
}

// myAlert is the latest alert for this partner on the case.
func myAlert(alerts []CaseAlertView, partnerID string) *CaseAlertView {
	var mine *CaseAlertView
	for i := range alerts {
		if alerts[i].PartnerID == partnerID {
			mine = &alerts[i]
		}
	}
	return mine
}

// ListCases returns the Caseload: every case for the coordinator desk, only
// cases routed to their own organisation for partner staff.
func (s *CareService) ListCases(a *PartnerAccount, includeClosed bool) ([]CaseView, error) {
	where := ""
	args := []any{}
	if !a.SeesAllCases() {
		where = ` WHERE id IN (SELECT case_id FROM case_alerts WHERE partner_id = $1)`
		args = append(args, a.PartnerID)
	}
	if !includeClosed {
		if where == "" {
			where = " WHERE"
		} else {
			where += " AND"
		}
		where += ` status NOT IN ('closed','declined_by_survivor','lost_to_follow_up')`
	}
	rows, err := s.db.Query(caseSelect+where+` ORDER BY urgent DESC, created_at DESC LIMIT 500`, args...)
	if err != nil {
		return nil, err
	}
	var list []*caseRow
	for rows.Next() {
		c, err := scanCase(rows)
		if err != nil {
			rows.Close()
			return nil, err
		}
		list = append(list, c)
	}
	rows.Close()
	out := []CaseView{}
	for _, c := range list {
		v := c.view()
		alerts, err := s.alerts(c.ID)
		if err != nil {
			return nil, err
		}
		if a.SeesAllCases() {
			v.Alerts = alerts
		} else {
			v.MyAlert = myAlert(alerts, a.PartnerID)
			if v.MyAlert != nil && v.MyAlert.Status == "passed" {
				continue
			}
		}
		out = append(out, v)
	}
	return out, nil
}

func (s *CareService) canSee(a *PartnerAccount, caseID string) bool {
	if a.SeesAllCases() {
		return true
	}
	var n int
	s.db.QueryRow(`SELECT COUNT(*) FROM case_alerts WHERE case_id = $1 AND partner_id = $2`, caseID, a.PartnerID).Scan(&n)
	return n > 0
}

// GetCase returns one case. Contact details and the summary are unsealed only
// for the coordinator desk or a partner that has accepted the case. Every
// view is logged.
func (s *CareService) GetCase(a *PartnerAccount, id string) (*CaseView, error) {
	if !s.canSee(a, id) {
		return nil, ErrCaseNotFound
	}
	c, err := s.caseByID(id)
	if err != nil {
		return nil, err
	}
	v := c.view()
	alerts, err := s.alerts(id)
	if err != nil {
		return nil, err
	}
	v.Alerts = alerts
	v.MyAlert = myAlert(alerts, a.PartnerID)
	accepted := v.MyAlert != nil && (v.MyAlert.Status == "accepted" || v.MyAlert.Status == "done")
	if a.SeesAllCases() || accepted {
		if c.ContactSealed.Valid {
			if b, err := s.cipher.Open(c.ContactSealed.String, c.Code); err == nil {
				var contact ContactDetails
				if json.Unmarshal(b, &contact) == nil {
					v.Contact = &contact
				}
			}
		}
		if c.SummarySealed.Valid {
			if b, err := s.cipher.Open(c.SummarySealed.String, c.Code); err == nil {
				v.Summary = string(b)
			}
		}
	}
	rows, err := s.db.Query(`SELECT e.actor, e.kind, e.detail, e.created_at FROM case_events e WHERE e.case_id = $1 AND e.kind <> 'viewed' ORDER BY e.created_at`, id)
	if err == nil {
		v.Events = []CaseEventView{}
		for rows.Next() {
			var e CaseEventView
			if rows.Scan(&e.Actor, &e.Kind, &e.Detail, &e.CreatedAt) == nil {
				e.Actor = s.actorName(e.Actor)
				v.Events = append(v.Events, e)
			}
		}
		rows.Close()
	}
	s.event(id, "account:"+a.ID, "viewed", "")
	return &v, nil
}

func (s *CareService) actorName(actor string) string {
	switch {
	case strings.HasPrefix(actor, "account:"):
		var name, partner string
		s.db.QueryRow(`SELECT a.name, COALESCE(p.name, 'HEAL') FROM partner_accounts a LEFT JOIN partners p ON p.id = a.partner_id WHERE a.id = $1`,
			strings.TrimPrefix(actor, "account:")).Scan(&name, &partner)
		if name != "" {
			return name + " (" + partner + ")"
		}
	case strings.HasPrefix(actor, "group:"):
		var name string
		s.db.QueryRow(`SELECT name FROM partners WHERE id = $1`, strings.TrimPrefix(actor, "group:")).Scan(&name)
		if name != "" {
			return name + " (WhatsApp)"
		}
	}
	return actor
}

type CaseAction struct {
	Action string `json:"action" binding:"required"` // accept, pass, contacted, attempt_failed, seen, follow_up, close, note, refer
	// refer: the partner chosen from the directory, the service, and whether the survivor agreed.
	PartnerID        string `json:"partnerId"`
	Service          string `json:"service"`
	ConsentConfirmed bool   `json:"consentConfirmed"`
	Note             string `json:"note"`
	Outcome          string `json:"outcome"`
	FollowUpAt       string `json:"followUpAt"` // YYYY-MM-DD
}

// Act records what a partner did. actor is "account:<id>" or "group:<partner id>".
func (s *CareService) Act(a *PartnerAccount, caseID string, in CaseAction) (*CaseView, error) {
	if !s.canSee(a, caseID) {
		return nil, ErrCaseNotFound
	}
	if err := s.act("account:"+a.ID, a.PartnerID, a.SeesAllCases(), caseID, in); err != nil {
		return nil, err
	}
	return s.GetCase(a, caseID)
}

func (s *CareService) act(actor, partnerID string, coordinator bool, caseID string, in CaseAction) error {
	c, err := s.caseByID(caseID)
	if err != nil {
		return err
	}
	if !care.IsOpen(c.Status) && in.Action != "note" {
		return fmt.Errorf("%w: this case is already %s", ErrInvalidCase, strings.ReplaceAll(c.Status, "_", " "))
	}
	note := strings.TrimSpace(in.Note)
	if len(note) > 1000 {
		return fmt.Errorf("%w: note is too long", ErrInvalidCase)
	}
	// The partner's own alert on this case, if any.
	var alertID, alertStatus, responder string
	if partnerID != "" {
		s.db.QueryRow(`SELECT id, status, responder_type FROM case_alerts WHERE case_id = $1 AND partner_id = $2 ORDER BY created_at DESC LIMIT 1`,
			caseID, partnerID).Scan(&alertID, &alertStatus, &responder)
	}
	needsAccepted := func() error {
		if coordinator || alertStatus == "accepted" || alertStatus == "done" {
			return nil
		}
		return fmt.Errorf("%w: accept the case first", ErrInvalidCase)
	}
	now := s.now()

	switch in.Action {
	case "accept":
		if alertID == "" {
			return fmt.Errorf("%w: this case was not sent to your organisation", ErrForbidden)
		}
		res, _ := s.db.Exec(`UPDATE case_alerts SET status = 'accepted', responded_at = $2 WHERE id = $1 AND status IN ('alerted','expired')`, alertID, now)
		if n, _ := res.RowsAffected(); n == 0 {
			return fmt.Errorf("%w: this alert is %s", ErrInvalidCase, alertStatus)
		}
		s.event(caseID, actor, care.StatusAccepted, responderLabel(responder))
		s.setStatus(c, care.StatusAccepted)
	case "pass":
		if alertID == "" || (alertStatus != "alerted" && alertStatus != "accepted") {
			return fmt.Errorf("%w: there is no open alert to pass", ErrInvalidCase)
		}
		if note == "" {
			return fmt.Errorf("%w: give a reason for passing the case on", ErrInvalidCase)
		}
		s.db.Exec(`UPDATE case_alerts SET status = 'passed', responded_at = $2, note = $3 WHERE id = $1`, alertID, now, note)
		s.event(caseID, actor, "passed", note)
		s.alertNext(c, responder, 1)
	case "contacted":
		if err := needsAccepted(); err != nil {
			return err
		}
		s.event(caseID, actor, care.StatusContacted, note)
		s.setStatus(c, care.StatusContacted)
	case "attempt_failed":
		if err := needsAccepted(); err != nil {
			return err
		}
		c.FailedAttempts++
		s.db.Exec(`UPDATE cases SET failed_attempts = $2, updated_at = $3 WHERE id = $1`, caseID, c.FailedAttempts, now)
		s.event(caseID, actor, "attempt_failed", fmt.Sprintf("attempt %d of %d. %s", c.FailedAttempts, care.MaxFailedContact, note))
		// Lost to follow-up after 3 tries over at least 14 days (Workflow 6).
		if c.FailedAttempts >= care.MaxFailedContact && now.Sub(c.CreatedAt) >= 14*24*time.Hour {
			s.closeAlerts(c, "done", "")
			s.db.Exec(`UPDATE cases SET status = $2, closed_at = $3, updated_at = $3 WHERE id = $1`, caseID, care.StatusLost, now)
			s.event(caseID, "system", care.StatusLost, "")
			s.notifyCoordinator(c, "Case lost to follow-up after 3 failed contact attempts.")
		}
	case "seen":
		if err := needsAccepted(); err != nil {
			return err
		}
		if alertID != "" {
			s.db.Exec(`UPDATE case_alerts SET status = 'done' WHERE id = $1`, alertID)
		}
		s.event(caseID, actor, care.StatusSeen, strings.TrimSpace(responderLabel(responder)+" "+note))
		s.setStatus(c, care.StatusSeen)
		// Hand aftercare back to the CHP (Workflow 8), if the survivor agreed to one.
		if responder != care.CHP && contains(c.Consent, care.CHP) {
			var openCHP int
			s.db.QueryRow(`SELECT COUNT(*) FROM case_alerts WHERE case_id = $1 AND responder_type = $2 AND status IN ('alerted','accepted')`, caseID, care.CHP).Scan(&openCHP)
			if openCHP == 0 {
				s.alertNext(c, care.CHP, 0)
			}
		}
	case "follow_up":
		if err := needsAccepted(); err != nil {
			return err
		}
		day, err := time.ParseInLocation("2006-01-02", in.FollowUpAt, eat)
		if err != nil || day.Before(now.Add(-24*time.Hour)) {
			return fmt.Errorf("%w: choose a follow-up date from today on", ErrInvalidCase)
		}
		at := day.Add(9 * time.Hour) // 09:00 EAT
		s.db.Exec(`UPDATE cases SET follow_up_at = $2, follow_up_reminded_at = NULL, updated_at = $3 WHERE id = $1`, caseID, at, now)
		s.event(caseID, actor, care.StatusFollowUp, strings.TrimSpace(in.FollowUpAt+" "+note))
		s.setStatus(c, care.StatusFollowUp)
	case "close":
		if err := needsAccepted(); err != nil {
			return err
		}
		outcome := strings.TrimSpace(in.Outcome)
		if outcome == "" {
			return fmt.Errorf("%w: record the outcome before closing", ErrInvalidCase)
		}
		s.closeAlerts(c, "done", "")
		s.db.Exec(`UPDATE cases SET status = $2, outcome = $3, closed_at = $4, updated_at = $4 WHERE id = $1`, caseID, care.StatusClosed, outcome, now)
		s.event(caseID, actor, care.StatusClosed, strings.TrimSpace(outcome+". "+note))
	case "refer":
		if err := needsAccepted(); err != nil {
			return err
		}
		return s.refer(c, actor, partnerID, in)
	case "note":
		if note == "" {
			return fmt.Errorf("%w: the note is empty", ErrInvalidCase)
		}
		s.event(caseID, actor, "note", note)
	default:
		return fmt.Errorf("%w: unknown action %q", ErrInvalidCase, in.Action)
	}
	return nil
}

func contains(list []string, v string) bool {
	for _, x := range list {
		if x == v {
			return true
		}
	}
	return false
}

// GroupReply handles "ACC <code>", "PASS <code> <reason>" and "SEEN <code>"
// typed in a stakeholder WhatsApp group (gateway webhook).
func (s *CareService) GroupReply(groupID, text string) (string, error) {
	fields := strings.Fields(strings.ToUpper(strings.TrimSpace(text)))
	if len(fields) < 2 {
		return "", nil
	}
	action := map[string]string{"ACC": "accept", "ACCEPT": "accept", "PASS": "pass", "SEEN": "seen"}[fields[0]]
	if action == "" {
		return "", nil
	}
	code := fields[1]
	if !strings.Contains(code, "-") && len(code) == 9 && strings.HasPrefix(code, "HEAL") {
		code = "HEAL-" + code[4:7] + "-" + code[7:]
	}
	var partnerID string
	if err := s.db.QueryRow(`SELECT id FROM partners WHERE whatsapp_group_id = $1 AND active LIMIT 1`, groupID).Scan(&partnerID); err != nil {
		return "", fmt.Errorf("%w: this group is not a registered partner", ErrForbidden)
	}
	c, err := s.caseByCode(code)
	if err != nil {
		return "", err
	}
	note := ""
	if action == "pass" {
		note = strings.TrimSpace(strings.Join(strings.Fields(text)[2:], " "))
		if note == "" {
			note = "passed from WhatsApp"
		}
	}
	if err := s.act("group:"+partnerID, partnerID, false, c.ID, CaseAction{Action: action, Note: note}); err != nil {
		return "", err
	}
	return fmt.Sprintf("Recorded: %s %s", strings.ToLower(fields[0]), c.Code), nil
}

// ---------- escalation worker ----------

// RunEscalations sends reminders halfway to each deadline, moves expired alerts
// to the next partner, and reminds partners of follow-ups that are due.
func (s *CareService) RunEscalations() {
	now := s.now()
	_, byID, err := s.routingPartners()
	if err != nil {
		log.Println("escalations:", err)
		return
	}

	type alertRow struct {
		id, caseID, partnerID, responder string
		level                            int
		deadline, created                time.Time
	}
	load := func(q string, args ...any) []alertRow {
		rows, err := s.db.Query(q, args...)
		if err != nil {
			log.Println("escalations:", err)
			return nil
		}
		defer rows.Close()
		var out []alertRow
		for rows.Next() {
			var r alertRow
			if rows.Scan(&r.id, &r.caseID, &r.partnerID, &r.responder, &r.level, &r.deadline, &r.created) == nil {
				out = append(out, r)
			}
		}
		return out
	}
	cols := `SELECT id, case_id, partner_id, responder_type, escalation_level, deadline_at, created_at FROM case_alerts`

	// 1. Reminder halfway to the deadline.
	for _, r := range load(cols+` WHERE status = 'alerted' AND reminded_at IS NULL AND created_at + (deadline_at - created_at) / 2 <= $1 AND deadline_at > $1`, now) {
		c, err := s.caseByID(r.caseID)
		if err != nil {
			continue
		}
		s.db.Exec(`UPDATE case_alerts SET reminded_at = $2 WHERE id = $1`, r.id, now)
		s.event(r.caseID, "system", "reminded", byID[r.partnerID].Name)
		s.send(r.caseID, byID[r.partnerID], s.alertText(c, "REMINDER, NOT YET ACCEPTED", r.responder, r.deadline))
	}

	// 2. Past the deadline: move to the next-nearest partner and tell the coordinator.
	for _, r := range load(cols+` WHERE status = 'alerted' AND deadline_at <= $1`, now) {
		c, err := s.caseByID(r.caseID)
		if err != nil {
			continue
		}
		s.db.Exec(`UPDATE case_alerts SET status = 'expired' WHERE id = $1`, r.id)
		s.event(r.caseID, "system", "expired", byID[r.partnerID].Name)
		if !care.IsOpen(c.Status) {
			continue
		}
		why := fmt.Sprintf("%s did not accept in time; moving the case to the next %s.", byID[r.partnerID].Name, responderLabel(r.responder))
		if r.level >= 1 {
			why += " Second miss: please call both partners and raise it with the county GBV focal person."
		}
		s.notifyCoordinator(c, why)
		s.alertNext(c, r.responder, r.level+1)
	}

	// 3. Follow-ups that are due.
	rows, err := s.db.Query(`SELECT id FROM cases WHERE follow_up_at <= $1 AND follow_up_reminded_at IS NULL AND status NOT IN ('closed','declined_by_survivor','lost_to_follow_up')`, now)
	if err != nil {
		return
	}
	var due []string
	for rows.Next() {
		var id string
		if rows.Scan(&id) == nil {
			due = append(due, id)
		}
	}
	rows.Close()
	for _, id := range due {
		c, err := s.caseByID(id)
		if err != nil {
			continue
		}
		s.db.Exec(`UPDATE cases SET follow_up_reminded_at = $2 WHERE id = $1`, id, now)
		var partnerID string
		s.db.QueryRow(`SELECT partner_id FROM case_alerts WHERE case_id = $1 AND status IN ('accepted','done') ORDER BY (responder_type = 'chp') DESC, created_at DESC LIMIT 1`, id).Scan(&partnerID)
		text := fmt.Sprintf("HEAL-Impact · FOLLOW-UP DUE · %s\nPlease check in with the survivor today through their safe channel, re-screen if due, and update the case.\nOpen: %s/care/case?id=%s", c.Code, s.appURL, c.ID)
		if p, ok := byID[partnerID]; ok {
			s.send(id, p, text)
		} else {
			s.notifyCoordinator(c, "Follow-up is due and no partner holds this case.")
		}
		s.event(id, "system", "follow_up_due", "")
	}
}

// StartWorker runs RunEscalations every minute until ctx ends.
func (s *CareService) StartWorker(ctx context.Context) {
	go func() {
		t := time.NewTicker(time.Minute)
		defer t.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-t.C:
				s.RunEscalations()
			}
		}
	}()
}

// ---------- insights ----------

type CountyInsight struct {
	County  string `json:"county"`
	Cases   *int   `json:"cases"`
	Urgent  *int   `json:"urgent"`
	Seen    *int   `json:"seen"`
	Closed  *int   `json:"closed"`
	Overdue *int   `json:"overdue"`
}

type Insights struct {
	SmallCell        int             `json:"smallCell"`
	Funnel           []LabeledCount  `json:"funnel"`
	ByPathway        []LabeledCount  `json:"byPathway"`
	BySource         []LabeledCount  `json:"bySource"`
	Monthly          []MonthlyCount  `json:"monthly"`
	Counties         []CountyInsight `json:"counties"`
	MedianAcceptMins *float64        `json:"medianAcceptMinutes"`
	OverdueAlerts    int             `json:"overdueAlerts"`
	HelpedYes        int             `json:"helpedYes"`
	HelpedNo         int             `json:"helpedNo"`
}

type LabeledCount struct {
	Label string `json:"label"`
	Count int    `json:"count"`
}

type MonthlyCount struct {
	Month  string `json:"month"`
	Cases  int    `json:"cases"`
	Urgent int    `json:"urgent"`
	Closed int    `json:"closed"`
}

const smallCell = 5

func suppress(n int) *int {
	if n < smallCell {
		return nil
	}
	return &n
}

func (s *CareService) labeled(q string, args ...any) []LabeledCount {
	out := []LabeledCount{}
	rows, err := s.db.Query(q, args...)
	if err != nil {
		return out
	}
	defer rows.Close()
	for rows.Next() {
		var l LabeledCount
		if rows.Scan(&l.Label, &l.Count) == nil {
			out = append(out, l)
		}
	}
	return out
}

// Insights are aggregate numbers only. County counts under 5 are suppressed so
// nobody can be identified.
func (s *CareService) Insights() (*Insights, error) {
	in := &Insights{SmallCell: smallCell}
	var total, accepted, contacted, seen, closed int
	s.db.QueryRow(`SELECT COUNT(*) FROM cases`).Scan(&total)
	stage := func(kinds string) int {
		var n int
		s.db.QueryRow(`SELECT COUNT(DISTINCT case_id) FROM case_events WHERE kind IN (` + kinds + `)`).Scan(&n)
		return n
	}
	accepted = stage(`'accepted'`)
	contacted = stage(`'contacted'`)
	seen = stage(`'seen'`)
	closed = stage(`'closed'`)
	in.Funnel = []LabeledCount{{"Cases opened", total}, {"Accepted by a partner", accepted}, {"Contacted safely", contacted}, {"Seen by a service", seen}, {"Closed with an outcome", closed}}
	in.ByPathway = s.labeled(`SELECT pathway, COUNT(*) FROM cases GROUP BY pathway ORDER BY COUNT(*) DESC`)
	in.BySource = s.labeled(`SELECT source, COUNT(*) FROM cases GROUP BY source ORDER BY COUNT(*) DESC`)

	rows, err := s.db.Query(`SELECT to_char(date_trunc('month', created_at AT TIME ZONE 'Africa/Nairobi'), 'YYYY-MM') AS m, COUNT(*), COUNT(*) FILTER (WHERE urgent), COUNT(*) FILTER (WHERE status = 'closed')
		FROM cases WHERE created_at >= $1 GROUP BY m ORDER BY m`, s.now().AddDate(0, -11, 0))
	if err != nil {
		return nil, err
	}
	in.Monthly = []MonthlyCount{}
	for rows.Next() {
		var m MonthlyCount
		if rows.Scan(&m.Month, &m.Cases, &m.Urgent, &m.Closed) == nil {
			in.Monthly = append(in.Monthly, m)
		}
	}
	rows.Close()

	rows, err = s.db.Query(`SELECT COALESCE(NULLIF(c.county, ''), 'Not shared'), COUNT(*), COUNT(*) FILTER (WHERE c.urgent),
		COUNT(*) FILTER (WHERE c.status IN ('seen','follow_up','closed')), COUNT(*) FILTER (WHERE c.status = 'closed'),
		COUNT(DISTINCT c.id) FILTER (WHERE EXISTS (SELECT 1 FROM case_alerts a WHERE a.case_id = c.id AND a.status = 'expired'))
		FROM cases c GROUP BY 1 ORDER BY 2 DESC`)
	if err != nil {
		return nil, err
	}
	in.Counties = []CountyInsight{}
	for rows.Next() {
		var county string
		var cases, urgent, seenN, closedN, overdue int
		if rows.Scan(&county, &cases, &urgent, &seenN, &closedN, &overdue) == nil {
			in.Counties = append(in.Counties, CountyInsight{County: county, Cases: suppress(cases), Urgent: suppress(urgent), Seen: suppress(seenN), Closed: suppress(closedN), Overdue: suppress(overdue)})
		}
	}
	rows.Close()

	var median sql.NullFloat64
	s.db.QueryRow(`SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (e.first - c.created_at)) / 60)
		FROM cases c JOIN (SELECT case_id, MIN(created_at) AS first FROM case_events WHERE kind = 'accepted' GROUP BY case_id) e ON e.case_id = c.id`).Scan(&median)
	if median.Valid {
		m := math.Round(median.Float64*10) / 10
		in.MedianAcceptMins = &m
	}
	s.db.QueryRow(`SELECT COUNT(*) FROM case_alerts WHERE status = 'alerted' AND deadline_at <= $1`, s.now()).Scan(&in.OverdueAlerts)
	s.db.QueryRow(`SELECT COUNT(*) FILTER (WHERE feedback_helped), COUNT(*) FILTER (WHERE feedback_helped = false) FROM cases`).Scan(&in.HelpedYes, &in.HelpedNo)
	return in, nil
}
