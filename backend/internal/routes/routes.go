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
	auth.Post("/verify-email", handlers.VerifyEmail)
	auth.Post("/resend-otp", handlers.ResendOTP)

	auth.Post("/forgot-password", handlers.ForgotPassword)
	auth.Post("/reset-password", handlers.ResetPassword)

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
	app.Get("/herbs", handlers.GetAllHerbs)
	app.Get("/herbs/:id", handlers.GetHerbByID)
	app.Post("/herbs", handlers.CreateHerb)
	app.Put("/herbs/:id", handlers.UpdateHerb)
	app.Delete("/herbs/:id", handlers.DeleteHerb)
	app.Get("/herbs/search", handlers.SearchByTag)

	// Articles
	articles := app.Group("/articles")
	articles.Get("/", handlers.GetAllArticles)
	articles.Get("/search", handlers.SearchArticleByTag)
	articles.Get("/:id", handlers.GetArticleByID)
	articles.Post("/", middleware.AuthMiddleware(), handlers.CreateArticle)
	articles.Put("/:id", middleware.AuthMiddleware(), handlers.UpdateArticle)
	articles.Delete("/:id", middleware.AuthMiddleware(), handlers.DeleteArticle)

	// User route — ต้อง login
	app.Post("/reports", middleware.AuthMiddleware(), handlers.CreateReport)

	// Admin routes — ต้อง login + เป็น admin
	// (ปรับ middleware.AdminRequired ตามระบบ Auth ที่มี)
	admin := app.Group("/admin", middleware.AuthMiddleware() /*, middleware.AdminRequired */)
	admin.Get("/reports", handlers.GetReports)
	admin.Get("/reports/:id", handlers.GetReportByID)
	admin.Patch("/reports/:id", handlers.UpdateReportStatus)
}
