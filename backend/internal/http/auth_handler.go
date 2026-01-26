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
	"myapp/internal/service"
)

type AuthHandler struct {
	Users *repository.UserRepository
	OTPs  *repository.OTPRepository
	OTP   *service.OTPService
	Email *service.EmailService
}

type authRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Username string `json:"username"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req authRequest
	const DefaultProfileImage = "/uploads/profiles/default_profile_picture.png"

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" || req.Username == "" {
		http.Error(w, "กรุณากรอกข้อมูลให้ครบถ้วน", http.StatusBadRequest)
		return
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 10)

	user := &domain.User{
		ID:              uuid.NewString(),
		Email:           req.Email,
		Username:        req.Username,
		PasswordHash:    string(hash),
		IsVerified:      false,
		ProfileImageURL: DefaultProfileImage,
	}

	if err := h.Users.Create(user); err != nil {
		http.Error(w, "email already exists", http.StatusBadRequest)
		return
	}

	// Generate + save OTP
	otp := h.OTP.Generate()

	h.OTPs.Create(&domain.EmailOTP{
		Email: user.Email,
		Code:  otp,
	})

	if err := h.Email.SendOTP(user.Email, otp); err != nil {
		http.Error(w, "failed to send email", http.StatusInternalServerError)
		return
	}

	// TODO: ส่ง email จริง
	log.Printf("OTP for %s = %s", user.Email, otp)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"email": user.Email,
	})
}

func (h *AuthHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	ok := h.OTP.Verify(req.Email, req.OTP, h.OTPs)
	if !ok {
		http.Error(w, "invalid or expired otp", http.StatusUnauthorized)
		return
	}

	h.Users.MarkVerifiedByEmail(req.Email)
	h.OTPs.DeleteByEmail(req.Email)

	w.WriteHeader(http.StatusOK)
}

func (h *AuthHandler) ResendOTP(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}

	json.NewDecoder(r.Body).Decode(&req)

	user, err := h.Users.FindByEmail(req.Email)
	if err != nil || user == nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	if user.IsVerified {
		http.Error(w, "already verified", http.StatusBadRequest)
		return
	}

	otp := h.OTP.Generate()
	h.OTPs.Replace(user.Email, otp)
	h.Email.SendOTP(user.Email, otp)

	log.Printf("Resend OTP for %s = %s", req.Email, otp)
	w.WriteHeader(http.StatusOK)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req authRequest
	json.NewDecoder(r.Body).Decode(&req)

	user, err := h.Users.FindByEmail(req.Email)
	if err != nil || user == nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	if !user.IsVerified {
		http.Error(w, "email not verified", http.StatusForbidden)
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	token, _ := auth.GenerateToken(user.ID)

	json.NewEncoder(w).Encode(map[string]string{
		"token": token,
	})
}
