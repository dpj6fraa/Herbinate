package domain

import "time"

type User struct {
	ID              string
	Username        string
	Email           string
	PasswordHash    string
	CreatedAt       time.Time
	IsVerified      bool
	ProfileImageURL string
}
