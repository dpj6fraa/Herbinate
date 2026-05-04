package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"herb-api/internal/database"
	"herb-api/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func googleOAuthConfig() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"), // http://localhost:8080/api/auth/google/callback
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}
}

// GoogleLogin → redirect ผู้ใช้ไปหน้า consent ของ Google
func GoogleLogin(c *fiber.Ctx) error {
	config := googleOAuthConfig()
	url := config.AuthCodeURL("state-token", oauth2.AccessTypeOnline)
	return c.Redirect(url, fiber.StatusTemporaryRedirect)
}

type googleUserInfo struct {
	Sub           string `json:"sub"` // Google user ID
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}

// GoogleCallback → รับ code จาก Google แล้วออก JWT ของเราเอง
func GoogleCallback(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing code"})
	}

	// 1. แลก code → access token
	config := googleOAuthConfig()
	oauthToken, err := config.Exchange(context.Background(), code)
	if err != nil {
		fmt.Println("Google Exchange Error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to exchange token"})
	}

	// 2. ดึงข้อมูล user จาก Google
	client := config.Client(context.Background(), oauthToken)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil || resp.StatusCode != http.StatusOK {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get user info"})
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var gUser googleUserInfo
	if err := json.Unmarshal(body, &gUser); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to parse user info"})
	}

	// 3. Upsert user ใน MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := database.GetCollection(userCollection)

	var user models.User

	// หาด้วย provider_id ก่อน (กลับมาล็อกอินซ้ำ)
	err = collection.FindOne(ctx, bson.M{
		"provider":    "google",
		"provider_id": gUser.Sub,
	}).Decode(&user)

	if err != nil {
		// ยังไม่มี → ลองหาด้วย email (เคยสมัครด้วย password ไว้)
		err = collection.FindOne(ctx, bson.M{"email": gUser.Email}).Decode(&user)

		if err != nil {
			// ไม่มีเลย → สร้างใหม่
			user = models.User{
				ID:         primitive.NewObjectID(),
				Email:      gUser.Email,
				Username:   gUser.Name,
				Provider:   "google",
				ProviderID: gUser.Sub,
				IsVerified: true, // Google ยืนยันให้แล้ว ไม่ต้อง OTP
				CreatedAt:  time.Now(),
				UpdatedAt:  time.Now(),
			}
			if _, err := collection.InsertOne(ctx, user); err != nil {
				fmt.Println("InsertOne Error:", err) // เพิ่มตรงนี้
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create user"})
			}
		} else {
			// มี email อยู่แล้ว → เช็คก่อนว่าเป็น local account หรือเปล่า
			if user.Provider == "" || user.Provider == "local" {
				frontendURL := os.Getenv("FRONTEND_URL")
				if frontendURL == "" {
					frontendURL = "http://localhost:3000"
				}
				return c.Redirect(
					frontendURL+"/login?error=email_exists",
					fiber.StatusTemporaryRedirect,
				)
			}
			// provider เป็น google อยู่แล้ว → ผ่านได้ (re-login ปกติ)
		}
	}

	// 4. ออก JWT ของระบบเรา (เหมือน Login ปกติ)
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "default_secret_key"
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID.Hex(),
		"email":    user.Email,
		"username": user.Username,
		"exp":      time.Now().Add(72 * time.Hour).Unix(),
	})

	t, err := jwtToken.SignedString([]byte(secret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to sign token"})
	}

	// 5. Redirect กลับ Frontend พร้อม token
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	return c.Redirect(frontendURL+"/auth/callback?token="+t, fiber.StatusTemporaryRedirect)
}
