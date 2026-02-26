package handlers

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"herb-api/internal/database"
	"herb-api/internal/middleware"
	"herb-api/internal/models"
	"herb-api/internal/repository"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserHandler struct {
	Users *repository.UserRepository
}

func NewUserHandler(repo *repository.UserRepository) *UserHandler {
	return &UserHandler{Users: repo}
}

func (h *UserHandler) Me(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == primitive.NilObjectID {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	user, err := h.Users.FindByID(userID)
	if err != nil || user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "user not found"})
	}

	return c.JSON(fiber.Map{
		"id":                user.ID.Hex(),
		"email":             user.Email,
		"username":          user.Username,
		"created_at":        user.CreatedAt,
		"profile_image_url": user.ProfileImageURL,
	})
}

func (h *UserHandler) UploadProfileImage(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == primitive.NilObjectID {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	// รับไฟล์จาก form
	fileHeader, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid file"})
	}

	// จำกัดขนาดไฟล์ (กันคนอัป 50MB) - Fiber จัดการได้ใน Config หรือ Middleware
	// แต่ถ้าจะเช็คตรงนี้:
	if fileHeader.Size > 5<<20 { // 5MB
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "file too large"})
	}

	file, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to open file"})
	}
	defer file.Close()

	ext := filepath.Ext(fileHeader.Filename)

	// ⭐ ชื่อไฟล์ใหม่ทุกครั้ง
	filename := fmt.Sprintf("%s_%d%s", userID.Hex(), time.Now().UnixNano(), ext)
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
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save"})
	}
	defer out.Close()

	io.Copy(out, file)

	imageURL := "/uploads/profiles/" + filename
	if err := h.Users.UpdateProfileImage(userID, imageURL); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update profile image"})
	}

	return c.JSON(fiber.Map{
		"profile_image_url": imageURL,
	})
}

func (h *UserHandler) UpdateUsername(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == primitive.NilObjectID {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	var body struct {
		Username string `json:"username"`
	}

	if err := c.BodyParser(&body); err != nil || body.Username == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "กรุณากรอกชื่อผู้ใช้"})
	}

	// 🌟🌟🌟 1. เพิ่มการเช็ค Username ซ้ำตรงนี้ 🌟🌟🌟
	// ดึง Collection users มาใช้งาน (เช็ค import database, models, bson ด้วยนะครับ)
	collection := database.GetCollection("users")
	var existingUser models.User

	// ค้นหาว่ามีชื่อ Username นี้อยู่ในระบบแล้วหรือไม่
	err := collection.FindOne(c.Context(), bson.M{"username": body.Username}).Decode(&existingUser)

	// ถ้าเจอข้อมูลแปลว่า "มีคนใช้ชื่อนี้แล้ว"
	// และเช็คต่อว่า ID ของคนนั้น "ไม่ใช่" ID ของเราเอง (ป้องกันกรณีกดเซฟชื่อเดิมตัวเอง)
	if err == nil && existingUser.ID != userID {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น",
		})
	}
	// 🌟🌟🌟 สิ้นสุดส่วนที่เพิ่มใหม่ 🌟🌟🌟

	// 2. ถ้าผ่านการเช็ค (ไม่มีคนใช้ หรือเป็นชื่อเดิมตัวเอง) ก็ให้อัปเดตตามปกติ
	if err := h.Users.UpdateUsername(userID, body.Username); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update"})
	}

	return c.JSON(fiber.Map{
		"username": body.Username,
	})
}
