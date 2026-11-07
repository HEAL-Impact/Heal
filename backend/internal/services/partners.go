package services

import (
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
)

// Partner organisations: who they are, what they offer and where they are.
// Partners register themselves (status 'pending'); HEAL approves them before
// they receive any case. Only approved, active partners are routed to.

const (
	PartnerPending  = "pending"
	PartnerApproved = "approved"
	PartnerRejected = "rejected"
)

// Kinds of organisation (separate from the services they provide).
var orgTypes = map[string]bool{
	"government":  true, // e.g. police gender desk, county hospital
	"ngo":         true,
	"cbo":         true,
	"faith_based": true,
	"private":     true,
	"community":   true, // CHP / community health unit
}

type PartnerRecord struct {
	ID                 string     `json:"id"`
	Name               string     `json:"name"`
	Type               string     `json:"type"`
	OrgType            string     `json:"orgType"`
	Services           []string   `json:"services"`
	County             string     `json:"county"`
	SubCounty          string     `json:"subCounty"`
	Ward               string     `json:"ward"`
	Landmark           string     `json:"landmark"`
	Latitude           *float64   `json:"latitude"`
	Longitude          *float64   `json:"longitude"`
	Phone              string     `json:"phone"`
	Email              string     `json:"email"`
	Hours              string     `json:"hours"`
	RegistrationNumber string     `json:"registrationNumber"`
	WhatsAppGroupID    string     `json:"whatsappGroupId"`
	FocalPerson        string     `json:"focalPerson"`
	IsDefault          bool       `json:"isDefault"`
	Active             bool       `json:"active"`
	Status             string     `json:"status"`
	ReviewedAt         *time.Time `json:"reviewedAt"`
	ReviewNote         string     `json:"reviewNote"`
	CreatedAt          time.Time  `json:"createdAt"`
}

type PartnerInput struct {
	Name               string   `json:"name" binding:"required,max=150"`
	Type               string   `json:"type" binding:"required"`
	OrgType            string   `json:"orgType"`
	Services           []string `json:"services"`
	County             string   `json:"county"`
	SubCounty          string   `json:"subCounty"`
	Ward               string   `json:"ward"`
	Landmark           string   `json:"landmark"`
	Latitude           *float64 `json:"latitude"`
	Longitude          *float64 `json:"longitude"`
	Phone              string   `json:"phone"`
	Email              string   `json:"email"`
	Hours              string   `json:"hours"`
	RegistrationNumber string   `json:"registrationNumber"`
	WhatsAppGroupID    string   `json:"whatsappGroupId"`
	FocalPerson        string   `json:"focalPerson"`
	IsDefault          bool     `json:"isDefault"`
	Active             *bool    `json:"active"`
}

const partnerSelect = `SELECT id, name, type, org_type, services, county, sub_county, ward, landmark, latitude, longitude,
	phone, email, hours, registration_number, whatsapp_group_id, focal_person, is_default, active, status, reviewed_at, review_note, created_at FROM partners`

func scanPartner(row interface{ Scan(...any) error }) (*PartnerRecord, error) {
	var p PartnerRecord
	var services []byte
	var reviewed sql.NullTime
	err := row.Scan(&p.ID, &p.Name, &p.Type, &p.OrgType, &services, &p.County, &p.SubCounty, &p.Ward, &p.Landmark, &p.Latitude, &p.Longitude,
		&p.Phone, &p.Email, &p.Hours, &p.RegistrationNumber, &p.WhatsAppGroupID, &p.FocalPerson, &p.IsDefault, &p.Active, &p.Status, &reviewed, &p.ReviewNote, &p.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrCaseNotFound
	}
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal(services, &p.Services)
	if p.Services == nil {
		p.Services = []string{}
	}
	if reviewed.Valid {
		t := reviewed.Time
		p.ReviewedAt = &t
	}
	return &p, nil
}

func (s *CareService) ListPartners() ([]PartnerRecord, error) {
	rows, err := s.db.Query(partnerSelect + ` ORDER BY (status = 'pending') DESC, county, type, name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []PartnerRecord{}
	for rows.Next() {
		p, err := scanPartner(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *p)
	}
	return out, nil
}

func (s *CareService) getPartner(id string) (*PartnerRecord, error) {
	return scanPartner(s.db.QueryRow(partnerSelect+` WHERE id = $1`, id))
}

func roundCoord(v *float64) *float64 {
	if v == nil {
		return nil
	}
	r := math.Round(*v*100) / 100
	return &r
}

// clean validates and tidies partner details shared by admin edits and self-registration.
func cleanPartner(in *PartnerInput, selfRegistered bool) error {
	t := func(v *string) { *v = strings.Join(strings.Fields(*v), " ") }
	for _, v := range []*string{&in.Name, &in.County, &in.SubCounty, &in.Ward, &in.Landmark, &in.Phone, &in.Hours, &in.RegistrationNumber, &in.FocalPerson} {
		t(v)
	}
	in.Email = strings.ToLower(strings.TrimSpace(in.Email))
	in.WhatsAppGroupID = strings.TrimSpace(in.WhatsAppGroupID)
	if in.Name == "" {
		return fmt.Errorf("%w: organisation name is required", ErrInvalidCase)
	}
	if !care.IsResponderType(in.Type) || (selfRegistered && in.Type == care.Coordinator) {
		return fmt.Errorf("%w: choose the main service you provide", ErrInvalidCase)
	}
	if in.OrgType != "" && !orgTypes[in.OrgType] {
		return fmt.Errorf("%w: unknown organisation type", ErrInvalidCase)
	}
	services := []string{}
	seen := map[string]bool{in.Type: true}
	for _, sv := range in.Services {
		if care.IsResponderType(sv) && sv != care.Coordinator && !seen[sv] {
			seen[sv] = true
			services = append(services, sv)
		}
	}
	in.Services = services
	if (in.Latitude == nil) != (in.Longitude == nil) {
		return fmt.Errorf("%w: give both latitude and longitude, or neither", ErrInvalidCase)
	}
	if in.Latitude != nil && (*in.Latitude < -5.5 || *in.Latitude > 5.5 || *in.Longitude < 33 || *in.Longitude > 42.5) {
		return fmt.Errorf("%w: the location must be in Kenya", ErrInvalidCase)
	}
	in.Latitude, in.Longitude = roundCoord(in.Latitude), roundCoord(in.Longitude)
	if selfRegistered {
		if in.County == "" {
			return fmt.Errorf("%w: choose your county", ErrInvalidCase)
		}
		if len(strings.Map(func(r rune) rune {
			if r >= '0' && r <= '9' {
				return r
			}
			return -1
		}, in.Phone)) < 9 {
			return fmt.Errorf("%w: give a phone number the HEAL team can call", ErrInvalidCase)
		}
		in.IsDefault = false
	}
	return nil
}

func (s *CareService) SavePartner(id string, in PartnerInput) (*PartnerRecord, error) {
	if err := cleanPartner(&in, false); err != nil {
		return nil, err
	}
	active := true
	if in.Active != nil {
		active = *in.Active
	}
	services, _ := json.Marshal(in.Services)
	if id == "" {
		id = uuid.New().String()
		_, err := s.db.Exec(`INSERT INTO partners (id, name, type, org_type, services, county, sub_county, ward, landmark, latitude, longitude,
			phone, email, hours, registration_number, whatsapp_group_id, focal_person, is_default, active, status, reviewed_at)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'approved',NOW())`,
			id, in.Name, in.Type, in.OrgType, string(services), in.County, in.SubCounty, in.Ward, in.Landmark, in.Latitude, in.Longitude,
			in.Phone, in.Email, in.Hours, in.RegistrationNumber, in.WhatsAppGroupID, in.FocalPerson, in.IsDefault, active)
		if err != nil {
			return nil, err
		}
	} else {
		res, err := s.db.Exec(`UPDATE partners SET name=$2, type=$3, org_type=$4, services=$5, county=$6, sub_county=$7, ward=$8, landmark=$9,
			latitude=$10, longitude=$11, phone=$12, email=$13, hours=$14, registration_number=$15, whatsapp_group_id=$16, focal_person=$17,
			is_default=$18, active=$19 WHERE id=$1`,
			id, in.Name, in.Type, in.OrgType, string(services), in.County, in.SubCounty, in.Ward, in.Landmark, in.Latitude, in.Longitude,
			in.Phone, in.Email, in.Hours, in.RegistrationNumber, in.WhatsAppGroupID, in.FocalPerson, in.IsDefault, active)
		if err != nil {
			return nil, err
		}
		if n, _ := res.RowsAffected(); n == 0 {
			return nil, ErrCaseNotFound
		}
	}
	return s.getPartner(id)
}

// RegisterPartner saves a self-registered organisation as pending review.
func (s *CareService) RegisterPartner(in PartnerInput) (*PartnerRecord, error) {
	if err := cleanPartner(&in, true); err != nil {
		return nil, err
	}
	services, _ := json.Marshal(in.Services)
	id := uuid.New().String()
	_, err := s.db.Exec(`INSERT INTO partners (id, name, type, org_type, services, county, sub_county, ward, landmark, latitude, longitude,
		phone, email, hours, registration_number, whatsapp_group_id, focal_person, is_default, active, status)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,FALSE,FALSE,'pending')`,
		id, in.Name, in.Type, in.OrgType, string(services), in.County, in.SubCounty, in.Ward, in.Landmark, in.Latitude, in.Longitude,
		in.Phone, in.Email, in.Hours, in.RegistrationNumber, in.WhatsAppGroupID, in.FocalPerson)
	if err != nil {
		return nil, err
	}
	p, err := s.getPartner(id)
	if err != nil {
		return nil, err
	}
	s.notifyDesk(fmt.Sprintf("HEAL-Impact · NEW PARTNER TO REVIEW\n%s (%s, %s)\n%s%s\nReview: %s/partners/admin",
		p.Name, responderLabel(p.Type), orgLabel(p.OrgType), p.County, prefixed(", ", p.Ward), s.appURL))
	return p, nil
}

// DeletePartner removes a registration that could not be completed (no account created).
func (s *CareService) DeletePartner(id string) {
	if _, err := s.db.Exec(`DELETE FROM partners WHERE id = $1 AND status = 'pending'`, id); err != nil {
		log.Println("delete partner:", err)
	}
}

// ReviewPartner approves or rejects a registration. Approving turns on the
// partner and its staff accounts; rejecting (or suspending) turns them off.
func (s *CareService) ReviewPartner(id, status, note string) (*PartnerRecord, error) {
	if status != PartnerApproved && status != PartnerRejected {
		return nil, fmt.Errorf("%w: status must be approved or rejected", ErrInvalidCase)
	}
	active := status == PartnerApproved
	res, err := s.db.Exec(`UPDATE partners SET status = $2, active = $3, reviewed_at = NOW(), review_note = $4 WHERE id = $1`, id, status, active, strings.TrimSpace(note))
	if err != nil {
		return nil, err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return nil, ErrCaseNotFound
	}
	if _, err := s.db.Exec(`UPDATE partner_accounts SET active = $2 WHERE partner_id = $1`, id, active); err != nil {
		return nil, err
	}
	p, err := s.getPartner(id)
	if err != nil {
		return nil, err
	}
	if p.WhatsAppGroupID != "" {
		msg := "HEAL-Impact · Your organisation has been approved. You can now sign in at " + s.appURL + "/partners/login and you will receive case alerts here."
		if !active {
			msg = "HEAL-Impact · Your partner registration was not approved." + prefixed(" Reason: ", p.ReviewNote) + " Contact info@heal-impact.org with questions."
		}
		s.send("", *p, msg)
	}
	return p, nil
}

func (s *CareService) notifyDesk(text string) {
	partners, byID, err := s.routingPartners()
	if err != nil {
		return
	}
	if p, ok := care.Pick(partners, care.Coordinator, care.Location{}, nil); ok {
		s.send("", byID[p.ID], text)
	} else {
		log.Println(text)
	}
}

func (s *CareService) routingPartners() ([]care.Partner, map[string]PartnerRecord, error) {
	all, err := s.ListPartners()
	if err != nil {
		return nil, nil, err
	}
	out := make([]care.Partner, 0, len(all))
	byID := map[string]PartnerRecord{}
	for _, p := range all {
		out = append(out, care.Partner{
			ID: p.ID, Type: p.Type, Services: p.Services, County: p.County, Ward: p.Ward,
			Lat: p.Latitude, Lng: p.Longitude, IsDefault: p.IsDefault,
			// Only approved, switched-on partners receive cases.
			Active: p.Active && p.Status == PartnerApproved,
		})
		byID[p.ID] = p
	}
	return out, byID, nil
}

// EnsureDefaultCoordinator makes sure there is always a coordinator desk to
// escalate to, so no alert can be dropped for lack of a route.
func (s *CareService) EnsureDefaultCoordinator(groupID string) {
	var n int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM partners WHERE type = $1 AND is_default AND active`, care.Coordinator).Scan(&n); err != nil || n > 0 {
		return
	}
	_, err := s.SavePartner("", PartnerInput{Name: "HEAL coordinator desk", Type: care.Coordinator, OrgType: "ngo", WhatsAppGroupID: groupID, IsDefault: true})
	if err != nil {
		log.Println("Could not create the default coordinator desk:", err)
	}
}

// ---------- directory ----------

// DirectoryEntry is what partners see about each other: services, area and
// public contact. WhatsApp group ids and registration numbers stay with admins.
type DirectoryEntry struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Type        string   `json:"type"`
	OrgType     string   `json:"orgType"`
	Services    []string `json:"services"`
	County      string   `json:"county"`
	SubCounty   string   `json:"subCounty"`
	Ward        string   `json:"ward"`
	Landmark    string   `json:"landmark"`
	Phone       string   `json:"phone"`
	Email       string   `json:"email"`
	Hours       string   `json:"hours"`
	FocalPerson string   `json:"focalPerson"`
	IsDefault   bool     `json:"isDefault"`
	// Match against the case (or filter) location: 3 same ward, 2 same county
	// or within 25 km, 1 default route, 0 another area.
	Match      int      `json:"match"`
	DistanceKM *float64 `json:"distanceKm"`
	// Set when listing for a case: the open/closed alert this partner already has.
	AlertStatus string `json:"alertStatus,omitempty"`
}

type DirectoryQuery struct {
	County  string
	Ward    string
	Service string
	CaseID  string
}

// Directory lists approved partners, best match for the location first. With
// CaseID it ranks around that case and marks partners already alerted.
func (s *CareService) Directory(a *PartnerAccount, q DirectoryQuery) ([]DirectoryEntry, error) {
	loc := care.Location{County: q.County, Ward: q.Ward}
	alerted := map[string]string{}
	if q.CaseID != "" {
		if !s.canSee(a, q.CaseID) {
			return nil, ErrCaseNotFound
		}
		c, err := s.caseByID(q.CaseID)
		if err != nil {
			return nil, err
		}
		loc = c.loc()
		rows, err := s.db.Query(`SELECT partner_id, status FROM case_alerts WHERE case_id = $1 ORDER BY created_at`, q.CaseID)
		if err == nil {
			for rows.Next() {
				var pid, st string
				if rows.Scan(&pid, &st) == nil {
					alerted[pid] = st
				}
			}
			rows.Close()
		}
	}
	if q.Service != "" && !care.IsResponderType(q.Service) {
		return nil, fmt.Errorf("%w: unknown service", ErrInvalidCase)
	}
	partners, byID, err := s.routingPartners()
	if err != nil {
		return nil, err
	}
	out := []DirectoryEntry{}
	for _, r := range care.Rank(partners, q.Service, loc) {
		p := byID[r.ID]
		if p.Type == care.Coordinator {
			continue
		}
		out = append(out, DirectoryEntry{
			ID: p.ID, Name: p.Name, Type: p.Type, OrgType: p.OrgType, Services: p.Services, County: p.County, SubCounty: p.SubCounty,
			Ward: p.Ward, Landmark: p.Landmark, Phone: p.Phone, Email: p.Email, Hours: p.Hours, FocalPerson: p.FocalPerson,
			IsDefault: p.IsDefault, Match: r.Score, DistanceKM: roundKM(r.KM), AlertStatus: alerted[p.ID],
		})
	}
	return out, nil
}

func roundKM(v *float64) *float64 {
	if v == nil {
		return nil
	}
	r := math.Round(*v*10) / 10
	return &r
}

// ---------- referral ----------

// refer sends the case to a partner chosen from the directory (Workflow 8:
// the CHP links her to the nearest relevant service). The survivor must agree
// to every service she is referred to; a new one is recorded when confirmed.
func (s *CareService) refer(c *caseRow, actor, fromPartnerID string, in CaseAction) error {
	target, err := s.getPartner(in.PartnerID)
	if err != nil || target.Status != PartnerApproved || !target.Active || target.Type == care.Coordinator {
		return fmt.Errorf("%w: choose an approved partner from the directory", ErrInvalidCase)
	}
	if target.ID == fromPartnerID {
		return fmt.Errorf("%w: you can't refer a case to your own organisation", ErrInvalidCase)
	}
	service := in.Service
	if service == "" {
		service = target.Type
	}
	if !(care.Partner{Type: target.Type, Services: target.Services}).Offers(service) {
		return fmt.Errorf("%w: %s does not offer that service", ErrInvalidCase, target.Name)
	}
	var open int
	s.db.QueryRow(`SELECT COUNT(*) FROM case_alerts WHERE case_id = $1 AND partner_id = $2 AND status IN ('alerted','accepted')`, c.ID, target.ID).Scan(&open)
	if open > 0 {
		return fmt.Errorf("%w: %s already has this case", ErrInvalidCase, target.Name)
	}
	if !contains(c.Consent, service) {
		if !in.ConsentConfirmed {
			return fmt.Errorf("%w: she has not agreed to %s yet. Ask her first, then tick that she agreed", ErrInvalidCase, responderLabel(service))
		}
		c.Consent = append(c.Consent, service)
		b, _ := json.Marshal(c.Consent)
		s.db.Exec(`UPDATE cases SET consent = $2, updated_at = $3 WHERE id = $1`, c.ID, string(b), s.now())
		s.event(c.ID, actor, "consent_added", responderLabel(service))
	}
	from := "HEAL"
	if fromPartnerID != "" {
		if p, err := s.getPartner(fromPartnerID); err == nil {
			from = p.Name
		}
	}
	s.alertTo(c, *target, service, 0, "REFERRAL FROM "+strings.ToUpper(from), actor)
	if note := strings.TrimSpace(in.Note); note != "" {
		s.event(c.ID, actor, "note", "Referral note for "+target.Name+": "+note)
	}
	return nil
}

func orgLabel(t string) string {
	return map[string]string{
		"government": "government", "ngo": "NGO", "cbo": "CBO", "faith_based": "faith-based",
		"private": "private", "community": "community health unit",
	}[t]
}

func prefixed(prefix, v string) string {
	if v == "" {
		return ""
	}
	return prefix + v
}
