package domain

type HerbDetail struct {
	Herb     Herb          `json:"herb"`
	Tags     []Tag         `json:"tags"`
	Sections []HerbSection `json:"sections"`
}
