package main

type Preferences struct {
	Theme                string `json:"theme" bson:"theme"`
	NotificationEmail    bool   `json:"notification_email" bson:"notification_email"`
	NotificationsEnabled bool   `json:"notificationsenabled" bson:"notificationsenabled"`
	Language             string `json:"language" bson:"language"`
	// other preference fields
}
