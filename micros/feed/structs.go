package main

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Post struct {
	ID        interface{} `bson:"_id,omitempty" json:"id"`
	UserID    string      `json:"userid" bson:"userid"`
	Username  string      `bson:"username" json:"username"`
	Text      string      `bson:"text" json:"text"`
	Type      string      `bson:"type" json:"type"`   // Post type (e.g., "text", "image", "video", "blog", etc.)
	Media     []string    `bson:"media" json:"media"` // Media URLs (images, videos, etc.)
	Timestamp string      `bson:"timestamp" json:"timestamp"`
	Likes     int         `bson:"likes" json:"likes"`
	// ID         primitive.ObjectID   `json:"id" bson:"_id,omitempty"`
	Content   string               `json:"content" bson:"content"`
	MediaURL  string               `json:"media_url,omitempty" bson:"media_url,omitempty"`
	Likers    []primitive.ObjectID `json:"likers" bson:"likers"`
	CreatedAt time.Time            `json:"created_at" bson:"created_at"`
}
