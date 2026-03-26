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
	posts.Get("/detail", middleware.OptionalAuthMiddleware(), postHandler.PostDetail)
	posts.Get("/feed", middleware.OptionalAuthMiddleware(), postHandler.PostFeed)
	posts.Post("/like", middleware.AuthMiddleware(), postHandler.LikePost)
	posts.Post("/unlike", middleware.AuthMiddleware(), postHandler.UnlikePost)
	posts.Post("/comment", middleware.AuthMiddleware(), postHandler.AddComment)
	posts.Get("/comments", postHandler.GetComments)
	posts.Post("/share", middleware.AuthMiddleware(), postHandler.SharePost)
	posts.Delete("/delete", middleware.AuthMiddleware(), postHandler.DeletePost)
	posts.Delete("/comment", middleware.AuthMiddleware(), postHandler.DeleteComment)
	posts.Put("/edit", middleware.AuthMiddleware(), postHandler.EditPost)
	posts.Get("/my-comments", middleware.AuthMiddleware(), postHandler.GetMyComments)
	// Routes สำหรับ Bookmark Posts
	posts.Post("/bookmark", middleware.AuthMiddleware(), postHandler.ToggleBookmarkPost)
	posts.Get("/bookmark/status", middleware.AuthMiddleware(), postHandler.GetPostBookmarkStatus)

	// ==========================================
	// Herbs Routes
	// ==========================================
	herbs := api.Group("/herbs")
	herbs.Get("/", handlers.GetAllHerbs)
	herbs.Get("/search", handlers.SearchByTag)

	// 🌟 เพิ่ม Routes สำหรับ Bookmark (ต้อง Login)
	herbs.Get("/bookmarks", middleware.AuthMiddleware(), handlers.GetAllBookmarkedHerbs)

	// Routes ที่รับ :id ต้องอยู่หลัง /search และ /bookmarks
	herbs.Get("/:id", handlers.GetHerbByID)
	herbs.Post("/", handlers.CreateHerb) // ถ้าอยากล็อคให้เฉพาะแอดมินสร้างได้ อย่าลืมใส่ AuthMiddleware นะครับ
	herbs.Put("/:id", handlers.UpdateHerb)
	herbs.Delete("/:id", handlers.DeleteHerb)

	// 🌟 เพิ่ม Routes จัดการ Bookmark ของสมุนไพรแต่ละตัว (ต้อง Login)
	herbs.Post("/:id/bookmark", middleware.AuthMiddleware(), handlers.ToggleBookmarkHerb)
	herbs.Get("/:id/bookmark", middleware.AuthMiddleware(), handlers.GetHerbBookmarkStatus)
	posts.Get("/bookmarks", middleware.AuthMiddleware(), postHandler.GetAllBookmarkedPosts)

	// Articles
	articles := api.Group("/articles")
	articles.Get("/", handlers.GetAllArticles)
	articles.Get("/search", handlers.SearchArticleByTag)
	articles.Get("/bookmarks", middleware.AuthMiddleware(), handlers.GetAllBookmarkedArticles)
	articles.Get("/:id", handlers.GetArticleByID)
	articles.Post("/", middleware.AuthMiddleware(), handlers.CreateArticle)
	articles.Put("/:id", middleware.AuthMiddleware(), handlers.UpdateArticle)
	articles.Delete("/:id", middleware.AuthMiddleware(), handlers.DeleteArticle)
	articles.Post("/:id/bookmark", middleware.AuthMiddleware(), handlers.ToggleBookmarkArticle)
	articles.Get("/:id/bookmark", middleware.AuthMiddleware(), handlers.GetArticleBookmarkStatus)

	// User route — ต้อง login
	api.Post("/reports", middleware.AuthMiddleware(), handlers.CreateReport)
	api.Get("/reports/my-reports", middleware.AuthMiddleware(), handlers.GetMyReports)

	// Admin routes — ต้อง login + เป็น admin
	admin := api.Group("/admin", middleware.AuthMiddleware() /*, middleware.AdminRequired */)
	admin.Get("/reports", handlers.GetReports)
	admin.Get("/reports/:id", handlers.GetReportByID)
	admin.Patch("/reports/:id", handlers.UpdateReportStatus)
}
