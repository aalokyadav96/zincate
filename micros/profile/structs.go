package main

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	// ID          string    `json:"-" bson:"_id,omitempty"`
	UserID      string    `json:"userid" bson:"userid"`
	Username    string    `json:"username" bson:"username"`
	Email       string    `json:"email" bson:"email"`
	Password    string    `json:"-" bson:"password"`
	Role        string    `json:"role" bson:"role"`
	Name        string    `json:"name,omitempty" bson:"name,omitempty"`
	CreatedAt   time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" bson:"updated_at"`
	PhoneNumber string    `json:"phone_number,omitempty" bson:"phone_number,omitempty"`
	Bio         string    `json:"bio,omitempty" bson:"bio,omitempty"`

	Preferences Preferences `json:"preferences,omitempty" bson:"preferences,omitempty"`

	IsActive       bool                 `json:"is_active" bson:"is_active"`
	LastLogin      time.Time            `json:"last_login,omitempty" bson:"last_login,omitempty"`
	ProfilePicture string               `json:"profile_picture" bson:"profile_picture"`
	BannerPicture  string               `json:"banner_picture" bson:"banner_picture"`
	ProfileViews   int                  `json:"profile_views,omitempty" bson:"profile_views,omitempty"`
	Address        string               `json:"address,omitempty" bson:"address,omitempty"`
	DateOfBirth    time.Time            `json:"date_of_birth,omitempty" bson:"date_of_birth,omitempty"`
	SocialLinks    map[string]string    `json:"social_links,omitempty" bson:"social_links,omitempty"`
	IsVerified     bool                 `json:"is_verified" bson:"is_verified"`
	Follows        []string             `json:"follows,omitempty" bson:"follows,omitempty"`
	Followers      []string             `json:"followers,omitempty" bson:"followers,omitempty"`
	PasswordHash   string               `json:"password_hash" bson:"password_hash"`
	Banner         string               `json:"banner,omitempty" bson:"banner,omitempty"`
	Following      []primitive.ObjectID `json:"following" bson:"following"`
}

// UserProfileResponse defines the structure for the user profile response
type UserProfileResponse struct {
	UserID         string            `json:"userid" bson:"userid"`
	Username       string            `json:"username" bson:"username"`
	Email          string            `json:"email" bson:"email"`
	Bio            string            `json:"bio,omitempty" bson:"bio,omitempty"`
	PhoneNumber    string            `json:"phone_number,omitempty" bson:"phone_number,omitempty"`
	ProfilePicture string            `json:"profile_picture" bson:"profile_picture"`
	BannerPicture  string            `json:"banner_picture" bson:"banner_picture"`
	IsFollowing    bool              `json:"is_following" bson:"is_following"` // Added here
	Followers      int               `json:"followers" bson:"followers"`
	Follows        int               `json:"follows" bson:"follows"`
	SocialLinks    map[string]string `json:"social_links,omitempty" bson:"social_links,omitempty"`
}

// UserProfileResponse defines the structure for the user profile response
type UserSuggest struct {
	UserID         string `json:"userid" bson:"userid"`
	Username       string `json:"username" bson:"username"`
	Bio            string `json:"bio,omitempty" bson:"bio,omitempty"`
	ProfilePicture string `json:"profile_picture" bson:"profile_picture"`
	IsFollowing    bool   `json:"is_following" bson:"is_following"` // Added here
}

type Preferences struct {
	Theme                string `json:"theme" bson:"theme"`
	NotificationEmail    bool   `json:"notification_email" bson:"notification_email"`
	NotificationsEnabled bool   `json:"notificationsenabled" bson:"notificationsenabled"`
	Language             string `json:"language" bson:"language"`
	// other preference fields
}

type Activity struct {
	Username     string              `json:"username,omitempty" bson:"username,omitempty"`
	PlaceID      string              `json:"placeId,omitempty" bson:"placeId,omitempty"`
	Action       string              `json:"action,omitempty" bson:"action,omitempty"`
	PerformedBy  string              `json:"performedBy,omitempty" bson:"performedBy,omitempty"`
	Timestamp    time.Time           `json:"timestamp,omitempty" bson:"timestamp,omitempty"`
	Details      string              `json:"details,omitempty" bson:"details,omitempty"`
	IPAddress    string              `json:"ipAddress,omitempty" bson:"ipAddress,omitempty"`
	DeviceInfo   string              `json:"deviceInfo,omitempty" bson:"deviceInfo,omitempty"`
	ID           primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	UserID       primitive.ObjectID  `json:"user_id" bson:"user_id"`
	ActivityType string              `json:"activity_type" bson:"activity_type"` // e.g., "follow", "review", "buy"
	EntityID     *primitive.ObjectID `json:"entity_id,omitempty" bson:"entity_id,omitempty"`
	EntityType   *string             `json:"entity_type,omitempty" bson:"entity_type,omitempty"` // "event", "place", or null
}

type Response struct {
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

type Follower struct {
	FollowerID primitive.ObjectID `json:"follower_id" bson:"follower_id"`
	FolloweeID primitive.ObjectID `json:"followee_id" bson:"followee_id"`
	CreatedAt  time.Time          `json:"created_at" bson:"created_at"`
}

type Follow struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FollowerID primitive.ObjectID `bson:"follower_id" json:"follower_id"` // ID of the user following
	FollowedID primitive.ObjectID `bson:"followed_id" json:"followed_id"` // ID of the user being followed
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
}

type Suggestion struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Type        string             `json:"type" bson:"type"` // e.g., "place" or "event"
	Title       string             `json:"title" bson:"title"`
	Description string             `json:"description,omitempty" bson:"description,omitempty"`
	Name        string             `json:"name"`
}

type UserProfile struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username  string             `bson:"username" json:"username"`
	Email     string             `bson:"email" json:"email"`
	FullName  string             `bson:"full_name" json:"fullName"`
	Bio       string             `bson:"bio,omitempty" json:"bio"`
	AvatarURL string             `bson:"avatar_url,omitempty" json:"avatarUrl"`
	CreatedAt time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updatedAt"`
}
