package models

type HerbDetail struct {
	Herb     Herb          `json:"herb" bson:"herb"`
	Tags     []Tag         `json:"tags" bson:"tags"`
	Sections []HerbSection `json:"sections" bson:"sections"`
}
