package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type HerbSection struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	HerbID    primitive.ObjectID `json:"herb_id" bson:"herb_id"`
	Title     string             `json:"title" bson:"title"`
	Content   string             `json:"content" bson:"content"`
	Position  int                `json:"position" bson:"position"`
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}
