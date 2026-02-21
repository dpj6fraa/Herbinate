package routes

import (
	"herb-api/internal/handlers"
	"herb-api/internal/middleware"
	"herb-api/internal/repository"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// Initialize Repositories
	userRepo := repository.NewUserRepository()
	postRepo := repository.NewPostRepository()

	// Initialize Handlers
	userHandler := handlers.NewUserHandler(userRepo)
	postHandler := handlers.NewPostHandler(postRepo)

	// Serve static files
	app.Static("/uploads", "./uploads")

	api := app.Group("/api")

	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("ok")
	})

	// Auth routes
	auth := api.Group("/auth")
	auth.Post("/register", handlers.Register)
	auth.Post("/login", handlers.Login)
	// TODO: Implement VerifyEmail and ResendOTP in auth_handler.go
	// auth.Post("/verify-email", handlers.VerifyEmail)
	// auth.Post("/resend-otp", handlers.ResendOTP)

	// User routes
	users := api.Group("/users")
	users.Put("/username", middleware.AuthMiddleware(), userHandler.UpdateUsername)
	users.Post("/profile-image", middleware.AuthMiddleware(), userHandler.UploadProfileImage)

	// Me route
	api.Get("/me", middleware.AuthMiddleware(), userHandler.Me)

	// Posts routes
	posts := api.Group("/posts")
	posts.Post("/create", middleware.AuthMiddleware(), postHandler.CreatePost)
	posts.Get("/detail", postHandler.PostDetail)
	posts.Get("/feed", middleware.OptionalAuthMiddleware(), postHandler.PostFeed)
	posts.Post("/like", middleware.AuthMiddleware(), postHandler.LikePost)
	posts.Post("/unlike", middleware.AuthMiddleware(), postHandler.UnlikePost)
	posts.Post("/comment", middleware.AuthMiddleware(), postHandler.AddComment)
	posts.Get("/comments", postHandler.GetComments)
	posts.Post("/share", middleware.AuthMiddleware(), postHandler.SharePost)
	posts.Delete("/delete", middleware.AuthMiddleware(), postHandler.DeletePost)

	// Herbs routes
	herbs := api.Group("/herbs")
	herbs.Get("/", handlers.GetAllHerbs)
	herbs.Get("/:id", handlers.GetHerbByID)
	herbs.Post("/", handlers.CreateHerb)
	herbs.Put("/:id", handlers.UpdateHerb)
	herbs.Delete("/:id", handlers.DeleteHerb)
}
