package handlers

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
	"os"
	"time"

	"herb-api/internal/database"
	"herb-api/internal/models"
	"herb-api/internal/repository"
	"herb-api/internal/service"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

const userCollection = "users"

func generateOTP() string {
	n, _ := rand.Int(rand.Reader, big.NewInt(900000))
	return fmt.Sprintf("%06d", n.Int64()+100000)
}

func Register(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var input models.User
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	collection := database.GetCollection(userCollection)
	otpRepo := repository.NewOTPRepository()

	var existing models.User
	err := collection.FindOne(ctx, bson.M{"email": input.Email}).Decode(&existing)

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	// 📌 ถ้ามี user อยู่แล้ว
	if err == nil {

		if existing.IsVerified {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": "Email already registered",
			})
		}

		// 🔥 ยังไม่ verified → update ข้อมูลใหม่แทน
		update := bson.M{
			"$set": bson.M{
				"username":      input.Username,
				"password_hash": string(hashedPassword),
				"updated_at":    time.Now(),
			},
		}

		_, _ = collection.UpdateByID(ctx, existing.ID, update)

		code := generateOTP()
		_ = otpRepo.SaveOTP(input.Email, code, 5*time.Minute)

		// TODO: ส่ง email จริงตรงนี้
		emailService := service.NewEmailService()
		if err := emailService.SendOTP(input.Email, code); err != nil {
			fmt.Println("SMTP ERROR:", err)
			return c.Status(fiber.StatusInternalServerError).
				JSON(fiber.Map{"error": "Failed to send OTP"})
		}

		return c.JSON(fiber.Map{
			"message": "Account exists but not verified. OTP resent.",
			"email":   input.Email,
		})
	}

	// 📌 email ใหม่ → สร้าง user
	// 📌 email ใหม่ → สร้าง user
	user := models.User{
		ID:           primitive.NewObjectID(),
		Email:        input.Email,
		Username:     input.Username,
		PasswordHash: string(hashedPassword),
		IsVerified:   false,
		CreatedAt:    time.Now(),
	}

	_, err = collection.InsertOne(ctx, user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
	}

	code := generateOTP()
	_ = otpRepo.SaveOTP(user.Email, code, 5*time.Minute)

	// ✅ ส่งเมลจริง
	emailService := service.NewEmailService()
	if err := emailService.SendOTP(user.Email, code); err != nil {
		fmt.Println("SMTP ERROR:", err)
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "Failed to send OTP"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "User registered. OTP sent.",
		"email":   user.Email,
	})
}

func Login(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var input models.User
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	collection := database.GetCollection(userCollection)
	otpRepo := repository.NewOTPRepository()

	var user models.User
	err := collection.FindOne(ctx, bson.M{"email": input.Email}).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid email or password"})
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid email or password"})
	}

	// 🔥 ยังไม่ verified → resend OTP + redirect flow
	if !user.IsVerified {
		code := generateOTP()
		_ = otpRepo.SaveOTP(user.Email, code, 5*time.Minute)

		// ✅ ส่ง OTP
		emailService := service.NewEmailService()
		if err := emailService.SendOTP(user.Email, code); err != nil {
			fmt.Println("SMTP ERROR:", err)
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "EMAIL_NOT_VERIFIED",
			"email": user.Email,
		})
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID.Hex(),
		"email":   user.Email,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
	})

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "default_secret_key"
	}

	t, _ := token.SignedString([]byte(secret))

	return c.JSON(fiber.Map{
		"message": "Login successful",
		"token":   t,
	})
}

func VerifyEmail(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	type req struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}

	var body req
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	otpRepo := repository.NewOTPRepository()
	ok, err := otpRepo.VerifyOTP(body.Email, body.OTP)
	if !ok || err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid or expired OTP"})
	}

	collection := database.GetCollection(userCollection)
	_, _ = collection.UpdateOne(ctx,
		bson.M{"email": body.Email},
		bson.M{"$set": bson.M{"is_verified": true}},
	)

	return c.JSON(fiber.Map{"message": "Email verified successfully"})
}

func ResendOTP(c *fiber.Ctx) error {
	type req struct {
		Email string `json:"email"`
	}

	var body req
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	otpRepo := repository.NewOTPRepository()

	code := generateOTP()
	_ = otpRepo.SaveOTP(body.Email, code, 5*time.Minute)

	// ✅ ส่งเมล
	emailService := service.NewEmailService()
	if err := emailService.SendOTP(body.Email, code); err != nil {
		fmt.Println("SMTP ERROR:", err)
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "Failed to send OTP"})
	}

	return c.JSON(fiber.Map{"message": "OTP resent"})
}
