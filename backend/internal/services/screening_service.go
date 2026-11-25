package services

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/heal/internal/models"
	"github.com/heal/internal/screening"
)

var (
	ErrInvalidScreening  = errors.New("invalid screening")
	ErrScreeningIDInUse  = errors.New("screening id already used by another account")
	ErrScreeningNotFound = errors.New("screening not found")
	maxClockSkew         = 5 * time.Minute
)

type ScreeningService struct {
	db *sql.DB
}

func NewScreeningService(db *sql.DB) *ScreeningService {
	return &ScreeningService{db: db}
}

// CreateScreening stores a screening completed on a device. The id comes from
// the device, so re-sending the same screening after a dropped connection
// returns the stored copy instead of creating a duplicate. The score is always
// recomputed here from the answers.
func (s *ScreeningService) CreateScreening(userID string, req models.CreateScreeningRequest) (*models.PtsdScreening, bool, error) {
	if req.Instrument != screening.PtsdInstrumentID {
		return nil, false, fmt.Errorf("%w: unknown instrument %q", ErrInvalidScreening, req.Instrument)
	}
	if !screening.PresentationModes[req.Mode] {
		return nil, false, fmt.Errorf("%w: unknown mode %q", ErrInvalidScreening, req.Mode)
	}
	if req.CompletedAt.After(time.Now().Add(maxClockSkew)) {
		return nil, false, fmt.Errorf("%w: completedAt is in the future", ErrInvalidScreening)
	}
	totalScore, band, err := screening.ScorePtsd(req.Answers)
	if err != nil {
		return nil, false, fmt.Errorf("%w: %v", ErrInvalidScreening, err)
	}
	if req.County != nil && *req.County == "" {
		req.County = nil
	}
	if (req.Latitude == nil) != (req.Longitude == nil) {
		return nil, false, fmt.Errorf("%w: latitude and longitude must be sent together", ErrInvalidScreening)
	}
	// Keep only an approximate position, whatever precision the client sent.
	req.Latitude, req.Longitude = coarsen(req.Latitude), coarsen(req.Longitude)

	answers, err := json.Marshal(req.Answers)
	if err != nil {
		return nil, false, fmt.Errorf("failed to encode answers: %w", err)
	}

	result, err := s.db.Exec(`
		INSERT INTO ptsd_screenings (id, user_id, instrument, mode, county, latitude, longitude, answers, total_score, band, completed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		ON CONFLICT (id) DO NOTHING
	`, req.ID, userID, req.Instrument, req.Mode, req.County, req.Latitude, req.Longitude, answers, totalScore, band, req.CompletedAt)
	if err != nil {
		return nil, false, fmt.Errorf("failed to save screening: %w", err)
	}
	inserted, _ := result.RowsAffected()

	stored, err := s.GetScreening(userID, req.ID)
	if errors.Is(err, ErrScreeningNotFound) {
		// The id exists but belongs to someone else.
		return nil, false, ErrScreeningIDInUse
	}
	if err != nil {
		return nil, false, err
	}
	return stored, inserted == 1, nil
}

const screeningColumns = `id, user_id, instrument, mode, county, latitude, longitude, answers, total_score, band, referral_status, completed_at, created_at`

// coarsen rounds a coordinate to 2 decimal places (about 1 km).
func coarsen(v *float64) *float64 {
	if v == nil {
		return nil
	}
	rounded := math.Round(*v*100) / 100
	return &rounded
}

func scanScreening(row interface{ Scan(...any) error }) (*models.PtsdScreening, error) {
	var sc models.PtsdScreening
	var answers []byte
	if err := row.Scan(&sc.ID, &sc.UserID, &sc.Instrument, &sc.Mode, &sc.County, &sc.Latitude, &sc.Longitude, &answers,
		&sc.TotalScore, &sc.Band, &sc.ReferralStatus, &sc.CompletedAt, &sc.CreatedAt); err != nil {
		return nil, err
	}
	if err := json.Unmarshal(answers, &sc.Answers); err != nil {
		return nil, fmt.Errorf("failed to decode answers: %w", err)
	}
	return &sc, nil
}

func (s *ScreeningService) GetScreening(userID, id string) (*models.PtsdScreening, error) {
	sc, err := scanScreening(s.db.QueryRow(
		`SELECT `+screeningColumns+` FROM ptsd_screenings WHERE id = $1 AND user_id = $2`, id, userID))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrScreeningNotFound
	}
	return sc, err
}

func (s *ScreeningService) ListScreenings(userID string) ([]models.PtsdScreening, error) {
	rows, err := s.db.Query(
		`SELECT `+screeningColumns+` FROM ptsd_screenings WHERE user_id = $1 ORDER BY completed_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	screenings := []models.PtsdScreening{}
	for rows.Next() {
		sc, err := scanScreening(rows)
		if err != nil {
			return nil, err
		}
		screenings = append(screenings, *sc)
	}
	return screenings, rows.Err()
}
