package services

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/heal/internal/reports"
)

var (
	ErrInvalidReport  = errors.New("invalid report")
	ErrReportNotFound = errors.New("report not found")
)

// Recipients a survivor can choose to send their report to.
var reportRecipients = map[string]bool{
	"heal": true, "hotline_1195": true, "gbvrc": true, "fida": true, "police_gender_desk": true,
}

// CreateReportRequest is an anonymous report from the guided report flow. Every
// field except caseCode is optional: the survivor can skip any question.
type CreateReportRequest struct {
	CaseCode      string   `json:"caseCode" binding:"required"`
	IncidentType  string   `json:"incidentType"`
	WhenHappened  string   `json:"whenHappened"`
	Description   string   `json:"description"`
	SafeNow       string   `json:"safeNow"`
	Recipient     string   `json:"recipient"`
	WantsContact  bool     `json:"wantsContact"`
	ContactMethod string   `json:"contactMethod"`
	ContactDetail string   `json:"contactDetail"`
	SafeTimes     string   `json:"safeTimes"`
	County        *string  `json:"county"`
	Latitude      *float64 `json:"latitude"`
	Longitude     *float64 `json:"longitude"`
}

// ReportStatus is all anyone can see with a case code: never the contents.
type ReportStatus struct {
	CaseCode  string            `json:"caseCode"`
	Status    string            `json:"status"`
	Recipient string            `json:"recipient"`
	Timeline  map[string]string `json:"timeline"`
	CreatedAt time.Time         `json:"createdAt"`
}

type ReportService struct {
	db     *sql.DB
	cipher *reports.Cipher
}

func NewReportService(db *sql.DB, cipher *reports.Cipher) *ReportService {
	return &ReportService{db: db, cipher: cipher}
}

// CreateReport encrypts and stores a report. The case code is generated on the
// device so a report written offline keeps its code; resending the same code
// is treated as a retry and returns the stored status.
func (s *ReportService) CreateReport(req CreateReportRequest) (*ReportStatus, bool, error) {
	req.CaseCode = strings.TrimSpace(req.CaseCode)
	if !reports.ValidCaseCode(req.CaseCode) {
		return nil, false, fmt.Errorf("%w: malformed case code", ErrInvalidReport)
	}
	if req.Recipient == "" {
		req.Recipient = "heal"
	}
	if !reportRecipients[req.Recipient] {
		return nil, false, fmt.Errorf("%w: unknown recipient %q", ErrInvalidReport, req.Recipient)
	}
	if len(req.Description) > 5000 {
		return nil, false, fmt.Errorf("%w: description is too long", ErrInvalidReport)
	}
	// Approximate location only (~1 km), mirroring the screening rule.
	for _, coord := range []*float64{req.Latitude, req.Longitude} {
		if coord != nil {
			*coord = math.Round(*coord*100) / 100
		}
	}

	if existing, err := s.GetStatus(req.CaseCode); err == nil {
		return existing, false, nil
	} else if !errors.Is(err, ErrReportNotFound) {
		return nil, false, err
	}

	payload, err := json.Marshal(req)
	if err != nil {
		return nil, false, err
	}
	sealed, err := s.cipher.Seal(payload, req.CaseCode)
	if err != nil {
		return nil, false, err
	}

	now := time.Now().UTC()
	_, err = s.db.Exec(`
		INSERT INTO gbv_reports (case_code, recipient, status, payload_encrypted, received_at, created_at)
		VALUES ($1, $2, 'received', $3, $4, $4)
	`, req.CaseCode, req.Recipient, sealed, now)
	if err != nil {
		return nil, false, fmt.Errorf("failed to store report: %w", err)
	}
	status, err := s.GetStatus(req.CaseCode)
	return status, true, err
}

// GetStatus returns the progress of a report, without its contents.
func (s *ReportService) GetStatus(caseCode string) (*ReportStatus, error) {
	var (
		st                             ReportStatus
		received, contacted, seen, cls sql.NullTime
	)
	err := s.db.QueryRow(`
		SELECT case_code, status, recipient, created_at, received_at, contacted_at, seen_at, closed_at
		FROM gbv_reports WHERE case_code = $1
	`, caseCode).Scan(&st.CaseCode, &st.Status, &st.Recipient, &st.CreatedAt, &received, &contacted, &seen, &cls)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrReportNotFound
	}
	if err != nil {
		return nil, err
	}
	st.Timeline = map[string]string{}
	for name, t := range map[string]sql.NullTime{"received": received, "contacted": contacted, "seen": seen, "closed": cls} {
		if t.Valid {
			st.Timeline[name] = t.Time.Format(time.RFC3339)
		}
	}
	return &st, nil
}
