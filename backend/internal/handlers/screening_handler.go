package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/heal/internal/models"
	"github.com/heal/internal/services"
)

type ScreeningHandler struct {
	screeningService *services.ScreeningService
}

func NewScreeningHandler(screeningService *services.ScreeningService) *ScreeningHandler {
	return &ScreeningHandler{screeningService: screeningService}
}

func (h *ScreeningHandler) CreateScreening(c *gin.Context) {
	userID := c.GetString("user_id")

	var req models.CreateScreeningRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	screening, created, err := h.screeningService.CreateScreening(userID, req)
	switch {
	case errors.Is(err, services.ErrInvalidScreening):
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	case errors.Is(err, services.ErrScreeningIDInUse):
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	case err != nil:
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	status := http.StatusOK
	if created {
		status = http.StatusCreated
	}
	c.JSON(status, screening)
}

func (h *ScreeningHandler) GetScreenings(c *gin.Context) {
	userID := c.GetString("user_id")

	screenings, err := h.screeningService.ListScreenings(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"screenings": screenings})
}

func (h *ScreeningHandler) GetScreening(c *gin.Context) {
	userID := c.GetString("user_id")

	screening, err := h.screeningService.GetScreening(userID, c.Param("id"))
	if errors.Is(err, services.ErrScreeningNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Screening not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, screening)
}
