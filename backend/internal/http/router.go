package http

import (
	"net/http"

	"myapp/internal/db"
	"myapp/internal/repository"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	dbConn, err := db.NewPostgres()
	if err != nil {
		panic(err)
	}

	userRepo := &repository.UserRepository{DB: dbConn}
	auth := &AuthHandler{Users: userRepo}

	mux.HandleFunc("/auth/register", auth.Register)
	mux.HandleFunc("/auth/login", auth.Login)
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	return withCORS(mux)
}
