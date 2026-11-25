package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/heal/internal/services"
)

type ResourceHandler struct {
	resourceService *services.ResourceService
}

func NewResourceHandler(resourceService *services.ResourceService) *ResourceHandler {
	return &ResourceHandler{resourceService: resourceService}
}

func (h *ResourceHandler) GetResources(c *gin.Context) {
	category := c.DefaultQuery("category", "")
	resourceType := c.DefaultQuery("type", "")
	difficulty := c.DefaultQuery("difficulty", "")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	resources, err := h.resourceService.GetResources(category, resourceType, difficulty, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"resources": resources})
}

func (h *ResourceHandler) GetResource(c *gin.Context) {
	id := c.Param("id")

	resource, err := h.resourceService.GetResource(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Resource not found"})
		return
	}

	c.JSON(http.StatusOK, resource)
}

func (h *ResourceHandler) GetCategories(c *gin.Context) {
	categories, err := h.resourceService.GetCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"categories": categories})
}

func (h *ResourceHandler) UpdateProgress(c *gin.Context) {
	userID := c.GetString("user_id")
	resourceID := c.Param("id")

	var req struct {
		Progress float64 `json:"progress" binding:"required,min=0,max=100"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.resourceService.UpdateProgress(userID, resourceID, req.Progress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Progress updated successfully"})
}

func (h *ResourceHandler) GetRecommendations(c *gin.Context) {
	userID := c.GetString("user_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))

	resources, err := h.resourceService.GetRecommendations(userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"recommendations": resources})
}

func (h *ResourceHandler) ToggleFavorite(c *gin.Context) {
	userID := c.GetString("user_id")
	resourceID := c.Param("id")

	err := h.resourceService.ToggleFavorite(userID, resourceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Favorite status updated"})
}
