package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/julienschmidt/httprouter"
	"go.mongodb.org/mongo-driver/bson"
)

func parseToken(r *http.Request) (*Claims, error) {
	tokenString := r.Header.Get("Authorization")
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString[7:], claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	return claims, nil
}

func getFollowers(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	claims, err := parseToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userKey := fmt.Sprintf("user:%s:followers", claims.Username)
	cachedFollowers, err := RdxGet(userKey)
	if err == nil {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(cachedFollowers))
		return
	}

	var user User
	err = userCollection.FindOne(context.TODO(), bson.M{"username": claims.Username}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	followers := []User{}
	for _, followerID := range user.Follows {
		var follower User
		if err := userCollection.FindOne(context.TODO(), bson.M{"userid": followerID}).Decode(&follower); err == nil {
			followers = append(followers, follower)
		}
	}

	// Cache the followers list for the user
	followersJSON, _ := json.Marshal(followers)
	RdxSet(userKey, string(followersJSON))

	json.NewEncoder(w).Encode(followers)
}

// Handle retrieving following
func getFollowing(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	tokenString := r.Header.Get("Authorization")
	claims := &Claims{}
	jwt.ParseWithClaims(tokenString[7:], claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	var user User
	err := userCollection.FindOne(context.TODO(), bson.M{"username": claims.Username}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		log.Printf("User not found: %s", claims.Username)
		return
	}

	following := []User{}
	for _, followingID := range user.Follows {
		var followUser User
		if err := userCollection.FindOne(context.TODO(), bson.M{"userid": followingID}).Decode(&followUser); err == nil {
			following = append(following, followUser)
		}
	}

	json.NewEncoder(w).Encode(following)
}

func suggestFollowers(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	claims, err := parseToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Pagination parameters
	page := r.URL.Query().Get("page")
	limit := r.URL.Query().Get("limit")

	if page == "" {
		page = "1"
	}
	if limit == "" {
		limit = "10"
	}

	// You can add pagination logic here based on `page` and `limit`

	var user User
	err = userCollection.FindOne(context.TODO(), bson.M{"username": claims.Username}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Query for suggested users excluding the current user and already followed users
	cursor, err := userCollection.Find(context.TODO(), bson.M{"username": bson.M{"$ne": user.Username}})
	if err != nil {
		http.Error(w, "Failed to fetch suggestions", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	suggestedUsers := []UserSuggest{}
	for cursor.Next(context.TODO()) {
		var suggestedUser UserSuggest
		if err := cursor.Decode(&suggestedUser); err == nil && !contains(user.Follows, suggestedUser.Username) {
			suggestedUsers = append(suggestedUsers, suggestedUser)
		}
	}
	if len(suggestedUsers) == 0 {
		suggestedUsers = []UserSuggest{}
	}

	// Return the suggested users
	json.NewEncoder(w).Encode(suggestedUsers)
}

func doesFollow(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	userId, ok := r.Context().Value(userIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	followedUserId := ps.ByName("id")
	if followedUserId == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	log.Printf("User %s is trying to toggle follow for user %s", userId, followedUserId)

	// Retrieve the current user
	var currentUser User
	err := userCollection.FindOne(context.TODO(), bson.M{"userid": userId}).Decode(&currentUser)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Check if the user is already following the followed user
	isFollowing := false
	for _, followedID := range currentUser.Follows {
		if followedID == followedUserId {
			isFollowing = true
			break
		}
	}

	// Return the updated follow status in the response
	response := map[string]bool{"isFollowing": isFollowing} // Toggle status
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// // // Toggle Follow function
// // func toggleFollow(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
// // 	userId, ok := r.Context().Value(userIDKey).(string)
// // 	if !ok {
// // 		http.Error(w, "Unauthorized", http.StatusUnauthorized)
// // 		return
// // 	}

// // 	followedUserId := ps.ByName("id")
// // 	if followedUserId == "" {
// // 		http.Error(w, "User ID is required", http.StatusBadRequest)
// // 		return
// // 	}

// // 	log.Printf("User %s is trying to toggle follow for user %s", userId, followedUserId)

// // 	// Retrieve the current user
// // 	var currentUser User
// // 	err := userCollection.FindOne(context.TODO(), bson.M{"userid": userId}).Decode(&currentUser)
// // 	if err != nil {
// // 		http.Error(w, "User not found", http.StatusNotFound)
// // 		return
// // 	}

// // 	// Check if the user is already following the followed user
// // 	isFollowing := false
// // 	for _, followedID := range currentUser.Follows {
// // 		if followedID == followedUserId {
// // 			isFollowing = true
// // 			break
// // 		}
// // 	}

// // 	if isFollowing {
// // 		// Unfollow: remove followedUserId from currentUser.Follows
// // 		currentUser.Follows = removeString(currentUser.Follows, followedUserId)

// // 		// Remove currentUser.UserID from followed user's Followers
// // 		_, err = userCollection.UpdateOne(context.TODO(), bson.M{"userid": followedUserId}, bson.M{
// // 			"$pull": bson.M{"followers": userId},
// // 		})
// // 		if err != nil {
// // 			log.Printf("Error updating followers: %v", err)
// // 			http.Error(w, "Failed to update followers", http.StatusInternalServerError)
// // 			return
// // 		}
// // 	} else {
// // 		// Follow: add followedUserId to currentUser.Follows
// // 		currentUser.Follows = append(currentUser.Follows, followedUserId)

// // 		// Add currentUser.UserID to followed user's Followers
// // 		_, err = userCollection.UpdateOne(context.TODO(), bson.M{"userid": followedUserId}, bson.M{
// // 			"$addToSet": bson.M{"followers": userId},
// // 		})
// // 		if err != nil {
// // 			log.Printf("Error updating followers: %v", err)
// // 			http.Error(w, "Failed to update followers", http.StatusInternalServerError)
// // 			return
// // 		}
// // 	}

// // 	// Update the current user's follows array
// // 	_, err = userCollection.UpdateOne(context.TODO(), bson.M{"userid": userId}, bson.M{
// // 		"$set": bson.M{"follows": currentUser.Follows},
// // 	})
// // 	if err != nil {
// // 		log.Printf("Error updating follows: %v", err)
// // 		http.Error(w, "Failed to update follows", http.StatusInternalServerError)
// // 		return
// // 	}

// // 	// Return the updated follow status in the response
// // 	response := map[string]bool{"isFollowing": !isFollowing} // Toggle status
// // 	w.Header().Set("Content-Type", "application/json")
// // 	w.WriteHeader(http.StatusOK)
// // 	json.NewEncoder(w).Encode(response)
// // }

// // Follow function
// func toggleFollow(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
// 	userId, ok := r.Context().Value(userIDKey).(string)
// 	if !ok {
// 		http.Error(w, "Unauthorized", http.StatusUnauthorized)
// 		return
// 	}

// 	followedUserId := ps.ByName("id")
// 	if followedUserId == "" {
// 		http.Error(w, "User ID is required", http.StatusBadRequest)
// 		return
// 	}

// 	log.Printf("User %s is trying to follow user %s", userId, followedUserId)

// 	// Retrieve the current user
// 	var currentUser User
// 	err := userCollection.FindOne(context.TODO(), bson.M{"userid": userId}).Decode(&currentUser)
// 	if err != nil {
// 		http.Error(w, "User not found", http.StatusNotFound)
// 		return
// 	}

// 	// Check if the user is already following the followed user
// 	for _, followedID := range currentUser.Follows {
// 		if followedID == followedUserId {
// 			http.Error(w, "Already following this user", http.StatusBadRequest)
// 			return
// 		}
// 	}

// 	// Follow: add followedUserId to currentUser.Follows
// 	currentUser.Follows = append(currentUser.Follows, followedUserId)

// 	// Add currentUser.UserID to followed user's Followers
// 	_, err = userCollection.UpdateOne(context.TODO(), bson.M{"userid": followedUserId}, bson.M{
// 		"$addToSet": bson.M{"followers": userId},
// 	})
// 	if err != nil {
// 		log.Printf("Error updating followers: %v", err)
// 		http.Error(w, "Failed to update followers", http.StatusInternalServerError)
// 		return
// 	}

// 	// Update the current user's follows array
// 	_, err = userCollection.UpdateOne(context.TODO(), bson.M{"userid": userId}, bson.M{
// 		"$set": bson.M{"follows": currentUser.Follows},
// 	})
// 	if err != nil {
// 		log.Printf("Error updating follows: %v", err)
// 		http.Error(w, "Failed to update follows", http.StatusInternalServerError)
// 		return
// 	}

// 	// Return the updated follow status in the response
// 	response := map[string]bool{"isFollowing": true}
// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(http.StatusOK)
// 	json.NewEncoder(w).Encode(response)
// }

// // Unfollow function
// func toggleUnFollow(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
// 	userId, ok := r.Context().Value(userIDKey).(string)
// 	if !ok {
// 		http.Error(w, "Unauthorized", http.StatusUnauthorized)
// 		return
// 	}

// 	followedUserId := ps.ByName("id")
// 	if followedUserId == "" {
// 		http.Error(w, "User ID is required", http.StatusBadRequest)
// 		return
// 	}

// 	log.Printf("User %s is trying to unfollow user %s", userId, followedUserId)

// 	// Retrieve the current user
// 	var currentUser User
// 	err := userCollection.FindOne(context.TODO(), bson.M{"userid": userId}).Decode(&currentUser)
// 	if err != nil {
// 		http.Error(w, "User not found", http.StatusNotFound)
// 		return
// 	}

// 	// Check if the user is already following the followed user
// 	isFollowing := false
// 	for _, followedID := range currentUser.Follows {
// 		if followedID == followedUserId {
// 			isFollowing = true
// 			break
// 		}
// 	}

// 	if !isFollowing {
// 		http.Error(w, "Not following this user", http.StatusBadRequest)
// 		return
// 	}

// 	// Unfollow: remove followedUserId from currentUser.Follows
// 	currentUser.Follows = removeString(currentUser.Follows, followedUserId)

// 	// Remove currentUser.UserID from followed user's Followers
// 	_, err = userCollection.UpdateOne(context.TODO(), bson.M{"userid": followedUserId}, bson.M{
// 		"$pull": bson.M{"followers": userId},
// 	})
// 	if err != nil {
// 		log.Printf("Error updating followers: %v", err)
// 		http.Error(w, "Failed to update followers", http.StatusInternalServerError)
// 		return
// 	}

// 	// Update the current user's follows array
// 	_, err = userCollection.UpdateOne(context.TODO(), bson.M{"userid": userId}, bson.M{
// 		"$set": bson.M{"follows": currentUser.Follows},
// 	})
// 	if err != nil {
// 		log.Printf("Error updating follows: %v", err)
// 		http.Error(w, "Failed to update follows", http.StatusInternalServerError)
// 		return
// 	}

// 	// Return the updated follow status in the response
// 	response := map[string]bool{"isFollowing": false}
// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(http.StatusOK)
// 	json.NewEncoder(w).Encode(response)
// }

func updateFollowRelationship(currentUser *User, targetUserID string, action string) error {
	var update bson.M
	if action == "follow" {
		currentUser.Follows = append(currentUser.Follows, targetUserID)
		update = bson.M{"$addToSet": bson.M{"followers": currentUser.UserID}}
	} else if action == "unfollow" {
		currentUser.Follows = removeString(currentUser.Follows, targetUserID)
		update = bson.M{"$pull": bson.M{"followers": currentUser.UserID}}
	} else {
		return fmt.Errorf("invalid action")
	}

	// Update target user's followers
	_, err := userCollection.UpdateOne(context.TODO(), bson.M{"userid": targetUserID}, update)
	if err != nil {
		return fmt.Errorf("error updating followers: %w", err)
	}

	// Update current user's follows
	_, err = userCollection.UpdateOne(context.TODO(), bson.M{"userid": currentUser.UserID}, bson.M{
		"$set": bson.M{"follows": currentUser.Follows},
	})
	if err != nil {
		return fmt.Errorf("error updating follows: %w", err)
	}

	return nil
}

func handleFollowAction(w http.ResponseWriter, r *http.Request, ps httprouter.Params, action string) {
	userID, ok := r.Context().Value(userIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	targetUserID := ps.ByName("id")
	if targetUserID == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	// Retrieve the current user
	var currentUser User
	err := userCollection.FindOne(context.TODO(), bson.M{"userid": userID}).Decode(&currentUser)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Perform follow/unfollow action
	err = updateFollowRelationship(&currentUser, targetUserID, action)
	if err != nil {
		log.Printf("Error updating relationship: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Response
	isFollowing := action == "follow"
	response := map[string]bool{"isFollowing": isFollowing}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func toggleFollow(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	handleFollowAction(w, r, ps, "follow")
}

func toggleUnFollow(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	handleFollowAction(w, r, ps, "unfollow")
}
