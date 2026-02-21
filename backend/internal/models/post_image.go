package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type PostImage struct {
	ID       primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	PostID   primitive.ObjectID `json:"post_id" bson:"post_id"`
	URL      string             `json:"url" bson:"url"`
	Position int                `json:"position" bson:"position"` // ลำดับรูป
}
