package repository

import (
	"database/sql"
	"time"

	"myapp/internal/domain"
)

type OTPRepository struct {
	DB *sql.DB
}

func (r *OTPRepository) Create(otp *domain.EmailOTP) error {
	_, err := r.DB.Exec(`
		INSERT INTO email_otp (email, code, expires_at)
		VALUES ($1, $2, $3)
	`, otp.Email, otp.Code, time.Now().Add(10*time.Minute))

	return err
}

func (r *OTPRepository) FindByEmail(email string) (*domain.EmailOTP, error) {
	row := r.DB.QueryRow(`
		SELECT email, code, expires_at
		FROM email_otp
		WHERE email = $1
		ORDER BY expires_at DESC
		LIMIT 1
	`, email)

	var otp domain.EmailOTP
	if err := row.Scan(&otp.Email, &otp.Code, &otp.ExpiresAt); err != nil {
		return nil, err
	}

	return &otp, nil
}

func (r *OTPRepository) Replace(email, code string) error {
	r.DeleteByEmail(email)
	_, err := r.DB.Exec(`
		INSERT INTO email_otp (email, code, expires_at)
		VALUES ($1, $2, $3)
	`, email, code, time.Now().Add(10*time.Minute))

	return err
}

func (r *OTPRepository) DeleteByEmail(email string) {
	r.DB.Exec(`DELETE FROM email_otp WHERE email = $1`, email)
}
