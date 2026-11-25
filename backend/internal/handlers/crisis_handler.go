package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/heal/internal/services"
)

type CrisisHandler struct {
	crisisService *services.CrisisService
}

func NewCrisisHandler(crisisService *services.CrisisService) *CrisisHandler {
	return &CrisisHandler{crisisService: crisisService}
}

func (h *CrisisHandler) CreateCrisisAlert(c *gin.Context) {
	userID := c.GetString("user_id")

	var req struct {
		Severity string `json:"severity" binding:"required"`
		Message  string `json:"message"`
		Location string `json:"location"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	alert, err := h.crisisService.CreateCrisisAlert(userID, req.Severity, req.Message, req.Location)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, alert)
}

func (h *CrisisHandler) GetEmergencyContacts(c *gin.Context) {
	userID := c.GetString("user_id")

	contacts, err := h.crisisService.GetEmergencyContacts(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"contacts": contacts})
}

func (h *CrisisHandler) AddEmergencyContact(c *gin.Context) {
	userID := c.GetString("user_id")

	var req struct {
		Name         string `json:"name" binding:"required"`
		Phone        string `json:"phone" binding:"required"`
		Relationship string `json:"relationship"`
		IsPrimary    bool   `json:"isPrimary"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	contact, err := h.crisisService.AddEmergencyContact(userID, req.Name, req.Phone, req.Relationship, req.IsPrimary)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, contact)
}

func (h *CrisisHandler) GetLocalServices(c *gin.Context) {
	latStr := c.Query("lat")
	lngStr := c.Query("lng")

	if latStr == "" || lngStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "lat and lng parameters are required"})
		return
	}

	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid lat parameter"})
		return
	}

	lng, err := strconv.ParseFloat(lngStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid lng parameter"})
		return
	}

	services, err := h.crisisService.GetLocalServices(lat, lng)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"services": services})
}

func (h *CrisisHandler) CreateSafetyPlan(c *gin.Context) {
	userID := c.GetString("user_id")

	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	plan, err := h.crisisService.CreateSafetyPlan(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, plan)
}

func (h *CrisisHandler) GetSafetyPlan(c *gin.Context) {
	userID := c.GetString("user_id")

	plan, err := h.crisisService.GetSafetyPlan(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Safety plan not found"})
		return
	}

	c.JSON(http.StatusOK, plan)
}
