package database

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

func Initialize(databaseURL string) (*sql.DB, error) {
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	if err := createTables(db); err != nil {
		return nil, fmt.Errorf("failed to create tables: %w", err)
	}

	return db, nil
}

func createTables(db *sql.DB) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			first_name TEXT NOT NULL,
			last_name TEXT NOT NULL,
			email_verified BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		`CREATE TABLE IF NOT EXISTS user_profiles (
			user_id TEXT PRIMARY KEY,
			avatar_url TEXT,
			phone TEXT,
			date_of_birth DATE,
			emergency_contact_name TEXT,
			emergency_contact_phone TEXT,
			preferences TEXT, -- JSON
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)`,

		`CREATE TABLE IF NOT EXISTS chat_sessions (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			title TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)`,

		`CREATE TABLE IF NOT EXISTS chat_messages (
			id TEXT PRIMARY KEY,
			session_id TEXT NOT NULL,
			user_id TEXT NOT NULL,
			content TEXT NOT NULL,
			sender_type TEXT NOT NULL, -- 'user' or 'ai'
			message_type TEXT DEFAULT 'text', -- 'text', 'audio', 'video'
			metadata TEXT, -- JSON for additional data
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)`,

		`CREATE TABLE IF NOT EXISTS resources (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT NOT NULL,
			content TEXT NOT NULL,
			type TEXT NOT NULL, -- 'article', 'video', 'audio', 'exercise', 'assessment', 'contact'
			category TEXT NOT NULL,
			difficulty TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'Easy'
			duration_minutes INTEGER,
			rating REAL DEFAULT 0,
			featured BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		`CREATE TABLE IF NOT EXISTS user_resource_progress (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			resource_id TEXT NOT NULL,
			progress REAL DEFAULT 0, -- 0-100
			completed BOOLEAN DEFAULT FALSE,
			favorited BOOLEAN DEFAULT FALSE,
			last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
			UNIQUE(user_id, resource_id)
		)`,

		`CREATE TABLE IF NOT EXISTS mood_logs (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			mood_score INTEGER NOT NULL, -- 1-10
			notes TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)`,

		`CREATE TABLE IF NOT EXISTS crisis_alerts (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
			message TEXT,
			location TEXT, -- JSON with lat/lng
			status TEXT DEFAULT 'active', -- 'active', 'resolved', 'escalated'
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			resolved_at TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)`,

		`CREATE TABLE IF NOT EXISTS safety_plans (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			warning_signs TEXT, -- JSON array
			coping_strategies TEXT, -- JSON array
			support_contacts TEXT, -- JSON array
			professional_contacts TEXT, -- JSON array
			environment_safety TEXT, -- JSON
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)`,

		`CREATE TABLE IF NOT EXISTS emergency_contacts (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			name TEXT NOT NULL,
			phone TEXT NOT NULL,
			relationship TEXT,
			is_primary BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)`,
	}

	for _, query := range queries {
		if _, err := db.Exec(query); err != nil {
			return fmt.Errorf("failed to execute query: %s, error: %w", query, err)
		}
	}

	// Insert sample resources including Kenyan crisis contacts
	if err := insertSampleData(db); err != nil {
		return fmt.Errorf("failed to insert sample data: %w", err)
	}

	return nil
}

func insertSampleData(db *sql.DB) error {
	// Check if resources already exist
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM resources").Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		return nil // Data already exists
	}

	resources := []struct {
		id          string
		title       string
		description string
		content     string
		rType       string
		category    string
		difficulty  string
		duration    int
		rating      float64
		featured    bool
	}{
		// Mental Health Resources
		{
			"1", "Understanding Anxiety: A Complete Guide",
			"Learn about anxiety symptoms, triggers, and evidence-based coping strategies.",
			"Anxiety is a natural response to stress, but when it becomes overwhelming, it can significantly impact your daily life. This comprehensive guide covers the different types of anxiety disorders, common symptoms like racing thoughts and physical tension, and practical coping strategies including breathing exercises, grounding techniques, and cognitive behavioral therapy approaches. You'll learn how to identify your personal anxiety triggers and develop a toolkit of healthy responses.",
			"article", "anxiety", "beginner", 15, 4.8, true,
		},
		{
			"2", "Guided Meditation for Depression",
			"A 20-minute guided meditation specifically designed for managing depressive symptoms.",
			"This meditation focuses on self-compassion and gentle awareness, helping you navigate difficult emotions with kindness. The session includes breathing exercises, body awareness, and loving-kindness practices specifically tailored for those experiencing depression. Regular practice can help improve mood, reduce negative self-talk, and build emotional resilience.",
			"audio", "depression", "beginner", 20, 4.9, true,
		},
		{
			"3", "Cognitive Behavioral Therapy Techniques",
			"Interactive exercises to help identify and change negative thought patterns.",
			"CBT is one of the most effective treatments for depression and anxiety. This resource provides practical exercises for identifying cognitive distortions, challenging negative thoughts, and developing more balanced thinking patterns. Includes thought records, behavioral activation techniques, and homework assignments to practice between sessions.",
			"exercise", "depression", "intermediate", 30, 4.7, false,
		},
		{
			"4", "Building Healthy Relationships",
			"Video series on communication skills and boundary setting.",
			"Healthy relationships are fundamental to mental wellbeing. This video series covers effective communication techniques, how to set and maintain healthy boundaries, conflict resolution skills, and building trust. Learn to recognize unhealthy relationship patterns and develop the skills needed for meaningful connections.",
			"video", "relationships", "beginner", 25, 4.6, true,
		},
		{
			"5", "Stress Assessment Quiz",
			"Evaluate your stress levels and get personalized recommendations.",
			"This comprehensive assessment helps identify your stress patterns, triggers, and current coping mechanisms. Based on your responses, you'll receive personalized recommendations for stress management techniques, lifestyle changes, and resources for further support.",
			"assessment", "stress", "beginner", 10, 4.5, false,
		},
		{
			"6", "Advanced Mindfulness Practices",
			"Deep dive into mindfulness techniques for experienced practitioners.",
			"These advanced practices build on basic mindfulness skills and include body scanning, walking meditation, mindful eating, and integration of mindfulness into daily activities. Suitable for those who have established a regular meditation practice and want to deepen their understanding.",
			"exercise", "self-care", "advanced", 45, 4.8, false,
		},

		// Kenyan Crisis Support Contacts
		{
			"kenya-befrienders", "Befrienders Kenya",
			"Provides emotional support to those in distress through confidential listening.",
			"Befrienders Kenya offers 24/7 emotional support through trained volunteers who provide a safe space to talk about your feelings. They offer confidential telephone support for people experiencing emotional distress, depression, or suicidal thoughts. Services are free and available in English and Kiswahili.\n\nCall: +254 722 178 177\nEmail: info@befrienderskenya.org\nWebsite: www.befrienderskenya.org",
			"contact", "Crisis Support", "Easy", 5, 4.8, true,
		},
		{
			"kenya-eplus", "Emergency Plus Medical Services (E-Plus)",
			"Offers ambulance and pre-hospital emergency medical services across Kenya.",
			"E-Plus provides 24/7 emergency medical services including ambulance services, emergency medical care, and crisis intervention. They have trained medical professionals who can respond to mental health emergencies and provide immediate support while connecting you to appropriate mental health services.\n\nEmergency Line: +254 700 395 395\nAlternative: +254 733 395 395\nWebsite: www.eplus.co.ke",
			"contact", "Crisis Support", "Easy", 5, 4.7, true,
		},
		{
			"kenya-redcross", "Kenya Red Cross Society",
			"Provides humanitarian services, including disaster response and emergency support.",
			"Kenya Red Cross offers psychosocial support services, emergency response, and community-based mental health programs. They provide crisis counseling, trauma support, and can connect you with local mental health resources. Available nationwide with trained counselors.\n\nHotline: +254 703 037 000\nAlternative: +254 20 3950000\nEmail: info@redcross.or.ke\nWebsite: www.redcross.or.ke",
			"contact", "Crisis Support", "Easy", 5, 4.6, true,
		},
		{
			"kenya-mental-health", "Kenya Association for Mental Health",
			"Dedicated to promoting mental health awareness and providing support services.",
			"KAMH provides mental health advocacy, counseling services, and community outreach programs. They offer support groups, individual counseling, and crisis intervention services. They also provide training and education on mental health issues.\n\nPhone: +254 20 2717077\nMobile: +254 722 364 456\nEmail: info@mentalhealthkenya.org\nWebsite: www.mentalhealthkenya.org",
			"contact", "Crisis Support", "Easy", 5, 4.5, true,
		},
		{
			"kenya-police", "Kenya Police Emergency Services",
			"National police emergency services for immediate crisis intervention.",
			"For immediate emergency situations involving threats to personal safety, domestic violence, or when someone is in immediate danger. Police can provide immediate intervention and connect you with appropriate mental health crisis services.\n\nEmergency: 999\nAlternative: 911\nPolice Hotline: +254 20 341 4906",
			"contact", "Crisis Support", "Easy", 5, 4.4, true,
		},
		{
			"kenya-childline", "Childline Kenya",
			"24/7 helpline for children and young people in crisis.",
			"Childline Kenya provides free, confidential support for children and young people (up to 18 years) facing any kind of problem including mental health issues, abuse, family problems, or suicidal thoughts. Trained counselors provide immediate support and referrals.\n\nToll-Free: 116\nAlternative: +254 20 2671757\nWebsite: www.childlinekenya.co.ke",
			"contact", "Crisis Support", "Easy", 5, 4.7, true,
		},
		{
			"kenya-gender-violence", "Gender Violence Recovery Centre",
			"Specialized support for survivors of gender-based violence.",
			"GVRC provides comprehensive support for survivors of gender-based violence including counseling, legal aid, medical support, and safe shelter. They have trained counselors who understand trauma and can provide specialized mental health support.\n\nHotline: +254 709 660 000\nNairobi: +254 20 2731313\nWebsite: www.gvrc.or.ke",
			"contact", "Crisis Support", "Easy", 5, 4.6, true,
		},
		{
			"kenya-samaritans", "Samaritans Kenya",
			"Emotional support and suicide prevention services.",
			"Samaritans Kenya provides confidential emotional support to anyone experiencing feelings of distress or despair, including those having suicidal thoughts. Trained volunteers offer non-judgmental listening and support 24/7.\n\nNairobi: +254 722 178 177\nMombasa: +254 41 222 5555\nEmail: samaritanskenya@gmail.com",
			"contact", "Crisis Support", "Easy", 5, 4.8, true,
		},
	}

	for _, r := range resources {
		_, err := db.Exec(`
			INSERT INTO resources (id, title, description, content, type, category, difficulty, duration_minutes, rating, featured)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		`, r.id, r.title, r.description, r.content, r.rType, r.category, r.difficulty, r.duration, r.rating, r.featured)
		if err != nil {
			return err
		}
	}

	return nil
}
