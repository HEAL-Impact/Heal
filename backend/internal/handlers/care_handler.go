package handlers

import (
	"crypto/subtle"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/heal/internal/middleware"
	"github.com/heal/internal/services"
)

type CareHandler struct {
	care          *services.CareService
	auth          *services.PartnerAuthService
	webhookSecret string
	// 5 partner registrations per IP per hour.
	registrations *attemptLimiter
}

func NewCareHandler(care *services.CareService, auth *services.PartnerAuthService, webhookSecret string) *CareHandler {
	return &CareHandler{care: care, auth: auth, webhookSecret: webhookSecret, registrations: newAttemptLimiter(5, time.Hour)}
}

func careError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, services.ErrInvalidCase), errors.Is(err, services.ErrInvalidAccount):
		// Show the reason only, not the internal error category.
		msg := strings.TrimPrefix(strings.TrimPrefix(err.Error(), services.ErrInvalidCase.Error()+": "), services.ErrInvalidAccount.Error()+": ")
		c.JSON(http.StatusBadRequest, gin.H{"error": msg, "code": "invalid_input"})
	case errors.Is(err, services.ErrCaseNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
	case errors.Is(err, services.ErrForbidden):
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong. Please try again."})
	}
}

// ---------- survivor (no account) ----------

// CreateCase: "Yes, connect me", "Send help to me", Nia "Get care", CHP screening.
func (h *CareHandler) CreateCase(c *gin.Context) {
	var req services.CreateCaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// A case opened by a CHP must come from a signed-in partner account.
	if req.Source == "chp" {
		token := c.GetHeader("Authorization")
		if len(token) < 8 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Partner sign-in required"})
			return
		}
		if _, err := h.auth.Validate(token[7:]); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Partner sign-in required"})
			return
		}
	}
	st, created, err := h.care.CreateCase(req)
	if err != nil {
		careError(c, err)
		return
	}
	code := http.StatusOK
	if created {
		code = http.StatusCreated
	}
	c.JSON(code, st)
}

func (h *CareHandler) CaseStatus(c *gin.Context) {
	st, err := h.care.StatusByCode(c.Param("code"))
	if err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusOK, st)
}

func (h *CareHandler) Withdraw(c *gin.Context) {
	st, err := h.care.Withdraw(c.Param("code"))
	if err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusOK, st)
}

func (h *CareHandler) Feedback(c *gin.Context) {
	var body struct {
		Helped *bool `json:"helped" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "helped is required"})
		return
	}
	if err := h.care.Feedback(c.Param("code"), *body.Helped); err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// ---------- partner sign-in ----------

func (h *CareHandler) Login(c *gin.Context) {
	var body struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password are required"})
		return
	}
	token, account, err := h.auth.Login(body.Email, body.Password)
	switch {
	case errors.Is(err, services.ErrPartnerAuth):
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error(), "code": "invalid_credentials"})
		return
	case errors.Is(err, services.ErrPartnerPending):
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error(), "code": "pending_approval"})
		return
	case errors.Is(err, services.ErrPartnerRejected):
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error(), "code": "rejected"})
		return
	case errors.Is(err, services.ErrAccountOff):
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error(), "code": "account_off"})
		return
	}
	if err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token, "account": account})
}

func (h *CareHandler) Me(c *gin.Context) {
	c.JSON(http.StatusOK, middleware.PartnerAccount(c))
}

// RegisterPartner lets an organisation sign up with its location. It stays
// pending (no cases, no sign-in) until a HEAL admin approves it.
func (h *CareHandler) RegisterPartner(c *gin.Context) {
	ip := c.ClientIP()
	if blocked, _ := h.registrations.Blocked(ip); blocked {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many registrations from this connection. Please try again later.", "code": "too_many_attempts"})
		return
	}
	var body struct {
		Organisation services.PartnerInput `json:"organisation" binding:"required"`
		Account      struct {
			Name     string `json:"name" binding:"required,max=100"`
			Email    string `json:"email" binding:"required,email,max=254"`
			Password string `json:"password" binding:"required,min=10,max=72"`
		} `json:"account" binding:"required"`
		AgreeCodeOfConduct bool `json:"agreeCodeOfConduct"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please check the form: organisation name, main service, county, phone, your name, a valid email and a password of 10+ characters are required.", "code": "invalid_input"})
		return
	}
	if !body.AgreeCodeOfConduct {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please agree to the HEAL partner code of conduct.", "code": "invalid_input"})
		return
	}
	partner, err := h.care.RegisterPartner(body.Organisation)
	if err != nil {
		careError(c, err)
		return
	}
	if _, err := h.auth.CreatePending(services.CreateAccountRequest{
		Email: body.Account.Email, Password: body.Account.Password, Name: body.Account.Name, PartnerID: partner.ID,
	}); err != nil {
		h.care.DeletePartner(partner.ID)
		if errors.Is(err, services.ErrInvalidAccount) {
			c.JSON(http.StatusConflict, gin.H{"error": "That email already has a HEAL partner account. Sign in instead, or use another email.", "code": "email_taken"})
			return
		}
		careError(c, err)
		return
	}
	h.registrations.Fail(ip)
	c.JSON(http.StatusCreated, gin.H{"status": partner.Status, "name": partner.Name})
}

// ReviewPartner approves or rejects a registered organisation (admin).
func (h *CareHandler) ReviewPartner(c *gin.Context) {
	var body struct {
		Status string `json:"status" binding:"required"`
		Note   string `json:"note"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p, err := h.care.ReviewPartner(c.Param("id"), body.Status, body.Note)
	if err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusOK, p)
}

// Directory lists approved partners by location, nearest/most relevant first.
func (h *CareHandler) Directory(c *gin.Context) {
	list, err := h.care.Directory(middleware.PartnerAccount(c), services.DirectoryQuery{
		County: c.Query("county"), Ward: c.Query("ward"), Service: c.Query("service"), CaseID: c.Query("caseId"),
	})
	if err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusOK, list)
}

// ---------- caseload ----------

func (h *CareHandler) ListCases(c *gin.Context) {
	cases, err := h.care.ListCases(middleware.PartnerAccount(c), c.Query("closed") == "1")
	if err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusOK, cases)
}

func (h *CareHandler) GetCase(c *gin.Context) {
	v, err := h.care.GetCase(middleware.PartnerAccount(c), c.Param("id"))
	if err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusOK, v)
}

func (h *CareHandler) Act(c *gin.Context) {
	var in services.CaseAction
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	v, err := h.care.Act(middleware.PartnerAccount(c), c.Param("id"), in)
	if err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusOK, v)
}

func (h *CareHandler) Insights(c *gin.Context) {
	in, err := h.care.Insights()
	if err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusOK, in)
}

// ---------- partners and accounts (admin) ----------

func (h *CareHandler) ListPartners(c *gin.Context) {
	list, err := h.care.ListPartners()
	if err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *CareHandler) SavePartner(c *gin.Context) {
	var in services.PartnerInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p, err := h.care.SavePartner(c.Param("id"), in)
	if err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *CareHandler) ListAccounts(c *gin.Context) {
	list, err := h.auth.List()
	if err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *CareHandler) CreateAccount(c *gin.Context) {
	var req services.CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	a, err := h.auth.Create(req)
	if err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusCreated, a)
}

func (h *CareHandler) SetAccountActive(c *gin.Context) {
	var body struct {
		Active bool `json:"active"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if me := middleware.PartnerAccount(c); me.ID == c.Param("id") && !body.Active {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You cannot deactivate your own account"})
		return
	}
	if err := h.auth.SetActive(c.Param("id"), body.Active); err != nil {
		careError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// ---------- WhatsApp group replies (gateway webhook) ----------

// WhatsAppWebhook records "ACC <code>", "PASS <code> <reason>" or "SEEN <code>"
// typed in a partner's group. The gateway must send ?secret=WHATSAPP_WEBHOOK_SECRET.
func (h *CareHandler) WhatsAppWebhook(c *gin.Context) {
	if h.webhookSecret == "" || subtle.ConstantTimeCompare([]byte(c.Query("secret")), []byte(h.webhookSecret)) != 1 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "bad secret"})
		return
	}
	var body struct {
		Messages []struct {
			ChatID string `json:"chat_id"`
			FromMe bool   `json:"from_me"`
			Text   struct {
				Body string `json:"body"`
			} `json:"text"`
		} `json:"messages"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusOK, gin.H{"ok": true})
		return
	}
	replies := []string{}
	for _, m := range body.Messages {
		if m.FromMe {
			continue
		}
		if reply, err := h.care.GroupReply(m.ChatID, m.Text.Body); err == nil && reply != "" {
			replies = append(replies, reply)
		}
	}
	c.JSON(http.StatusOK, gin.H{"ok": true, "recorded": replies})
}
