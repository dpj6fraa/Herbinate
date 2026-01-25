package service

import (
	"fmt"
	"math/rand"
	"time"

	"myapp/internal/repository"
)

type OTPService struct{}

func NewOTPService() *OTPService {
	return &OTPService{}
}

func (s *OTPService) Generate() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("%06d", rand.Intn(900000)+100000)
}

func (s *OTPService) Verify(email, code string, repo *repository.OTPRepository) bool {
	otp, err := repo.FindByEmail(email)
	if err != nil {
		return false
	}

	if time.Now().After(otp.ExpiresAt) {
		return false
	}

	return otp.Code == code
}
