package middleware

import (
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const userIDKey = "user_id"

func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		header := c.Get("Authorization")
		fmt.Println("=> [AuthMiddleware] Incoming Authorization Header:", header)

		if header == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "missing token"})
		}

		parts := strings.Split(header, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid token format"})
		}

		fmt.Println("=> [AuthMiddleware] Extracted Token:", parts[1])

		claims, err := ParseToken(parts[1])
		if err != nil {
			fmt.Println("=> [AuthMiddleware] ParseToken Error:", err)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid token"})
		}

		fmt.Printf("=> [AuthMiddleware] Parsed Claims: %+v\n", claims)

		// เก็บ UserID ลงใน Locals ของ Fiber
		c.Locals(userIDKey, claims.UserID)
		return c.Next()
	}
}

func GetUserID(c *fiber.Ctx) primitive.ObjectID {
	idStr, ok := c.Locals(userIDKey).(string)
	fmt.Printf("=> [GetUserID] idStr from Locals: '%s', ok: %v\n", idStr, ok)
	
	if !ok || idStr == "" {
		return primitive.NilObjectID
	}

	id, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		fmt.Println("=> [GetUserID] ObjectIDFromHex Error:", err)
		return primitive.NilObjectID
	}

	return id
}

func OptionalAuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		header := c.Get("Authorization")
		fmt.Println("=> [OptionalAuthMiddleware] Incoming Authorization Header:", header)

		if header == "" {
			// ✅ ไม่มี token ก็ผ่านไปได้ แต่ไม่มี userID
			return c.Next()
		}

		parts := strings.Split(header, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Next()
		}

		fmt.Println("=> [OptionalAuthMiddleware] Extracted Token:", parts[1])

		claims, err := ParseToken(parts[1])
		if err != nil {
			return c.Next()
		}

		// เก็บ UserID ลงใน Locals ของ Fiber
		c.Locals(userIDKey, claims.UserID)
		return c.Next()
	}
}
