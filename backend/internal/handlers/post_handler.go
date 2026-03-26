package handlers

import (
	"fmt"
	"io"
	"os"
	"path/filepath"

	"herb-api/internal/middleware"
	"herb-api/internal/models"
	"herb-api/internal/repository"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PostHandler struct {
	Posts *repository.PostRepository
}

func NewPostHandler(repo *repository.PostRepository) *PostHandler {
	return &PostHandler{Posts: repo}
}

// Helper function to get user ID from context (assuming you set it in AuthMiddleware)
func getUserIDFromContext(c *fiber.Ctx) primitive.ObjectID {
	return middleware.GetUserID(c)
}

func (h *PostHandler) CreatePost(c *fiber.Ctx) error {
	userID := getUserIDFromContext(c)

	title := c.FormValue("title")
	content := c.FormValue("content")

	if title == "" || content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing fields"})
	}

	post := &models.Post{
		UserID:  userID,
		Title:   title,
		Content: content,
	}

	if err := h.Posts.Create(post); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create post"})
	}

	// 📁 โฟลเดอร์เก็บรูป
	uploadDir := "./uploads/posts/"
	os.MkdirAll(uploadDir, os.ModePerm)

	form, err := c.MultipartForm()
	if err == nil {
		files := form.File["images"]
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

			h.Posts.AddImage(post.ID, &models.PostImage{
				URL:      imageURL,
				Position: i,
			})
		}
	}

	return c.JSON(fiber.Map{
		"post_id": post.ID.Hex(),
	})
}

func (h *PostHandler) PostFeed(c *fiber.Ctx) error {
	userID := getUserIDFromContext(c)

	var feed []primitive.M
	var err error

	if userID != primitive.NilObjectID {
		feed, err = h.Posts.GetFeedWithUser(userID)
	} else {
		feed, err = h.Posts.GetFeed()
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to load feed"})
	}

	// Convert ObjectIDs to Hex strings for JSON response & Fetch Images
	for i := range feed {
		if id, ok := feed[i]["id"].(primitive.ObjectID); ok {
			feed[i]["id"] = id.Hex()

			// --- ส่วนที่ต้องเพิ่ม: ดึงรูปภาพของแต่ละโพสต์แบบเดียวกับหน้า Detail ---
			imagesData, _ := h.Posts.GetImages(id)
			var images []map[string]interface{}

			for _, img := range imagesData {
				images = append(images, map[string]interface{}{
					"url":   img.URL,
					"order": img.Position, // หรือ img.Order ขึ้นอยู่กับ Struct ของคุณ
				})
			}

			// แนบ array รูปภาพเข้าไปใน object ของโพสต์นั้นๆ
			feed[i]["images"] = images
			// --------------------------------------------------------
		}
	}

	return c.JSON(feed)
}

// ---------- LIKE ----------
func (h *PostHandler) LikePost(c *fiber.Ctx) error {
	userID := getUserIDFromContext(c)
	postIDStr := c.Query("post_id")

	postID, err := primitive.ObjectIDFromHex(postIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid post_id"})
	}

	if err := h.Posts.Like(postID, userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to like post"})
	}

	return c.SendStatus(fiber.StatusOK)
}

func (h *PostHandler) UnlikePost(c *fiber.Ctx) error {
	userID := getUserIDFromContext(c)
	postIDStr := c.Query("post_id")

	postID, err := primitive.ObjectIDFromHex(postIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid post_id"})
	}

	if err := h.Posts.Unlike(postID, userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to unlike post"})
	}

	return c.SendStatus(fiber.StatusOK)
}

// ---------- COMMENT ----------
func (h *PostHandler) AddComment(c *fiber.Ctx) error {
	userID := getUserIDFromContext(c)

	var req struct {
		PostID  string `json:"post_id"`
		Content string `json:"content"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	postID, err := primitive.ObjectIDFromHex(req.PostID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid post_id"})
	}

	comment := models.PostComment{
		PostID:  postID,
		UserID:  userID,
		Content: req.Content,
	}

	if err := h.Posts.AddComment(&comment); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to add comment"})
	}

	// ⭐ ดึง comment แบบมี user info กลับมา
	commentWithUser, err := h.Posts.GetCommentWithUser(comment.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get comment details"})
	}

	return c.Status(fiber.StatusCreated).JSON(commentWithUser)
}

func (h *PostHandler) GetComments(c *fiber.Ctx) error {
	postIDStr := c.Query("post_id")

	postID, err := primitive.ObjectIDFromHex(postIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid post_id"})
	}

	comments, err := h.Posts.GetComments(postID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get comments"})
	}

	return c.JSON(comments)
}

// ---------- DELETE COMMENT ----------
func (h *PostHandler) DeleteComment(c *fiber.Ctx) error {
	userID := getUserIDFromContext(c)
	commentIDStr := c.Query("comment_id")

	commentID, err := primitive.ObjectIDFromHex(commentIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid comment_id"})
	}

	// เรียกไปยัง Repository เพื่อลบคอมเมนต์ โดยตรวจสอบ userID ด้วย
	if err := h.Posts.DeleteComment(commentID, userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "delete comment failed"})
	}

	return c.SendStatus(fiber.StatusOK)
}

// ---------- SHARE ----------
func (h *PostHandler) SharePost(c *fiber.Ctx) error {
	userID := getUserIDFromContext(c)
	postIDStr := c.Query("post_id")

	postID, err := primitive.ObjectIDFromHex(postIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid post_id"})
	}

	success, err := h.Posts.Share(postID, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to share"})
	}

	message := "already shared"
	if success {
		message = "shared"
	}

	return c.JSON(fiber.Map{
		"success": success,
		"message": message,
	})
}

// ---------- DELETE POST ----------
func (h *PostHandler) DeletePost(c *fiber.Ctx) error {
	userID := getUserIDFromContext(c)
	postIDStr := c.Query("post_id")

	postID, err := primitive.ObjectIDFromHex(postIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid post_id"})
	}

	if err := h.Posts.DeletePost(postID, userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "delete failed"})
	}

	return c.SendStatus(fiber.StatusOK)
}

func (h *PostHandler) PostDetail(c *fiber.Ctx) error {
	postIDStr := c.Query("post_id")
	userID := getUserIDFromContext(c)
	fmt.Println("USER ID:", userID.Hex())
	if postIDStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing post_id"})
	}

	postID, err := primitive.ObjectIDFromHex(postIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid post_id"})
	}

	post, err := h.Posts.GetPostDetail(postID, userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "post not found"})
	}

	// Convert ObjectID to Hex string for JSON response
	if id, ok := post["id"].(primitive.ObjectID); ok {
		post["id"] = id.Hex()
	}

	imagesData, _ := h.Posts.GetImages(postID)
	commentsData, _ := h.Posts.GetComments(postID)

	images := []map[string]interface{}{}
	for _, img := range imagesData {
		images = append(images, map[string]interface{}{
			"url":   img.URL,
			"order": img.Position,
		})
	}

	comments := []models.CommentWithUser{}
	if commentsData != nil {
		comments = commentsData
	}

	resp := fiber.Map{
		"post":     post,
		"images":   images,
		"comments": comments,
	}

	return c.JSON(resp)
}

func (h *PostHandler) EditPost(c *fiber.Ctx) error {
	userID := getUserIDFromContext(c)

	// 1. รับค่า Text จาก Form
	postIDStr := c.FormValue("post_id")
	title := c.FormValue("title")
	content := c.FormValue("content")

	if postIDStr == "" || title == "" || content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing required fields"})
	}

	postID, err := primitive.ObjectIDFromHex(postIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid post_id"})
	}

	// 2. จัดการรูปภาพ (รูปเก่าที่เก็บไว้ + รูปใหม่ที่อัปโหลด)
	var finalImages []models.PostImage
	position := 0

	form, err := c.MultipartForm()
	if err == nil {
		// --- ดึงรูปภาพเก่าที่ไม่ได้ถูกลบ ---
		if keptImages, ok := form.Value["kept_images"]; ok {
			for _, url := range keptImages {
				finalImages = append(finalImages, models.PostImage{
					ID:       primitive.NewObjectID(),
					URL:      url, // path เดิมของรูป
					Position: position,
				})
				position++
			}
		}

		// --- เซฟรูปภาพใหม่ที่เพิ่งอัปโหลด ---
		if newFiles, ok := form.File["new_images"]; ok {
			uploadDir := "./uploads/posts/"
			os.MkdirAll(uploadDir, os.ModePerm)

			for _, fileHeader := range newFiles {
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
				finalImages = append(finalImages, models.PostImage{
					ID:       primitive.NewObjectID(),
					URL:      imageURL,
					Position: position,
				})
				position++
			}
		}
	}

	// 3. เรียก Repository เพื่ออัปเดตข้อมูลทั้งหมดรวมถึงรูปภาพ
	if err := h.Posts.UpdatePost(postID, userID, title, content, finalImages); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "update failed"})
	}

	return c.SendStatus(fiber.StatusOK)
}
