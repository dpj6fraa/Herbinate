package http

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"myapp/internal/repository"
)

type UserHandler struct {
	Users *repository.UserRepository
}

func (h *UserHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r)
	if userID == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := h.Users.FindByID(userID)
	if err != nil || user == nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":                user.ID,
		"email":             user.Email,
		"username":          user.Username,
		"created_at":        user.CreatedAt,
		"profile_image_url": user.ProfileImageURL,
	})
}

func (h *UserHandler) UploadProfileImage(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r)
	if userID == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// จำกัดขนาดไฟล์ (กันคนอัป 50MB)
	r.ParseMultipartForm(5 << 20) // 5MB

	file, header, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "invalid file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := filepath.Ext(header.Filename)

	// ⭐ ชื่อไฟล์ใหม่ทุกครั้ง
	filename := fmt.Sprintf("%s_%d%s", userID, time.Now().UnixNano(), ext)
	saveDir := "./uploads/profiles/"
	savePath := saveDir + filename

	// สร้างโฟลเดอร์ถ้ายังไม่มี
	os.MkdirAll(saveDir, os.ModePerm)

	// ===== ลบรูปเก่า =====
	user, _ := h.Users.FindByID(userID)
	if user != nil && user.ProfileImageURL != "" {
		oldPath := "." + user.ProfileImageURL
		os.Remove(oldPath) // ไม่ต้องสน error
	}

	// ===== บันทึกรูปใหม่ =====
	out, err := os.Create(savePath)
	if err != nil {
		http.Error(w, "failed to save", http.StatusInternalServerError)
		return
	}
	defer out.Close()

	io.Copy(out, file)

	imageURL := "/uploads/profiles/" + filename
	h.Users.UpdateProfileImage(userID, imageURL)

	json.NewEncoder(w).Encode(map[string]string{
		"profile_image_url": imageURL,
	})
}

func (h *UserHandler) UpdateUsername(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r)
	if userID == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var body struct {
		Username string `json:"username"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Username == "" {
		http.Error(w, "invalid username", http.StatusBadRequest)
		return
	}

	if err := h.Users.UpdateUsername(userID, body.Username); err != nil {
		http.Error(w, "failed to update", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"username": body.Username,
	})
}
