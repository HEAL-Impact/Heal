package services

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/google/generative-ai-go/genai"
	"github.com/google/uuid"
	"github.com/heal/internal/models"
	"google.golang.org/api/option"
)

type ChatService struct {
	db *sql.DB
}

func NewChatService(db *sql.DB) *ChatService {
	return &ChatService{db: db}
}

func (s *ChatService) GetAIResponse(message string) (string, error) {
	apiKey := os.Getenv("NEXT_PUBLIC_GEMINI_API_KEY")
	if apiKey == "" {
		return "Gemini API key not configured", nil
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatal(err)
		return "", err
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash")
	// Add context for the AI
	contexto := "Your name is Nia,You are a compassionate AI mental health companion. Provide supportive, empathetic responses while maintaining professional boundaries. If the user expresses thoughts of self-harm, gently guide them to seek professional help."
	resp, err := model.GenerateContent(ctx, genai.Text(contexto), genai.Text(message))
	if err != nil {
		return "", err
	}

	var responseText string
	for _, cand := range resp.Candidates {
		if cand.Content != nil {
			for _, part := range cand.Content.Parts {
				if txt, ok := part.(genai.Text); ok {
					responseText += string(txt)
				}
			}
		}
	}

	return responseText, nil
}

func (s *ChatService) GetOrCreateSession(userID, sessionID string) (*models.ChatSession, error) {
	// If sessionID is provided, try to get existing session
	if sessionID != "" {
		session, err := s.getChatSession(userID, sessionID)
		if err == nil {
			return session, nil
		}
		// If session not found, create new one with provided ID
	}

	// Create new session
	if sessionID == "" {
		sessionID = uuid.New().String()
	}

	now := time.Now()
	title := fmt.Sprintf("Chat Session - %s", now.Format("Jan 2, 2006 3:04 PM"))

	_, err := s.db.Exec(`
		INSERT INTO chat_sessions (id, user_id, title, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
	`, sessionID, userID, title, now, now)
	if err != nil {
		return nil, fmt.Errorf("failed to create chat session: %w", err)
	}

	return &models.ChatSession{
		ID:        sessionID,
		UserID:    userID,
		Title:     title,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

func (s *ChatService) getChatSession(userID, sessionID string) (*models.ChatSession, error) {
	session := &models.ChatSession{}
	err := s.db.QueryRow(`
		SELECT id, user_id, title, created_at, updated_at
		FROM chat_sessions
		WHERE id = $1 AND user_id = $2
	`, sessionID, userID).Scan(&session.ID, &session.UserID, &session.Title,
		&session.CreatedAt, &session.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return session, nil
}

func (s *ChatService) SaveMessage(sessionID, userID, content, senderType, messageType string) (*models.ChatMessage, error) {
	messageID := uuid.New().String()
	now := time.Now()

	_, err := s.db.Exec(`
		INSERT INTO chat_messages (id, session_id, user_id, content, sender_type, message_type, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, messageID, sessionID, userID, content, senderType, messageType, now)
	if err != nil {
		return nil, fmt.Errorf("failed to save message: %w", err)
	}

	// Update session timestamp
	_, err = s.db.Exec(`
		UPDATE chat_sessions SET updated_at = $1 WHERE id = $2
	`, now, sessionID)
	if err != nil {
		// Log error but don't fail the message save
		fmt.Printf("Warning: failed to update session timestamp: %v\n", err)
	}

	return &models.ChatMessage{
		ID:          messageID,
		SessionID:   sessionID,
		UserID:      userID,
		Content:     content,
		SenderType:  senderType,
		MessageType: messageType,
		CreatedAt:   now,
	}, nil
}

func (s *ChatService) GetChatHistory(userID, sessionID string, limit, offset int) ([]models.ChatMessage, error) {
	// Verify session belongs to user
	_, err := s.getChatSession(userID, sessionID)
	if err != nil {
		return nil, fmt.Errorf("session not found or access denied")
	}

	query := `
		SELECT id, session_id, user_id, content, sender_type, message_type, 
		       COALESCE(metadata, '{}'), created_at
		FROM chat_messages
		WHERE session_id = $1
		ORDER BY created_at ASC
		LIMIT $2 OFFSET $3
	`

	rows, err := s.db.Query(query, sessionID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.ChatMessage
	for rows.Next() {
		var message models.ChatMessage
		err := rows.Scan(&message.ID, &message.SessionID, &message.UserID,
			&message.Content, &message.SenderType, &message.MessageType,
			&message.Metadata, &message.CreatedAt)
		if err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}

	return messages, nil
}

func (s *ChatService) GetChatSessions(userID string, limit, offset int) ([]models.ChatSession, error) {
	query := `
		SELECT id, user_id, title, created_at, updated_at
		FROM chat_sessions
		WHERE user_id = $1
		ORDER BY updated_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := s.db.Query(query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []models.ChatSession
	for rows.Next() {
		var session models.ChatSession
		err := rows.Scan(&session.ID, &session.UserID, &session.Title,
			&session.CreatedAt, &session.UpdatedAt)
		if err != nil {
			return nil, err
		}
		sessions = append(sessions, session)
	}

	return sessions, nil
}

func (s *ChatService) DeleteChatSession(userID, sessionID string) error {
	// Verify session belongs to user
	_, err := s.getChatSession(userID, sessionID)
	if err != nil {
		return fmt.Errorf("session not found or access denied")
	}

	// Delete messages first (due to foreign key constraint)
	_, err = s.db.Exec("DELETE FROM chat_messages WHERE session_id = $1", sessionID)
	if err != nil {
		return fmt.Errorf("failed to delete messages: %w", err)
	}

	// Delete session
	_, err = s.db.Exec("DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2", sessionID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}

	return nil
}

func (s *ChatService) SubmitFeedback(userID, sessionID, messageID string, rating int, feedback string) error {
	// Verify session belongs to user
	_, err := s.getChatSession(userID, sessionID)
	if err != nil {
		return fmt.Errorf("session not found or access denied")
	}

	// For now, we'll store feedback in the message metadata
	// In a production system, you might want a separate feedback table
	feedbackJSON := fmt.Sprintf(`{"rating": %d, "feedback": "%s", "submitted_at": "%s"}`,
		rating, feedback, time.Now().Format(time.RFC3339))

	_, err = s.db.Exec(`
		UPDATE chat_messages 
		SET metadata = $1 
		WHERE id = $2 AND session_id = $3
	`, feedbackJSON, messageID, sessionID)
	if err != nil {
		return fmt.Errorf("failed to save feedback: %w", err)
	}

	return nil
}
