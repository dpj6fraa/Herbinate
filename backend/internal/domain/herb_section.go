package domain

import "time"

type HerbSection struct {
	ID        string    `json:"id"`
	HerbID    string    `json:"herb_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Position  int       `json:"position"`
	CreatedAt time.Time `json:"created_at"`
}
