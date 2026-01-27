package domain

import "time"

type PostShare struct {
	ID        string
	PostID    string
	UserID    string
	CreatedAt time.Time
}
