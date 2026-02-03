package domain

import "time"

type FeedPost struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Username  string    `json:"username"`
	CreatedAt time.Time `json:"created_at"`
	Likes     int       `json:"likes"`
	Comments  int       `json:"comments"`
	Shares    int       `json:"shares"`
	LikedByMe bool      `json:"liked_by_me"` // ⭐ เพิ่ม
}
