package http

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"myapp/internal/auth"
	"myapp/internal/domain"
	"myapp/internal/repository"
)

type AuthHandler struct {
	Users *repository.UserRepository
}

type authRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Username string `json:"username"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	// Log request details
	log.Printf("Register request: Method=%s, ContentType=%s", r.Method, r.Header.Get("Content-Type"))

	var req authRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Decode error: %v", err)
		http.Error(w, "invalid body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Log received data (ไม่แสดง password จริงๆ)
	log.Printf("Received: email=%s, username=%s, password_length=%d", req.Email, req.Username, len(req.Password))

	// Validation
	if req.Email == "" || req.Password == "" || req.Username == "" {
		log.Printf("Validation failed: empty fields")
		http.Error(w, "กรุณากรอกข้อมูลให้ครบถ้วน", http.StatusBadRequest)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		log.Printf("Bcrypt error: %v", err)
		http.Error(w, "encryption error", http.StatusInternalServerError)
		return
	}

	user := &domain.User{
		ID:           uuid.NewString(),
		Email:        req.Email,
		Username:     req.Username,
		PasswordHash: string(hash),
	}

	if err := h.Users.Create(user); err != nil {
		log.Printf("Database error: %v", err)
		http.Error(w, "email already exists", http.StatusBadRequest)
		return
	}

	log.Printf("User created successfully: %s", req.Email)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "success",
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req authRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	user, err := h.Users.FindByEmail(req.Email)
	if err != nil || user == nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	if bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(req.Password),
	) != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	token, err := auth.GenerateToken(user.ID)
	if err != nil {
		http.Error(w, "token error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"token": token,
	})
}
