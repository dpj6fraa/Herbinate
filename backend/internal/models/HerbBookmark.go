package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type HerbBookmark struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	HerbID    primitive.ObjectID `bson:"herb_id" json:"herb_id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	Status    bool               `bson:"status" json:"status"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}
