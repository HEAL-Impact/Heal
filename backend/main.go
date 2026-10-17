package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/heal/internal/config"
	"github.com/heal/internal/database"
	"github.com/heal/internal/handlers"
	"github.com/heal/internal/middleware"
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

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	chatHandler := handlers.NewChatHandler(chatService)
	resourceHandler := handlers.NewResourceHandler(resourceService)
	crisisHandler := handlers.NewCrisisHandler(crisisService)
	userHandler := handlers.NewUserHandler(userService)

	// Setup router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		// In production, you should specify the actual origin instead of "*"
		AllowOrigins:     []string{"*"},
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
