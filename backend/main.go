package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/heal/internal/config"
	"github.com/heal/internal/database"
	"github.com/heal/internal/handlers"
	"github.com/heal/internal/middleware"
	"github.com/heal/internal/notify"
	"github.com/heal/internal/reports"
	"github.com/heal/internal/services"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer db.Close()

	// Initialize services
	authService := services.NewAuthService(db, cfg.JWTSecret)
	chatService := services.NewChatService(db)
	resourceService := services.NewResourceService(db)
	crisisService := services.NewCrisisService(db)
	userService := services.NewUserService(db)
	screeningService := services.NewScreeningService(db)

	reportKey := cfg.ReportKey
	if reportKey == "" {
		if cfg.Environment == "production" {
			log.Fatal("REPORT_ENCRYPTION_KEY must be set in production")
		}
		log.Println("REPORT_ENCRYPTION_KEY not set; using a development-only key")
		reportKey = "development-only-report-key-" + cfg.JWTSecret
	}
	reportCipher, err := reports.NewCipher(reportKey)
	if err != nil {
		log.Fatal("Invalid report encryption key:", err)
	}
	reportService := services.NewReportService(db, reportCipher)

	// Care routing: cases, partner alerts to WhatsApp groups, escalation.
	careService := services.NewCareService(db, reportCipher, notify.New(cfg.WhatsAppGatewayURL, cfg.WhatsAppGatewayToken), cfg.AppURL)
	careService.EnsureDefaultCoordinator(cfg.CoordinatorGroupID)
	partnerAuth := services.NewPartnerAuthService(db, cfg.JWTSecret)
	partnerAuth.EnsureAdmin(cfg.PartnerAdminEmail, cfg.PartnerAdminPassword)
	careService.StartWorker(context.Background())

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	chatHandler := handlers.NewChatHandler(chatService)
	resourceHandler := handlers.NewResourceHandler(resourceService)
	crisisHandler := handlers.NewCrisisHandler(crisisService)
	userHandler := handlers.NewUserHandler(userService)
	screeningHandler := handlers.NewScreeningHandler(screeningService)
	reportHandler := handlers.NewReportHandler(reportService, careService)
	careHandler := handlers.NewCareHandler(careService, partnerAuth, cfg.WhatsAppWebhookSecret)

	// Setup router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		// In production, you should specify the actual origin instead of "*"
		AllowOrigins:     allowedOrigins(cfg),
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "heal-api",
			"version": "1.0.0",
		})
	})

	// API routes
	api := router.Group("/api/v1")
	{
		// Authentication routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/logout", middleware.AuthRequired(authService), authHandler.Logout)
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.POST("/forgot-password", authHandler.ForgotPassword)
			auth.POST("/reset-password", authHandler.ResetPassword)
			auth.GET("/verify-email/:token", authHandler.VerifyEmail)
		}

		// Anonymous reports: no account needed, so survivors aren't identified.
		api.POST("/reports", reportHandler.CreateReport)
		api.GET("/reports/:code", reportHandler.GetReportStatus)

		// Care cases opened by survivors (no account). The case code is the only key.
		api.POST("/cases", careHandler.CreateCase)
		api.GET("/cases/:code", careHandler.CaseStatus)
		api.POST("/cases/:code/withdraw", careHandler.Withdraw)
		api.POST("/cases/:code/feedback", careHandler.Feedback)

		// Partner staff (separate accounts and tokens from survivors).
		api.POST("/partner/login", careHandler.Login)
		api.POST("/partner/register", careHandler.RegisterPartner)
		api.POST("/partner/whatsapp/webhook", careHandler.WhatsAppWebhook)
		partner := api.Group("/partner")
		partner.Use(middleware.PartnerAuthRequired(partnerAuth))
		{
			partner.GET("/me", careHandler.Me)
			partner.GET("/cases", careHandler.ListCases)
			partner.GET("/cases/:id", careHandler.GetCase)
			partner.POST("/cases/:id/actions", careHandler.Act)
			partner.GET("/partners", middleware.PartnerAuthRequired(partnerAuth, services.RoleAdmin, services.RoleCoordinator), careHandler.ListPartners)
			partner.GET("/directory", careHandler.Directory)
			partner.GET("/insights", middleware.PartnerAuthRequired(partnerAuth, services.RoleAdmin, services.RoleCoordinator), careHandler.Insights)
		}
		admin := api.Group("/partner/admin")
		admin.Use(middleware.PartnerAuthRequired(partnerAuth, services.RoleAdmin))
		{
			admin.POST("/partners", careHandler.SavePartner)
			admin.PUT("/partners/:id", careHandler.SavePartner)
			admin.PUT("/partners/:id/review", careHandler.ReviewPartner)
			admin.GET("/accounts", careHandler.ListAccounts)
			admin.POST("/accounts", careHandler.CreateAccount)
			admin.PUT("/accounts/:id/active", careHandler.SetAccountActive)
		}

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.AuthRequired(authService))
		{
			// User routes
			user := protected.Group("/user")
			{
				user.GET("/profile", userHandler.GetProfile)
				user.PUT("/profile", userHandler.UpdateProfile)
				user.GET("/stats", userHandler.GetStats)
				user.POST("/mood", userHandler.LogMood)
				user.GET("/mood-history", userHandler.GetMoodHistory)
			}

			// Chat routes
			chat := protected.Group("/chat")
			{
				chat.POST("/message", chatHandler.SendMessage)
				chat.GET("/history", chatHandler.GetChatHistory)
				chat.GET("/sessions", chatHandler.GetChatSessions)
				chat.DELETE("/session/:id", chatHandler.DeleteChatSession)
				chat.POST("/feedback", chatHandler.SubmitFeedback)
			}

			// Resource routes
			resources := protected.Group("/resources")
			{
				resources.GET("/", resourceHandler.GetResources)
				resources.GET("/:id", resourceHandler.GetResource)
				resources.GET("/categories", resourceHandler.GetCategories)
				resources.POST("/:id/progress", resourceHandler.UpdateProgress)
				resources.GET("/recommendations", resourceHandler.GetRecommendations)
				resources.POST("/:id/favorite", resourceHandler.ToggleFavorite)
			}

			// Crisis routes
			crisis := protected.Group("/crisis")
			{
				crisis.POST("/alert", crisisHandler.CreateCrisisAlert)
				crisis.GET("/contacts", crisisHandler.GetEmergencyContacts)
				crisis.POST("/contacts", crisisHandler.AddEmergencyContact)
				crisis.GET("/services", crisisHandler.GetLocalServices)
				crisis.POST("/safety-plan", crisisHandler.CreateSafetyPlan)
				crisis.GET("/safety-plan", crisisHandler.GetSafetyPlan)
			}

			// Screening routes ("" rather than "/" so /screenings doesn't redirect)
			screenings := protected.Group("/screenings")
			{
				screenings.POST("", screeningHandler.CreateScreening)
				screenings.GET("", screeningHandler.GetScreenings)
				screenings.GET("/:id", screeningHandler.GetScreening)
			}
		}
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

// allowedOrigins restricts CORS to the frontend when ALLOWED_ORIGINS is set.
func allowedOrigins(cfg *config.Config) []string {
	if cfg.AllowedOrigins == "" {
		if cfg.Environment == "production" {
			log.Println("ALLOWED_ORIGINS not set in production; allowing every origin")
		}
		return []string{"*"}
	}
	var out []string
	for _, o := range strings.Split(cfg.AllowedOrigins, ",") {
		if o = strings.TrimSpace(o); o != "" {
			out = append(out, o)
		}
	}
	return out
}
