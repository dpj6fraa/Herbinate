package http

import (
	"net/http"

	"myapp/internal/db"
	"myapp/internal/repository"
	"myapp/internal/service"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	dbConn, err := db.NewPostgres()
	if err != nil {
		panic(err)
	}

	otpRepo := &repository.OTPRepository{DB: dbConn}
	otpService := service.NewOTPService()
	userRepo := &repository.UserRepository{DB: dbConn}
	userHandler := &UserHandler{Users: userRepo}
	emailService := service.NewEmailService() //
	auth := &AuthHandler{Users: userRepo, OTPs: otpRepo, OTP: otpService, Email: emailService}
	postRepo := &repository.PostRepository{DB: dbConn}
	postHandler := &PostHandler{Posts: postRepo}

	mux.HandleFunc("/auth/register", auth.Register)
	mux.HandleFunc("/auth/login", auth.Login)
	mux.HandleFunc("/auth/verify-email", auth.VerifyEmail)
	mux.HandleFunc("/auth/resend-otp", auth.ResendOTP)
	fs := http.FileServer(http.Dir("./uploads"))
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", fs))

	mux.Handle("/users/username",
		AuthMiddleware(http.HandlerFunc(userHandler.UpdateUsername)))

	mux.Handle("/users/profile-image",
		AuthMiddleware(http.HandlerFunc(userHandler.UploadProfileImage)))

	// POST-------------------------------------------------------------------
	//mux.HandleFunc("/posts", postHandler.List) // POST
	mux.Handle("/posts/create", AuthMiddleware(http.HandlerFunc(postHandler.Create)))
	mux.HandleFunc("/posts/detail", postHandler.Detail)

	mux.Handle("/posts/feed", OptionalAuthMiddleware(http.HandlerFunc(postHandler.Feed))) // GET
	mux.Handle("/posts/like", AuthMiddleware(http.HandlerFunc(postHandler.Like)))

	mux.Handle("/posts/unlike", AuthMiddleware(http.HandlerFunc(postHandler.Unlike)))

	mux.Handle("/posts/comment", AuthMiddleware(http.HandlerFunc(postHandler.AddComment)))
	mux.HandleFunc("/posts/comments", postHandler.GetComments)

	mux.Handle("/posts/share", AuthMiddleware(http.HandlerFunc(postHandler.Share)))

	mux.Handle("/posts/delete", AuthMiddleware(http.HandlerFunc(postHandler.Delete)))
	// POST-------------------------------------------------------------------

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	mux.Handle("/me", AuthMiddleware(http.HandlerFunc(userHandler.Me)))

	return withCORS(mux)
}
