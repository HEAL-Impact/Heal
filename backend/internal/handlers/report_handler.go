package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/heal/internal/services"
)

type ReportHandler struct {
	reportService *services.ReportService
	careService   *services.CareService
}

func NewReportHandler(reportService *services.ReportService, careService *services.CareService) *ReportHandler {
	return &ReportHandler{reportService: reportService, careService: careService}
}

// CreateReport accepts an anonymous report. No account is needed.
func (h *ReportHandler) CreateReport(c *gin.Context) {
	var req services.CreateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status, created, err := h.reportService.CreateReport(req)
	switch {
	case errors.Is(err, services.ErrInvalidReport):
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	case err != nil:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not save the report"})
		return
	}

	code := http.StatusOK
	if created {
		code = http.StatusCreated
		// Every report opens a case, so someone is alerted and follows it up.
		h.careService.CreateFromReport(req)
	}
	c.JSON(code, status)
}

// GetReportStatus lets a survivor check progress with their case code.
func (h *ReportHandler) GetReportStatus(c *gin.Context) {
	status, err := h.reportService.GetStatus(c.Param("code"))
	if errors.Is(err, services.ErrReportNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "No report found for that case code"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not look up the report"})
		return
	}
	c.JSON(http.StatusOK, status)
}
