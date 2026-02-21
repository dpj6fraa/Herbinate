package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Herb struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name"`
	Scientific  string             `json:"scientific_name" bson:"scientific_name"`
	Properties  string             `json:"properties" bson:"properties"`
	Description string             `json:"description" bson:"description"`
	ImageURL    string             `json:"image_url" bson:"image_url"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at" bson:"updated_at"`
}
