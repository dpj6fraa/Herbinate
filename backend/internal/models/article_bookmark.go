package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ArticleBookmark struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	ArticleID primitive.ObjectID `json:"article_id" bson:"article_id"`
	UserID    primitive.ObjectID `json:"user_id" bson:"user_id"`
	Status    bool               `json:"status" bson:"status"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}
