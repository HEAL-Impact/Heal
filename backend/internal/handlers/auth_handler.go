package handlers

import (
	"errors"
	"log"
	"math"
	"net/http"
	"net/mail"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/heal/internal/models"
	"github.com/heal/internal/services"
)

type AuthHandler struct {
	authService *services.AuthService
	// 5 wrong passwords per email, or 20 per IP, in 15 minutes.
	byEmail *attemptLimiter
	byIP    *attemptLimiter
	// 10 new accounts per IP per hour.
	signups *attemptLimiter
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		byEmail:     newAttemptLimiter(5, 15*time.Minute),
		byIP:        newAttemptLimiter(20, 15*time.Minute),
		signups:     newAttemptLimiter(10, time.Hour),
	}
}

// validEmail accepts a plain address (no display name) of at most 254 characters.
func validEmail(email string) bool {
	if len(email) > 254 {
		return false
	}
	a, err := mail.ParseAddress(email)
	return err == nil && a.Address == email && strings.Contains(email[strings.LastIndex(email, "@"):], ".")
}

// authError sends a message plus a stable code the frontend translates.
func authError(c *gin.Context, status int, code, message string) {
	c.JSON(status, gin.H{"error": message, "code": code})
}

func tooMany(c *gin.Context, wait time.Duration) {
	secs := int(math.Ceil(wait.Seconds()))
	c.Header("Retry-After", strconv.Itoa(secs))
	c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many attempts. Please wait and try again.", "code": "too_many_attempts", "retryAfter": secs})
}

func (h *AuthHandler) Register(c *gin.Context) {
	if blocked, wait := h.signups.Blocked(c.ClientIP()); blocked {
		tooMany(c, wait)
		return
	}
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		authError(c, http.StatusBadRequest, "invalid_input", "Please check the details you entered.")
		return
	}
	if req.Email = services.NormalizeEmail(req.Email); !validEmail(req.Email) {
		authError(c, http.StatusBadRequest, "invalid_input", "Please enter a valid email address.")
		return
	}

	response, err := h.authService.Register(req)
	switch {
	case errors.Is(err, services.ErrEmailTaken):
		authError(c, http.StatusConflict, "email_taken", err.Error())
		return
	case errors.Is(err, services.ErrPasswordMismatch):
		authError(c, http.StatusBadRequest, "password_mismatch", err.Error())
		return
	case errors.Is(err, services.ErrInvalidName):
		authError(c, http.StatusBadRequest, "invalid_input", err.Error())
		return
	case err != nil:
		log.Println("register:", err)
		authError(c, http.StatusInternalServerError, "server_error", "We could not create your account right now. Please try again.")
		return
	}
	h.signups.Fail(c.ClientIP()) // counts accounts created, not failures
	c.JSON(http.StatusCreated, response)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		authError(c, http.StatusBadRequest, "invalid_input", "Please enter a valid email and password.")
		return
	}
	email := services.NormalizeEmail(req.Email)
	if !validEmail(email) {
		authError(c, http.StatusBadRequest, "invalid_input", "Please enter a valid email and password.")
		return
	}
	req.Email = email
	ip := c.ClientIP()
	if blocked, wait := h.byEmail.Blocked(email); blocked {
		tooMany(c, wait)
		return
	}
	if blocked, wait := h.byIP.Blocked(ip); blocked {
		tooMany(c, wait)
		return
	}

	response, err := h.authService.Login(req)
	if errors.Is(err, services.ErrInvalidCredentials) {
		h.byEmail.Fail(email)
		h.byIP.Fail(ip)
		authError(c, http.StatusUnauthorized, "invalid_credentials", err.Error())
		return
	}
	if err != nil {
		log.Println("login:", err)
		authError(c, http.StatusInternalServerError, "server_error", "We could not sign you in right now. Please try again.")
		return
	}
	h.byEmail.Reset(email)
	c.JSON(http.StatusOK, response)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	// In a real implementation, you might invalidate the token
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refreshToken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "refreshToken is required"})
		return
	}

	response, err := h.authService.RefreshToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired refresh token"})
		return
	}

	c.JSON(http.StatusOK, response)
}

func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	// Implementation for password reset
	c.JSON(http.StatusOK, gin.H{"message": "Password reset email sent"})
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	// Implementation for password reset
	c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully"})
}

func (h *AuthHandler) VerifyEmail(c *gin.Context) {
	token := c.Param("token")
	// Implementation for email verification
	c.JSON(http.StatusOK, gin.H{"message": "Email verified", "token": token})
}
