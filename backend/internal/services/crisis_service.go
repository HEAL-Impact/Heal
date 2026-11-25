package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/heal/internal/models"
)

type CrisisService struct {
	db *sql.DB
}

func NewCrisisService(db *sql.DB) *CrisisService {
	return &CrisisService{db: db}
}

func (s *CrisisService) CreateCrisisAlert(userID, severity, message, location string) (*models.CrisisAlert, error) {
	alertID := uuid.New().String()
	now := time.Now()

	_, err := s.db.Exec(`
		INSERT INTO crisis_alerts (id, user_id, severity, message, location, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, alertID, userID, severity, message, location, "active", now)
	if err != nil {
		return nil, fmt.Errorf("failed to create crisis alert: %w", err)
	}

	return &models.CrisisAlert{
		ID:        alertID,
		UserID:    userID,
		Severity:  severity,
		Message:   message,
		Location:  location,
		Status:    "active",
		CreatedAt: now,
	}, nil
}

func (s *CrisisService) GetEmergencyContacts(userID string) ([]models.EmergencyContact, error) {
	query := `
		SELECT id, user_id, name, phone, relationship, is_primary, created_at
		FROM emergency_contacts
		WHERE user_id = $1
		ORDER BY is_primary DESC, created_at ASC
	`

	rows, err := s.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contacts []models.EmergencyContact
	for rows.Next() {
		var contact models.EmergencyContact
		err := rows.Scan(&contact.ID, &contact.UserID, &contact.Name,
			&contact.Phone, &contact.Relationship, &contact.IsPrimary, &contact.CreatedAt)
		if err != nil {
			return nil, err
		}
		contacts = append(contacts, contact)
	}

	return contacts, nil
}

func (s *CrisisService) AddEmergencyContact(userID, name, phone, relationship string, isPrimary bool) (*models.EmergencyContact, error) {
	contactID := uuid.New().String()
	now := time.Now()

	// If this is set as primary, unset other primary contacts
	if isPrimary {
		_, err := s.db.Exec("UPDATE emergency_contacts SET is_primary = false WHERE user_id = $1", userID)
		if err != nil {
			return nil, fmt.Errorf("failed to update existing primary contacts: %w", err)
		}
	}

	_, err := s.db.Exec(`
		INSERT INTO emergency_contacts (id, user_id, name, phone, relationship, is_primary, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, contactID, userID, name, phone, relationship, isPrimary, now)
	if err != nil {
		return nil, fmt.Errorf("failed to add emergency contact: %w", err)
	}

	return &models.EmergencyContact{
		ID:           contactID,
		UserID:       userID,
		Name:         name,
		Phone:        phone,
		Relationship: relationship,
		IsPrimary:    isPrimary,
		CreatedAt:    now,
	}, nil
}

func (s *CrisisService) GetLocalServices(lat, lng float64) ([]map[string]interface{}, error) {
	// In a real implementation, this would integrate with external APIs
	// For now, return mock data
	services := []map[string]interface{}{
		{
			"name":        "Central Hospital Emergency Room",
			"phone":       "911",
			"address":     "123 Main St, City, State",
			"distance":    1.2,
			"type":        "hospital",
			"available":   true,
			"description": "24/7 emergency services",
		},
		{
			"name":        "Crisis Intervention Center",
			"phone":       "555-0123",
			"address":     "456 Oak Ave, City, State",
			"distance":    2.8,
			"type":        "crisis_center",
			"available":   true,
			"description": "Walk-in crisis support available",
		},
		{
			"name":        "Mental Health Urgent Care",
			"phone":       "555-0456",
			"address":     "789 Pine St, City, State",
			"distance":    3.5,
			"type":        "urgent_care",
			"available":   true,
			"description": "Specialized mental health urgent care",
		},
	}

	return services, nil
}

func (s *CrisisService) CreateSafetyPlan(userID string, plan map[string]interface{}) (*models.SafetyPlan, error) {
	planID := uuid.New().String()
	now := time.Now()

	// Convert plan components to JSON strings
	warningSigns, _ := json.Marshal(plan["warningSigns"])
	copingStrategies, _ := json.Marshal(plan["copingStrategies"])
	supportContacts, _ := json.Marshal(plan["supportContacts"])
	professionalContacts, _ := json.Marshal(plan["professionalContacts"])
	environmentSafety, _ := json.Marshal(plan["environmentSafety"])

	// Check if user already has a safety plan
	var existingID string
	err := s.db.QueryRow("SELECT id FROM safety_plans WHERE user_id = $1", userID).Scan(&existingID)

	if err == sql.ErrNoRows {
		// Create new safety plan
		_, err = s.db.Exec(`
			INSERT INTO safety_plans (id, user_id, warning_signs, coping_strategies, 
			                         support_contacts, professional_contacts, environment_safety, 
			                         created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`, planID, userID, string(warningSigns), string(copingStrategies),
			string(supportContacts), string(professionalContacts), string(environmentSafety),
			now, now)
	} else if err == nil {
		// Update existing safety plan
		planID = existingID
		_, err = s.db.Exec(`
			UPDATE safety_plans 
			SET warning_signs = $1, coping_strategies = $2, support_contacts = $3, 
			    professional_contacts = $4, environment_safety = $5, updated_at = $6
			WHERE id = $7
		`, string(warningSigns), string(copingStrategies), string(supportContacts),
			string(professionalContacts), string(environmentSafety), now, planID)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to save safety plan: %w", err)
	}

	return &models.SafetyPlan{
		ID:                   planID,
		UserID:               userID,
		WarningSigns:         string(warningSigns),
		CopingStrategies:     string(copingStrategies),
		SupportContacts:      string(supportContacts),
		ProfessionalContacts: string(professionalContacts),
		EnvironmentSafety:    string(environmentSafety),
		CreatedAt:            now,
		UpdatedAt:            now,
	}, nil
}

func (s *CrisisService) GetSafetyPlan(userID string) (*models.SafetyPlan, error) {
	plan := &models.SafetyPlan{}
	err := s.db.QueryRow(`
		SELECT id, user_id, warning_signs, coping_strategies, support_contacts,
		       professional_contacts, environment_safety, created_at, updated_at
		FROM safety_plans WHERE user_id = $1
	`, userID).Scan(&plan.ID, &plan.UserID, &plan.WarningSigns, &plan.CopingStrategies,
		&plan.SupportContacts, &plan.ProfessionalContacts, &plan.EnvironmentSafety,
		&plan.CreatedAt, &plan.UpdatedAt)

	if err != nil {
		return nil, err
	}
	return plan, nil
}
