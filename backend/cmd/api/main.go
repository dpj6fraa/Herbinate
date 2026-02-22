package main

import (
	"log"

	"herb-api/internal/config"
	"herb-api/internal/database"
	"herb-api/internal/middleware"
	"herb-api/internal/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to MongoDB
	database.ConnectDB()

	// Initialize Fiber app
	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	app.Use(middleware.SetupCORS())

	// Setup Routes
	routes.SetupRoutes(app)

	// Start server
	log.Printf("Server is running on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))

	app.Static("/uploads", "./uploads")
}
