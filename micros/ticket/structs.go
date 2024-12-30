package main

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Ticket struct {
	TicketID    string             `json:"ticketid" bson:"ticketid"`
	EventID     string             `json:"eventid" bson:"eventid"`
	Name        string             `json:"name" bson:"name"`
	Price       float64            `json:"price" bson:"price"`
	Quantity    int                `json:"quantity" bson:"quantity"`
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	EntityID    primitive.ObjectID `json:"entity_id" bson:"entity_id"`
	EntityType  string             `json:"entity_type" bson:"entity_type"` // "event" or "place"
	Available   int                `json:"available" bson:"available"`
	Total       int                `json:"total" bson:"total"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
	Description string             `bson:"description,omitempty" json:"description"`
	Sold        int                `bson:"sold" json:"sold"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updatedAt"`
}

type Seat struct {
	ID         primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	EntityID   primitive.ObjectID `json:"entity_id" bson:"entity_id"`
	EntityType string             `json:"entity_type" bson:"entity_type"` // e.g., "event" or "place"
	SeatNumber string             `json:"seat_number" bson:"seat_number"`
	UserID     primitive.ObjectID `json:"user_id" bson:"user_id,omitempty"`
	Status     string             `json:"status" bson:"status"` // e.g., "booked", "available"
}
