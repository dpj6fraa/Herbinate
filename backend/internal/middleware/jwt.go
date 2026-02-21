package middleware

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

// ดึงค่า JWT_SECRET แบบ Dynamic เพื่อป้องกันปัญหาโหลด .env ไม่ทัน
func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	
	// เพิ่มการตรวจสอบว่าโหลด JWT_SECRET มาได้อะไร
	fmt.Println("=> [getJWTSecret] Loaded JWT_SECRET:", secret)

	if secret == "" {
		secret = "Default" // ควรตั้งค่า JWT_SECRET ในไฟล์ .env เสมอ
		fmt.Println("=> [getJWTSecret] Using fallback secret")
	}
	return []byte(secret)
}

func GenerateToken(userID string) (string, error) {
	claims := Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}

func ParseToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(
		tokenStr,
		&Claims{},
		func(token *jwt.Token) (interface{}, error) {
			return getJWTSecret(), nil
		},
	)

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, jwt.ErrTokenInvalidClaims
	}

	return claims, nil
}
