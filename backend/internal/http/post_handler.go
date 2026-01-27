package http

import (
	"encoding/json"
	"net/http"

	"io"
	"os"
	"path/filepath"

	"myapp/internal/domain"
	"myapp/internal/repository"

	"github.com/google/uuid"
)

type PostHandler struct {
	Posts *repository.PostRepository
}

func (h *PostHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r)

	// ต้อง parse form ก่อน
	err := r.ParseMultipartForm(20 << 20) // 20MB
	if err != nil {
		http.Error(w, "file too large", http.StatusBadRequest)
		return
	}

	title := r.FormValue("title")
	content := r.FormValue("content")

	if title == "" || content == "" {
		http.Error(w, "missing fields", http.StatusBadRequest)
		return
	}

	postID := uuid.NewString()

	post := &domain.Post{
		ID:      postID,
		UserID:  userID,
		Title:   title,
		Content: content,
	}

	if err := h.Posts.Create(post); err != nil {
		http.Error(w, "failed to create post", 500)
		return
	}

	// 📁 โฟลเดอร์เก็บรูป
	uploadDir := "./uploads/posts/"
	os.MkdirAll(uploadDir, os.ModePerm)

	files := r.MultipartForm.File["images"]

	for i, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			continue
		}
		defer file.Close()

		ext := filepath.Ext(fileHeader.Filename)
		filename := uuid.NewString() + ext
		filePath := uploadDir + filename

		dst, err := os.Create(filePath)
		if err != nil {
			continue
		}
		defer dst.Close()

		io.Copy(dst, file)

		imageURL := "/uploads/posts/" + filename

		h.Posts.AddImage(&domain.PostImage{
			ID:     uuid.NewString(),
			PostID: postID,
			URL:    imageURL,
			Order:  i,
		})
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *PostHandler) Feed(w http.ResponseWriter, r *http.Request) {
	rows, err := h.Posts.GetFeed()
	if err != nil {
		http.Error(w, "failed to load feed", 500)
		return
	}
	defer rows.Close()

	var feed []map[string]interface{}

	for rows.Next() {
		var id, title, content, username string
		var createdAt string
		var likes, comments, shares int

		rows.Scan(&id, &title, &content, &createdAt, &username, &likes, &comments, &shares)

		feed = append(feed, map[string]interface{}{
			"id":        id,
			"title":     title,
			"content":   content,
			"username":  username,
			"createdAt": createdAt,
			"likes":     likes,
			"comments":  comments,
			"shares":    shares,
		})
	}

	json.NewEncoder(w).Encode(feed)
}

// ---------- LIKE ----------
func (h *PostHandler) Like(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r)
	postID := r.URL.Query().Get("post_id")

	h.Posts.Like(postID, userID)
	w.WriteHeader(http.StatusOK)
}

func (h *PostHandler) Unlike(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r)
	postID := r.URL.Query().Get("post_id")

	h.Posts.Unlike(postID, userID)
	w.WriteHeader(http.StatusOK)
}

// ---------- COMMENT ----------
func (h *PostHandler) AddComment(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r)

	var req struct {
		PostID  string `json:"post_id"`
		Content string `json:"content"`
	}

	json.NewDecoder(r.Body).Decode(&req)

	h.Posts.AddComment(&domain.PostComment{
		ID:      uuid.NewString(),
		PostID:  req.PostID,
		UserID:  userID,
		Content: req.Content,
	})

	w.WriteHeader(http.StatusCreated)
}

func (h *PostHandler) GetComments(w http.ResponseWriter, r *http.Request) {
	postID := r.URL.Query().Get("post_id")

	comments, _ := h.Posts.GetComments(postID)
	json.NewEncoder(w).Encode(comments)
}

// ---------- SHARE ----------
func (h *PostHandler) Share(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r)
	postID := r.URL.Query().Get("post_id")

	h.Posts.Share(postID, userID)
	w.WriteHeader(http.StatusOK)
}

// ---------- DELETE POST ----------
func (h *PostHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r)
	postID := r.URL.Query().Get("post_id")

	err := h.Posts.DeletePost(postID, userID)
	if err != nil {
		http.Error(w, "delete failed", 500)
		return
	}

	w.WriteHeader(http.StatusOK)
}
