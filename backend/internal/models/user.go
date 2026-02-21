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
	IsVerified      bool               `json:"is_verified" bson:"isverified"`
	ProfileImageURL string             `json:"profile_image_url" bson:"profileimageurl"`
	CreatedAt       time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at" bson:"updated_at"`
}
