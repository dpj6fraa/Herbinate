package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FeedPost struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title     string             `json:"title" bson:"title"`
	Content   string             `json:"content" bson:"content"`
	Username  string             `json:"username" bson:"username"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
	Likes     int                `json:"likes" bson:"likes"`
	Comments  int                `json:"comments" bson:"comments"`
	Shares    int                `json:"shares" bson:"shares"`
	LikedByMe bool               `json:"liked_by_me" bson:"liked_by_me"` // ⭐ เพิ่ม
}
