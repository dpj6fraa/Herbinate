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

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	mux.Handle("/me", AuthMiddleware(http.HandlerFunc(userHandler.Me)))

	return withCORS(mux)
}
