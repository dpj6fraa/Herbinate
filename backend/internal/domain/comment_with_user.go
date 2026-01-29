package domain

import "time"

type CommentWithUser struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Username  string    `json:"username"`
	Profile   string    `json:"profileImg"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}
