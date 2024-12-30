package main

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Merch struct {
	MerchID     string             `json:"merchid" bson:"merchid"`
	EventID     string             `json:"eventid" bson:"eventid"` // Reference to Event ID
	Name        string             `json:"name" bson:"name"`
	Price       float64            `json:"price" bson:"price"`
	Stock       int                `json:"stock" bson:"stock"` // Number of items available
	MerchPhoto  string             `json:"merch_pic" bson:"merch_pic"`
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	EntityID    primitive.ObjectID `json:"entity_id" bson:"entity_id"`
	EntityType  string             `json:"entity_type" bson:"entity_type"` // "event" or "place"
	Description string             `json:"description,omitempty" bson:"description,omitempty"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
	UserID      primitive.ObjectID `bson:"user_id" json:"userId"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updatedAt"`
}
