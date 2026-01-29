package domain

import "time"

type PostLike struct {
	ID        string
	PostID    string
	UserID    string
	CreatedAt time.Time
}
