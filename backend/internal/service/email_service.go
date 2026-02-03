package service

import (
	"fmt"
	"net/smtp"
	"os"
)

type EmailService struct {
	Host     string
	Port     string
	Username string
	Password string
	From     string
}

func NewEmailService() *EmailService {
	return &EmailService{
		Host:     os.Getenv("SMTP_HOST"),
		Port:     os.Getenv("SMTP_PORT"),
		Username: os.Getenv("SMTP_USER"),
		Password: os.Getenv("SMTP_PASS"),
		From:     os.Getenv("SMTP_FROM"),
	}
}

func (s *EmailService) SendOTP(toEmail, otp string) error {
	auth := smtp.PlainAuth(
		"",
		s.Username,
		s.Password,
		s.Host,
	)

	subject := "ยืนยันอีเมลของคุณ (OTP)"
	body := fmt.Sprintf(`
สวัสดี 👋

รหัส OTP สำหรับยืนยันอีเมลของคุณคือ:

%s

รหัสนี้จะหมดอายุภายใน 10 นาที
หากคุณไม่ได้เป็นผู้ร้องขอ กรุณาเพิกเฉย

— Herbinate
`, otp)

	msg := []byte(
		"From: " + s.From + "\r\n" +
			"To: " + toEmail + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"MIME-Version: 1.0\r\n" +
			"Content-Type: text/plain; charset=\"utf-8\"\r\n\r\n" +
			body,
	)

	addr := s.Host + ":" + s.Port
	return smtp.SendMail(addr, auth, s.Username, []string{toEmail}, msg)
}
