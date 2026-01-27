package domain

import "time"

type PostComment struct {
	ID        string
	PostID    string
	UserID    string
	Content   string
	CreatedAt time.Time
}
