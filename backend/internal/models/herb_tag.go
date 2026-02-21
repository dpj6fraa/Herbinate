package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type HerbTag struct {
	HerbID primitive.ObjectID `json:"herb_id" bson:"herb_id"`
	TagID  primitive.ObjectID `json:"tag_id" bson:"tag_id"`
}
