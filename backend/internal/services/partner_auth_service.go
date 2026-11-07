package services

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// Partner account roles.
const (
	RoleAdmin       = "admin"       // manages partners and accounts, sees every case
	RoleCoordinator = "coordinator" // HEAL duty desk: sees and acts on every case
	RolePartner     = "partner"     // staff of one partner: sees only its own cases
)

var (
	ErrPartnerAuth    = errors.New("invalid email or password")
	ErrInvalidAccount = errors.New("invalid account")
	ErrForbidden      = errors.New("not allowed")
	// Right password, but the organisation is not (or no longer) approved.
	ErrPartnerPending  = errors.New("your organisation is waiting for HEAL to approve it")
	ErrPartnerRejected = errors.New("your organisation's registration was not approved; contact info@heal-impact.org")
	ErrAccountOff      = errors.New("this account has been switched off; contact your organisation's HEAL admin")
)

// PartnerAccount is a signed-in partner staff member.
type PartnerAccount struct {
	ID          string    `json:"id"`
	Email       string    `json:"email"`
	Name        string    `json:"name"`
	Role        string    `json:"role"`
	PartnerID   string    `json:"partnerId"`
	PartnerName string    `json:"partnerName"`
	PartnerType string    `json:"partnerType"`
	Active      bool      `json:"active"`
	CreatedAt   time.Time `json:"createdAt"`
}

// SeesAllCases is true for the coordinator desk and admins.
func (a *PartnerAccount) SeesAllCases() bool {
	return a.Role == RoleAdmin || a.Role == RoleCoordinator
}

// PartnerAuthService signs partner staff in. Tokens carry kind=partner so a
// survivor token can never be used on partner routes, and the reverse.
type PartnerAuthService struct {
	db     *sql.DB
	secret []byte
}

func NewPartnerAuthService(db *sql.DB, jwtSecret string) *PartnerAuthService {
	return &PartnerAuthService{db: db, secret: []byte(jwtSecret)}
}

const accountSelect = `
	SELECT a.id, a.email, a.name, a.role, COALESCE(a.partner_id, ''), COALESCE(p.name, ''), COALESCE(p.type, ''), a.active, a.created_at
	FROM partner_accounts a LEFT JOIN partners p ON p.id = a.partner_id`

func scanAccount(row interface{ Scan(...any) error }) (*PartnerAccount, error) {
	var a PartnerAccount
	if err := row.Scan(&a.ID, &a.Email, &a.Name, &a.Role, &a.PartnerID, &a.PartnerName, &a.PartnerType, &a.Active, &a.CreatedAt); err != nil {
		return nil, err
	}
	return &a, nil
}

func (s *PartnerAuthService) Login(email, password string) (string, *PartnerAccount, error) {
	var id, hash, partnerStatus string
	var active bool
	err := s.db.QueryRow(`SELECT a.id, a.password_hash, a.active, COALESCE(p.status, '') FROM partner_accounts a
		LEFT JOIN partners p ON p.id = a.partner_id WHERE a.email = $1`,
		strings.ToLower(strings.TrimSpace(email))).Scan(&id, &hash, &active, &partnerStatus)
	if errors.Is(err, sql.ErrNoRows) {
		_ = bcrypt.CompareHashAndPassword(dummyHash, []byte(password))
		return "", nil, ErrPartnerAuth
	}
	if err != nil {
		return "", nil, err
	}
	if bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) != nil {
		return "", nil, ErrPartnerAuth
	}
	// Only after the right password do we say why an account can't sign in.
	switch {
	case partnerStatus == "pending":
		return "", nil, ErrPartnerPending
	case partnerStatus == "rejected":
		return "", nil, ErrPartnerRejected
	case !active:
		return "", nil, ErrAccountOff
	}
	account, err := s.Get(id)
	if err != nil {
		return "", nil, err
	}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  account.ID,
		"kind": "partner",
		"role": account.Role,
		"exp":  time.Now().Add(12 * time.Hour).Unix(),
		"iat":  time.Now().Unix(),
	}).SignedString(s.secret)
	if err != nil {
		return "", nil, err
	}
	_, _ = s.db.Exec(`UPDATE partner_accounts SET last_login_at = NOW() WHERE id = $1`, account.ID)
	return token, account, nil
}

// Validate checks a token and reloads the account, so a deactivated account
// or a changed role takes effect immediately.
func (s *PartnerAuthService) Validate(tokenString string) (*PartnerAccount, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return s.secret, nil
	})
	if err != nil || !token.Valid {
		return nil, ErrPartnerAuth
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || claims["kind"] != "partner" {
		return nil, ErrPartnerAuth
	}
	id, _ := claims["sub"].(string)
	account, err := s.Get(id)
	if err != nil || !account.Active {
		return nil, ErrPartnerAuth
	}
	return account, nil
}

func (s *PartnerAuthService) Get(id string) (*PartnerAccount, error) {
	return scanAccount(s.db.QueryRow(accountSelect+` WHERE a.id = $1`, id))
}

func (s *PartnerAuthService) List() ([]PartnerAccount, error) {
	rows, err := s.db.Query(accountSelect + ` ORDER BY a.created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []PartnerAccount{}
	for rows.Next() {
		a, err := scanAccount(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *a)
	}
	return out, nil
}

type CreateAccountRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=10,max=72"`
	Name      string `json:"name" binding:"required"`
	Role      string `json:"role" binding:"required"`
	PartnerID string `json:"partnerId"`
}

func (s *PartnerAuthService) Create(req CreateAccountRequest) (*PartnerAccount, error) {
	return s.create(req, true)
}

// CreatePending makes the first account of a self-registered organisation,
// switched off until HEAL approves the organisation.
func (s *PartnerAuthService) CreatePending(req CreateAccountRequest) (*PartnerAccount, error) {
	req.Role = RolePartner
	return s.create(req, false)
}

func (s *PartnerAuthService) create(req CreateAccountRequest, active bool) (*PartnerAccount, error) {
	switch req.Role {
	case RoleAdmin, RoleCoordinator:
		req.PartnerID = ""
	case RolePartner:
		if req.PartnerID == "" {
			return nil, fmt.Errorf("%w: a partner account must belong to a partner", ErrInvalidAccount)
		}
	default:
		return nil, fmt.Errorf("%w: unknown role %q", ErrInvalidAccount, req.Role)
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	id := uuid.New().String()
	var partnerID any
	if req.PartnerID != "" {
		partnerID = req.PartnerID
	}
	_, err = s.db.Exec(`INSERT INTO partner_accounts (id, email, password_hash, name, role, partner_id, active) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		id, strings.ToLower(strings.TrimSpace(req.Email)), string(hash), strings.TrimSpace(req.Name), req.Role, partnerID, active)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			return nil, fmt.Errorf("%w: that email already has an account", ErrInvalidAccount)
		}
		return nil, err
	}
	return s.Get(id)
}

func (s *PartnerAuthService) SetActive(id string, active bool) error {
	_, err := s.db.Exec(`UPDATE partner_accounts SET active = $2 WHERE id = $1`, id, active)
	return err
}

// EnsureAdmin creates the first admin from the environment when no admin exists.
func (s *PartnerAuthService) EnsureAdmin(email, password string) {
	var n int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM partner_accounts WHERE role = $1`, RoleAdmin).Scan(&n); err != nil || n > 0 {
		return
	}
	if email == "" || len(password) < 10 {
		log.Println("No partner admin yet: set PARTNER_ADMIN_EMAIL and PARTNER_ADMIN_PASSWORD (10+ characters) to create one")
		return
	}
	if _, err := s.Create(CreateAccountRequest{Email: email, Password: password, Name: "HEAL admin", Role: RoleAdmin}); err != nil {
		log.Println("Could not create the first partner admin:", err)
		return
	}
	log.Printf("Created the first partner admin account (%s)", email)
}
