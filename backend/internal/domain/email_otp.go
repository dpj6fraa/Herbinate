package domain

import "time"

type EmailOTP struct {
	ID        int
	Email     string
	Code      string
	ExpiresAt time.Time
	CreatedAt time.Time
}
