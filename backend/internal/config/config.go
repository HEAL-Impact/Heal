package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	JWTSecret   string
	Port        string
	Environment string
	ReportKey   string

	// Care routing (partners and WhatsApp group alerts)
	AppURL                string
	WhatsAppGatewayURL    string
	WhatsAppGatewayToken  string
	WhatsAppWebhookSecret string
	CoordinatorGroupID    string
	PartnerAdminEmail     string
	PartnerAdminPassword  string
	AllowedOrigins        string
}

func Load() *Config {
	// Load .env file if it exists
	godotenv.Load()

	return &Config{
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/heal?sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production"),
		Port:        getEnv("PORT", "8080"),
		Environment: getEnv("ENVIRONMENT", "development"),
		// Encrypts GBV reports at rest. Set a long random value in production.
		ReportKey: getEnv("REPORT_ENCRYPTION_KEY", ""),

		// Links in WhatsApp alerts point here.
		AppURL: getEnv("HEAL_APP_URL", "http://localhost:3000"),
		// A WhatsApp gateway that can post to groups (e.g. Whapi.Cloud). Unset: alerts go to the log.
		WhatsAppGatewayURL:    getEnv("WHATSAPP_GATEWAY_URL", ""),
		WhatsAppGatewayToken:  getEnv("WHATSAPP_GATEWAY_TOKEN", ""),
		WhatsAppWebhookSecret: getEnv("WHATSAPP_WEBHOOK_SECRET", ""),
		// The HEAL coordinator desk's WhatsApp group (the default route of last resort).
		CoordinatorGroupID: getEnv("HEAL_COORDINATOR_WHATSAPP_GROUP", ""),
		// The first partner admin, created on start when no admin exists.
		PartnerAdminEmail:    getEnv("PARTNER_ADMIN_EMAIL", ""),
		PartnerAdminPassword: getEnv("PARTNER_ADMIN_PASSWORD", ""),
		// Comma-separated frontend origins allowed by CORS ("*" when unset in development).
		AllowedOrigins: getEnv("ALLOWED_ORIGINS", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
