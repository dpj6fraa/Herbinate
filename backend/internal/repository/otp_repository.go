package repository

import (
	"context"
	"errors"
	"time"

	"herb-api/internal/database"
	"herb-api/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type OTPRepository struct {
	Collection *mongo.Collection
}

func NewOTPRepository() *OTPRepository {
	return &OTPRepository{
		Collection: database.GetCollection("otps"),
	}
}

// SaveOTP บันทึก OTP ลง MongoDB
func (r *OTPRepository) SaveOTP(email, code string, duration time.Duration) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	otp := models.OTP{
		Email:     email,
		Code:      code,
		ExpiresAt: time.Now().Add(duration),
		CreatedAt: time.Now(),
	}

	// ลบ OTP เก่าของอีเมลนี้ทิ้งก่อน (ถ้ามี)
	_, _ = r.Collection.DeleteMany(ctx, bson.M{"email": email})

	// บันทึก OTP ใหม่
	_, err := r.Collection.InsertOne(ctx, otp)
	return err
}

// VerifyOTP ตรวจสอบว่า OTP ถูกต้องและยังไม่หมดอายุหรือไม่
func (r *OTPRepository) VerifyOTP(email, code string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var otp models.OTP
	err := r.Collection.FindOne(ctx, bson.M{
		"email": email,
		"code":  code,
	}).Decode(&otp)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return false, errors.New("invalid otp")
		}
		return false, err
	}

	// ตรวจสอบวันหมดอายุ
	if time.Now().After(otp.ExpiresAt) {
		return false, errors.New("otp expired")
	}

	// ถ้าถูกต้อง ให้ลบ OTP ทิ้งเพื่อไม่ให้ใช้ซ้ำ
	_, _ = r.Collection.DeleteOne(ctx, bson.M{"_id": otp.ID})

	return true, nil
}
