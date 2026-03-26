package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PostBookmark struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PostID    primitive.ObjectID `bson:"post_id" json:"post_id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	Status    bool               `bson:"status" json:"status"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}
