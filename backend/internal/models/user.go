package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID              primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Email           string             `json:"email" bson:"email"`
	Username        string             `json:"username" bson:"username"`
	Password        string             `json:"password,omitempty" bson:"-"`
	PasswordHash    string             `json:"-" bson:"passwordhash"`
	IsVerified      bool               `json:"is_verified" bson:"is_verified"`
	ProfileImageURL string             `bson:"profile_image_url,omitempty" json:"profile_image_url"`
	CreatedAt       time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at" bson:"updated_at"`
	Provider        string             `bson:"provider,omitempty"`    // "local", "google", "facebook"
	ProviderID      string             `bson:"provider_id,omitempty"` // Google sub / Facebook id
}
