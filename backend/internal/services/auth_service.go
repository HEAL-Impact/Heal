package services

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/heal/internal/models"
	"golang.org/x/crypto/bcrypt"
)

// Sign-up and sign-in errors the handler turns into status codes and stable codes.
var (
	ErrEmailTaken         = errors.New("an account with this email already exists")
	ErrPasswordMismatch   = errors.New("passwords do not match")
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInvalidName        = errors.New("first and last name are required")
)

// dummyHash is compared when no account matches, so a wrong email takes as
// long as a wrong password and nobody can tell which emails have accounts.
var dummyHash, _ = bcrypt.GenerateFromPassword([]byte("heal-timing-equaliser"), bcrypt.DefaultCost)

// NormalizeEmail trims and lower-cases an email so Jane@X.com and jane@x.com are one account.
func NormalizeEmail(email string) string { return strings.ToLower(strings.TrimSpace(email)) }

type AuthService struct {
	db        *sql.DB
	jwtSecret string
}

func NewAuthService(db *sql.DB, jwtSecret string) *AuthService {
	return &AuthService{
		db:        db,
		jwtSecret: jwtSecret,
	}
}

func (s *AuthService) Register(req models.RegisterRequest) (*models.AuthResponse, error) {
	req.Email = NormalizeEmail(req.Email)
	req.FirstName = strings.Join(strings.Fields(req.FirstName), " ")
	req.LastName = strings.Join(strings.Fields(req.LastName), " ")
	if req.FirstName == "" || req.LastName == "" {
		return nil, ErrInvalidName
	}
	if req.Password != req.ConfirmPassword {
		return nil, ErrPasswordMismatch
	}

	var existingID string
	err := s.db.QueryRow("SELECT id FROM users WHERE LOWER(email) = $1", req.Email).Scan(&existingID)
	if err == nil {
		return nil, ErrEmailTaken
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("failed to check email: %w", err)
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// User and profile are created together or not at all.
	tx, err := s.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()
	userID := uuid.New().String()
	_, err = tx.Exec(`
		INSERT INTO users (id, email, password_hash, first_name, last_name, email_verified)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, userID, req.Email, string(hashedPassword), req.FirstName, req.LastName, true)
	if err != nil {
		// Two sign-ups with the same email at the same moment.
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
			return nil, ErrEmailTaken
		}
		return nil, fmt.Errorf("failed to create user: %w", err)
	}
	if _, err = tx.Exec(`INSERT INTO user_profiles (user_id, preferences) VALUES ($1, $2)`, userID, "{}"); err != nil {
		return nil, fmt.Errorf("failed to create user profile: %w", err)
	}
	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to save user: %w", err)
	}

	// Get created user
	user, err := s.getUserByID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get created user: %w", err)
	}

	// Generate tokens
	accessToken, err := s.generateAccessToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := s.generateRefreshToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return &models.AuthResponse{
		User:         *user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) Login(req models.LoginRequest) (*models.AuthResponse, error) {
	// Get user by email
	user, err := s.getUserByEmail(NormalizeEmail(req.Email))
	if errors.Is(err, sql.ErrNoRows) {
		_ = bcrypt.CompareHashAndPassword(dummyHash, []byte(req.Password))
		return nil, ErrInvalidCredentials
	}
	if err != nil {
		return nil, fmt.Errorf("failed to look up user: %w", err)
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// Generate tokens
	accessToken, err := s.generateAccessToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := s.generateRefreshToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return &models.AuthResponse{
		User:         *user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) ValidateToken(tokenString string) (*models.User, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID, ok := claims["user_id"].(string)
		if !ok {
			return nil, errors.New("invalid token claims")
		}

		user, err := s.getUserByID(userID)
		if err != nil {
			return nil, err
		}

		return user, nil
	}

	return nil, errors.New("invalid token")
}

func (s *AuthService) getUserByID(id string) (*models.User, error) {
	user := &models.User{}
	err := s.db.QueryRow(`
		SELECT id, email, password_hash, first_name, last_name, email_verified, created_at, updated_at
		FROM users WHERE id = $1
	`, id).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.FirstName, &user.LastName,
		&user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthService) getUserByEmail(email string) (*models.User, error) {
	user := &models.User{}
	err := s.db.QueryRow(`
		SELECT id, email, password_hash, first_name, last_name, email_verified, created_at, updated_at
		FROM users WHERE LOWER(email) = $1
	`, email).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.FirstName, &user.LastName,
		&user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthService) generateAccessToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *AuthService) generateRefreshToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
		"iat":     time.Now().Unix(),
		"type":    "refresh",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *AuthService) RefreshToken(refreshTokenString string) (*models.AuthResponse, error) {
	token, err := jwt.Parse(refreshTokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid refresh token")
	}

	tokenType, _ := claims["type"].(string)
	if tokenType != "refresh" {
		return nil, errors.New("not a refresh token")
	}

	userID, ok := claims["user_id"].(string)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	user, err := s.getUserByID(userID)
	if err != nil {
		return nil, err
	}

	newAccessToken, err := s.generateAccessToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	newRefreshToken, err := s.generateRefreshToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return &models.AuthResponse{
		User:         *user,
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
	}, nil
}
