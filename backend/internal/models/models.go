package models

import (
	"time"
)

type User struct {
	ID            string    `json:"id" db:"id"`
	Email         string    `json:"email" db:"email"`
	PasswordHash  string    `json:"-" db:"password_hash"`
	FirstName     string    `json:"firstName" db:"first_name"`
	LastName      string    `json:"lastName" db:"last_name"`
	EmailVerified bool      `json:"emailVerified" db:"email_verified"`
	CreatedAt     time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt     time.Time `json:"updatedAt" db:"updated_at"`
}

type UserProfile struct {
	UserID                 string `json:"userId" db:"user_id"`
	AvatarURL              string `json:"avatarUrl" db:"avatar_url"`
	Phone                  string `json:"phone" db:"phone"`
	DateOfBirth            string `json:"dateOfBirth" db:"date_of_birth"`
	EmergencyContactName   string `json:"emergencyContactName" db:"emergency_contact_name"`
	EmergencyContactPhone  string `json:"emergencyContactPhone" db:"emergency_contact_phone"`
	Preferences            string `json:"preferences" db:"preferences"`
}

type ChatSession struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"userId" db:"user_id"`
	Title     string    `json:"title" db:"title"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type ChatMessage struct {
	ID          string    `json:"id" db:"id"`
	SessionID   string    `json:"sessionId" db:"session_id"`
	UserID      string    `json:"userId" db:"user_id"`
	Content     string    `json:"content" db:"content"`
	SenderType  string    `json:"senderType" db:"sender_type"` // 'user' or 'ai'
	MessageType string    `json:"messageType" db:"message_type"` // 'text', 'audio', 'video'
	Metadata    string    `json:"metadata" db:"metadata"` // JSON for additional data
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

type Resource struct {
	ID              string    `json:"id" db:"id"`
	Title           string    `json:"title" db:"title"`
	Description     string    `json:"description" db:"description"`
	Content         string    `json:"content" db:"content"`
	Type            string    `json:"type" db:"type"`
	Category        string    `json:"category" db:"category"`
	Difficulty      string    `json:"difficulty" db:"difficulty"`
	DurationMinutes int       `json:"durationMinutes" db:"duration_minutes"`
	Rating          float64   `json:"rating" db:"rating"`
	Featured        bool      `json:"featured" db:"featured"`
	CreatedAt       time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time `json:"updatedAt" db:"updated_at"`
}

type UserResourceProgress struct {
	ID           string    `json:"id" db:"id"`
	UserID       string    `json:"userId" db:"user_id"`
	ResourceID   string    `json:"resourceId" db:"resource_id"`
	Progress     float64   `json:"progress" db:"progress"`
	Completed    bool      `json:"completed" db:"completed"`
	Favorited    bool      `json:"favorited" db:"favorited"`
	LastAccessed time.Time `json:"lastAccessed" db:"last_accessed"`
}

type MoodLog struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"userId" db:"user_id"`
	MoodScore int       `json:"moodScore" db:"mood_score"`
	Notes     string    `json:"notes" db:"notes"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

type PtsdScreening struct {
	ID             string    `json:"id" db:"id"`
	UserID         string    `json:"userId" db:"user_id"`
	Instrument     string    `json:"instrument" db:"instrument"`
	Mode           string    `json:"mode" db:"mode"`
	County         *string   `json:"county" db:"county"`
	Answers        []int     `json:"answers" db:"answers"`
	TotalScore     int       `json:"totalScore" db:"total_score"`
	Band           string    `json:"band" db:"band"`
	ReferralStatus string    `json:"referralStatus" db:"referral_status"`
	CompletedAt    time.Time `json:"completedAt" db:"completed_at"`
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
}

type CreateScreeningRequest struct {
	ID          string    `json:"id" binding:"required,uuid"`
	Instrument  string    `json:"instrument" binding:"required"`
	Mode        string    `json:"mode" binding:"required"`
	County      *string   `json:"county" binding:"omitempty,max=64"`
	Answers     []int     `json:"answers" binding:"required"`
	CompletedAt time.Time `json:"completedAt" binding:"required"`
}

type CrisisAlert struct {
	ID         string     `json:"id" db:"id"`
	UserID     string     `json:"userId" db:"user_id"`
	Severity   string     `json:"severity" db:"severity"`
	Message    string     `json:"message" db:"message"`
	Location   string     `json:"location" db:"location"`
	Status     string     `json:"status" db:"status"`
	CreatedAt  time.Time  `json:"createdAt" db:"created_at"`
	ResolvedAt *time.Time `json:"resolvedAt" db:"resolved_at"`
}

type SafetyPlan struct {
	ID                    string    `json:"id" db:"id"`
	UserID                string    `json:"userId" db:"user_id"`
	WarningSigns          string    `json:"warningSigns" db:"warning_signs"`
	CopingStrategies      string    `json:"copingStrategies" db:"coping_strategies"`
	SupportContacts       string    `json:"supportContacts" db:"support_contacts"`
	ProfessionalContacts  string    `json:"professionalContacts" db:"professional_contacts"`
	EnvironmentSafety     string    `json:"environmentSafety" db:"environment_safety"`
	CreatedAt             time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt             time.Time `json:"updatedAt" db:"updated_at"`
}

type EmergencyContact struct {
	ID           string    `json:"id" db:"id"`
	UserID       string    `json:"userId" db:"user_id"`
	Name         string    `json:"name" db:"name"`
	Phone        string    `json:"phone" db:"phone"`
	Relationship string    `json:"relationship" db:"relationship"`
	IsPrimary    bool      `json:"isPrimary" db:"is_primary"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
}

// Request/Response models
type RegisterRequest struct {
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=8"`
	ConfirmPassword string `json:"confirmPassword" binding:"required"`
	FirstName       string `json:"firstName" binding:"required"`
	LastName        string `json:"lastName" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	User         User   `json:"user"`
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

type SendMessageRequest struct {
	SessionID   string `json:"sessionId"`
	Content     string `json:"content" binding:"required"`
	MessageType string `json:"messageType"`
}

type UserStats struct {
	CurrentStreak   int     `json:"currentStreak"`
	TotalSessions   int     `json:"totalSessions"`
	MoodScore       float64 `json:"moodScore"`
	ResourcesViewed int     `json:"resourcesViewed"`
	DaysActive      int     `json:"daysActive"`
}