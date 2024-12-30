package main

import (
	"time"
)

type User struct {
	// ID          string    `json:"-" bson:"_id,omitempty"`
	UserID       string    `json:"userid" bson:"userid"`
	Username     string    `json:"username" bson:"username"`
	Email        string    `json:"email" bson:"email"`
	Password     string    `json:"-" bson:"password"`
	Role         string    `json:"role" bson:"role"`
	Name         string    `json:"name,omitempty" bson:"name,omitempty"`
	CreatedAt    time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" bson:"updated_at"`
	PhoneNumber  string    `json:"phone_number,omitempty" bson:"phone_number,omitempty"`
	IsActive     bool      `json:"is_active" bson:"is_active"`
	LastLogin    time.Time `json:"last_login,omitempty" bson:"last_login,omitempty"`
	ProfileViews int       `json:"profile_views,omitempty" bson:"profile_views,omitempty"`
	Address      string    `json:"address,omitempty" bson:"address,omitempty"`
	DateOfBirth  time.Time `json:"date_of_birth,omitempty" bson:"date_of_birth,omitempty"`
	IsVerified   bool      `json:"is_verified" bson:"is_verified"`
	PasswordHash string    `json:"password_hash" bson:"password_hash"`
}

type Response struct {
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}
