package service

import (
	"fmt"
	"math/rand"
	"time"

	"herb-api/internal/repository"
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
	ok, err := repo.VerifyOTP(email, code)
	if err != nil {
		return false
	}
	return ok
}
