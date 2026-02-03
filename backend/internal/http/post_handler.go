package http

import (
	"database/sql"
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

	json.NewEncoder(w).Encode(map[string]string{
		"post_id": postID,
	})

}

func (h *PostHandler) Feed(w http.ResponseWriter, r *http.Request) {
	// ✅ ตรวจสอบว่ามี token หรือไม่
	userID := GetUserID(r) // จะได้ "" ถ้าไม่มี token

	var rows *sql.Rows
	var err error

	if userID != "" {
		rows, err = h.Posts.GetFeedWithUser(userID)
	} else {
		rows, err = h.Posts.GetFeed()
	}

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
		var liked bool // ✅ เพิ่ม

		if userID != "" {
			// สำหรับ GetFeedWithUser
			rows.Scan(&id, &title, &content, &createdAt, &username,
				&likes, &comments, &shares, &liked)
		} else {
			// สำหรับ GetFeed (ไม่มี liked)
			rows.Scan(&id, &title, &content, &createdAt, &username,
				&likes, &comments, &shares)
			liked = false
		}

		feed = append(feed, map[string]interface{}{
			"id":        id,
			"title":     title,
			"content":   content,
			"username":  username,
			"createdAt": createdAt,
			"likes":     likes,
			"comments":  comments,
			"shares":    shares,
			"liked":     liked, // ✅ ส่งค่านี้กลับไป
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

	comment := domain.PostComment{
		ID:      uuid.NewString(),
		PostID:  req.PostID,
		UserID:  userID,
		Content: req.Content,
	}

	err := h.Posts.AddComment(&comment)
	if err != nil {
		http.Error(w, "failed", 500)
		return
	}

	// ⭐ ดึง comment แบบมี user info กลับมา
	c, _ := h.Posts.GetCommentWithUser(comment.ID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(c)
}

func (h *PostHandler) GetComments(w http.ResponseWriter, r *http.Request) {
	postID := r.URL.Query().Get("post_id")

	comments, _ := h.Posts.GetComments(postID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

// ---------- SHARE ----------
// internal/http/post_handler.go

func (h *PostHandler) Share(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r)
	postID := r.URL.Query().Get("post_id")

	success, err := h.Posts.Share(postID, userID)
	if err != nil {
		http.Error(w, "failed to share", 500)
		return
	}

	// ✅ ส่งกลับว่า share สำเร็จหรือไม่
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": success,
		"message": func() string {
			if success {
				return "shared"
			}
			return "already shared"
		}(),
	})
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

func (h *PostHandler) Detail(w http.ResponseWriter, r *http.Request) {
	postID := r.URL.Query().Get("post_id")
	if postID == "" {
		http.Error(w, "missing post_id", 400)
		return
	}

	post, err := h.Posts.GetPostDetail(postID)
	if err != nil {
		http.Error(w, "post not found", 404)
		return
	}

	imagesData, _ := h.Posts.GetImages(postID)
	commentsData, _ := h.Posts.GetComments(postID)

	images := []map[string]interface{}{}
	for _, img := range imagesData {
		images = append(images, map[string]interface{}{
			"url":   img.URL,
			"order": img.Order,
		})
	}

	comments := []domain.CommentWithUser{}
	if commentsData != nil {
		comments = commentsData
	}

	resp := map[string]interface{}{
		"post":     post,
		"images":   images,
		"comments": comments,
	}

	json.NewEncoder(w).Encode(resp)
}
