package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type HerbSection struct {
	Title    string `json:"title" bson:"title"`
	Content  string `json:"content" bson:"content"`
	Position int    `json:"position" bson:"position"`
}

type Herb struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name"`
	Scientific  string             `json:"scientific_name" bson:"scientific_name"`
	Tags        []string           `json:"tags" bson:"tags"`
	Sections    []HerbSection      `json:"sections" bson:"sections"`
	Description string             `json:"description" bson:"description"`
	ImageURL    string             `json:"image_url" bson:"image_url"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at" bson:"updated_at"`
}
