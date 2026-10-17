package services

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/heal/internal/models"
)

type ResourceService struct {
	db *sql.DB
}

func NewResourceService(db *sql.DB) *ResourceService {
	return &ResourceService{db: db}
}

func (s *ResourceService) GetResources(category, resourceType, difficulty string, limit, offset int) ([]models.Resource, error) {
	query := `
		SELECT id, title, description, content, type, category, difficulty, 
		       duration_minutes, rating, featured, created_at, updated_at
		FROM resources
		WHERE 1=1
	`
	args := []interface{}{}
	argCount := 1

	if category != "" && category != "all" {
		query += fmt.Sprintf(" AND category = $%d", argCount)
		args = append(args, category)
		argCount++
	}

	if resourceType != "" && resourceType != "all" {
		query += fmt.Sprintf(" AND type = $%d", argCount)
		args = append(args, resourceType)
		argCount++
	}

	if difficulty != "" && difficulty != "all" {
		query += fmt.Sprintf(" AND difficulty = $%d", argCount)
		args = append(args, difficulty)
		argCount++
	}

	query += fmt.Sprintf(" ORDER BY featured DESC, rating DESC, created_at DESC LIMIT $%d OFFSET $%d", argCount, argCount+1)
	args = append(args, limit, offset)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resources []models.Resource
	for rows.Next() {
		var resource models.Resource
		err := rows.Scan(&resource.ID, &resource.Title, &resource.Description,
			&resource.Content, &resource.Type, &resource.Category, &resource.Difficulty,
			&resource.DurationMinutes, &resource.Rating, &resource.Featured,
			&resource.CreatedAt, &resource.UpdatedAt)
		if err != nil {
			return nil, err
		}
		resources = append(resources, resource)
	}

	return resources, nil
}

func (s *ResourceService) GetResource(id string) (*models.Resource, error) {
	resource := &models.Resource{}
	err := s.db.QueryRow(`
		SELECT id, title, description, content, type, category, difficulty,
		       duration_minutes, rating, featured, created_at, updated_at
		FROM resources WHERE id = $1
	`, id).Scan(&resource.ID, &resource.Title, &resource.Description,
		&resource.Content, &resource.Type, &resource.Category, &resource.Difficulty,
		&resource.DurationMinutes, &resource.Rating, &resource.Featured,
		&resource.CreatedAt, &resource.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return resource, nil
}

func (s *ResourceService) GetCategories() ([]string, error) {
	rows, err := s.db.Query("SELECT DISTINCT category FROM resources ORDER BY category")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []string
	for rows.Next() {
		var category string
		if err := rows.Scan(&category); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}

	return categories, nil
}

func (s *ResourceService) UpdateProgress(userID, resourceID string, progress float64) error {
	// Check if progress record exists
	var existingID string
	err := s.db.QueryRow("SELECT id FROM user_resource_progress WHERE user_id = $1 AND resource_id = $2",
		userID, resourceID).Scan(&existingID)

	completed := progress >= 100.0

	if err == sql.ErrNoRows {
		// Create new progress record
		progressID := uuid.New().String()
		_, err = s.db.Exec(`
			INSERT INTO user_resource_progress (id, user_id, resource_id, progress, completed)
			VALUES ($1, $2, $3, $4, $5)
		`, progressID, userID, resourceID, progress, completed)
		return err
	} else if err != nil {
		return err
	}

	// Update existing progress record
	_, err = s.db.Exec(`
		UPDATE user_resource_progress 
		SET progress = $1, completed = $2, last_accessed = CURRENT_TIMESTAMP
		WHERE user_id = $3 AND resource_id = $4
	`, progress, completed, userID, resourceID)
	return err
}

func (s *ResourceService) GetRecommendations(userID string, limit int) ([]models.Resource, error) {
	// Simple recommendation based on user's category preferences and popular resources
	query := `
		SELECT DISTINCT r.id, r.title, r.description, r.content, r.type, r.category, 
		       r.difficulty, r.duration_minutes, r.rating, r.featured, r.created_at, r.updated_at
		FROM resources r
		LEFT JOIN user_resource_progress urp ON r.id = urp.resource_id AND urp.user_id = $1
		WHERE urp.id IS NULL OR urp.completed = FALSE
		ORDER BY r.rating DESC, r.featured DESC
		LIMIT $2
	`

	rows, err := s.db.Query(query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resources []models.Resource
	for rows.Next() {
		var resource models.Resource
		err := rows.Scan(&resource.ID, &resource.Title, &resource.Description,
			&resource.Content, &resource.Type, &resource.Category, &resource.Difficulty,
			&resource.DurationMinutes, &resource.Rating, &resource.Featured,
			&resource.CreatedAt, &resource.UpdatedAt)
		if err != nil {
			return nil, err
		}
		resources = append(resources, resource)
	}

	return resources, nil
}

func (s *ResourceService) ToggleFavorite(userID, resourceID string) error {
	// Check if progress record exists
	var existingID string
	var favorited bool
	err := s.db.QueryRow("SELECT id, favorited FROM user_resource_progress WHERE user_id = $1 AND resource_id = $2",
		userID, resourceID).Scan(&existingID, &favorited)

	if err == sql.ErrNoRows {
		// Create new progress record with favorited = true
		progressID := uuid.New().String()
		_, err = s.db.Exec(`
			INSERT INTO user_resource_progress (id, user_id, resource_id, favorited)
			VALUES ($1, $2, $3, $4)
		`, progressID, userID, resourceID, true)
		return err
	} else if err != nil {
		return err
	}

	// Toggle favorite status
	_, err = s.db.Exec(`
		UPDATE user_resource_progress 
		SET favorited = $1, last_accessed = CURRENT_TIMESTAMP
		WHERE user_id = $2 AND resource_id = $3
	`, !favorited, userID, resourceID)
	return err
}
