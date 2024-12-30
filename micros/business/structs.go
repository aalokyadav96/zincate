package main

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Business struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name"`
	Type        string             `json:"type" bson:"type"`
	Location    string             `json:"location" bson:"location"`
	Description string             `json:"description" bson:"description"`
}

type Booking struct {
	ID         primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	BusinessID primitive.ObjectID `json:"business_id" bson:"business_id"`
	UserName   string             `json:"user_name" bson:"user_name"`
	TimeSlot   string             `json:"time_slot" bson:"time_slot"`
}

type MenuItem struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name"`
	Price       float64            `json:"price" bson:"price"`
	Description string             `json:"description" bson:"description"`
}

type Promotion struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Title       string             `json:"title" bson:"title"`
	Description string             `json:"description" bson:"description"`
	ExpiryDate  time.Time          `json:"expiry_date" bson:"expiry_date"`
}

// Owner Management Handlers
type Owner struct {
	ID       primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name     string             `json:"name" bson:"name"`
	Email    string             `json:"email" bson:"email"`
	Password string             `json:"password" bson:"password"`
}
