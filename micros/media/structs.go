package main

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Media struct {
	ID            string             `json:"id" bson:"id"`
	EventID       string             `json:"eventid" bson:"eventid"`
	Type          string             `json:"type" bson:"type"`
	URL           string             `json:"url" bson:"url"`
	ThumbnailURL  string             `json:"thumbnailUrl,omitempty" bson:"thumbnailUrl,omitempty"`
	Caption       string             `json:"caption" bson:"caption"`
	Description   string             `json:"description,omitempty" bson:"description,omitempty"`
	CreatorID     string             `json:"creatorid" bson:"creatorid"`
	LikesCount    int                `json:"likesCount" bson:"likesCount"`
	CommentsCount int                `json:"commentsCount" bson:"commentsCount"`
	Visibility    string             `json:"visibility" bson:"visibility"`
	Tags          []string           `json:"tags,omitempty" bson:"tags,omitempty"`
	Duration      int                `json:"duration,omitempty" bson:"duration,omitempty"`
	FileSize      int64              `json:"fileSize,omitempty" bson:"fileSize,omitempty"`
	MimeType      string             `json:"mimeType,omitempty" bson:"mimeType,omitempty"`
	IsFeatured    bool               `json:"isFeatured,omitempty" bson:"isFeatured,omitempty"`
	EntityID      string             `json:"entityid" bson:"entityid"`
	EntityType    string             `json:"entitytype" bson:"entitytype"` // "event" or "place"
	MediaType     string             `json:"media_type" bson:"media_type"` // "image" or "video"
	CreatedAt     time.Time          `json:"created_at" bson:"created_at"`
	UserID        primitive.ObjectID `bson:"user_id" json:"userId"`
	UpdatedAt     time.Time          `bson:"updated_at" json:"updatedAt"`
}
