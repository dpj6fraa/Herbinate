package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CommentWithUser struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"user_id" bson:"user_id"`
	Username  string             `json:"username" bson:"username"`
	Profile   string             `json:"profileImg" bson:"profile_image_url"`
	Content   string             `json:"content" bson:"content"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}
