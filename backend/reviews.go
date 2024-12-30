package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/julienschmidt/httprouter"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	reviewCollection *mongo.Collection
)

func init() {
	// Initialize the collection
	reviewCollection = client.Database("eventdb").Collection("reviews")
	log.Println("Connected to MongoDB and initialized collection")
}

// GET /api/reviews/:entityType/:entityId
func getReviews(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	entityType := ps.ByName("entityType")
	entityId := ps.ByName("entityId")

	skip, limit, filters, sort := parseQueryParams(r)
	filters["entityType"] = entityType
	filters["entityId"] = entityId

	// Use pointers for Limit and Skip
	cursor, err := reviewCollection.Find(context.TODO(), filters, &options.FindOptions{
		Limit: &limit,
		Skip:  &skip,
		Sort:  sort,
	})
	if err != nil {
		http.Error(w, "Failed to retrieve reviews", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var reviews []Review
	if err := cursor.All(context.TODO(), &reviews); err != nil {
		http.Error(w, "Failed to decode reviews", http.StatusInternalServerError)
		return
	}
	if len(reviews) == 0 {
		reviews = []Review{}
	}
	// w.Header().Set("Content-Type", "application/json")
	// json.NewEncoder(w).Encode(reviews)
	// Respond with success
	w.WriteHeader(http.StatusOK)
	response := map[string]interface{}{
		"status":  http.StatusOK,
		"ok":      true,
		"message": reviews,
	}
	json.NewEncoder(w).Encode(response)
}

// // GET /api/reviews/:entityType/:entityId
// func getReviews(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
// 	entityType := ps.ByName("entityType")
// 	entityId := ps.ByName("entityId")

// 	page, limit, filters, sort := parseQueryParams(r)
// 	filters["entityType"] = entityType
// 	filters["entityId"] = entityId

// 	skip := (page - 1) * limit

// 	// Query reviews
// 	var reviews []Review
// 	cursor, err := reviewCollection.Find(context.TODO(), filters, &options.FindOptions{
// 		Limit: int64(limit),
// 		Skip:  int64(skip),
// 		Sort:  sort,
// 	})
// 	if err != nil {
// 		http.Error(w, "Failed to retrieve reviews", http.StatusInternalServerError)
// 		return
// 	}
// 	defer cursor.Close(context.TODO())
// 	cursor.All(context.TODO(), &reviews)

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(reviews)
// }

// GET /api/reviews/:entityType/:entityId/:reviewId
func getReview(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	_ = r
	reviewId := ps.ByName("reviewId")

	var review Review
	err := reviewCollection.FindOne(context.TODO(), bson.M{"_id": reviewId}).Decode(&review)
	if err != nil {
		http.Error(w, "Review not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(review)
}

// addReview handles adding a new review to an entity
func addReview(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	userId, ok := r.Context().Value(userIDKey).(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	entityType := ps.ByName("entityType")
	entityId := ps.ByName("entityId")

	// Check if the user already reviewed the entity
	count, err := reviewCollection.CountDocuments(context.TODO(), bson.M{
		"userId":     userId,
		"entityType": entityType,
		"entityId":   entityId,
	})
	if err != nil {
		log.Printf("Error checking for existing review: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if count > 0 {
		log.Printf("User %s has already reviewed entity %s/%s", userId, entityType, entityId)
		http.Error(w, "You have already reviewed this entity", http.StatusConflict)
		return
	}

	// Parse and validate the review data
	var review Review
	if err := json.NewDecoder(r.Body).Decode(&review); err != nil {
		log.Printf("Error decoding review body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if review.Rating < 1 || review.Rating > 5 {
		log.Printf("Invalid rating: %d", review.Rating)
		http.Error(w, "Rating must be between 1 and 5", http.StatusBadRequest)
		return
	}

	if review.Comment == "" {
		log.Println("Empty comment")
		http.Error(w, "Comment cannot be empty", http.StatusBadRequest)
		return
	}

	// Complete the review data
	review.ID = primitive.NewObjectID()
	review.UserID = userId
	review.EntityType = entityType
	review.EntityID = entityId
	review.Date = time.Now()

	log.Printf("Review to insert: %+v", review)

	// Insert the review into the collection
	result, err := reviewCollection.InsertOne(context.TODO(), review)
	if err != nil {
		log.Printf("MongoDB error during review insertion: %v", err)
		http.Error(w, "Failed to add review", http.StatusInternalServerError)
		return
	}

	if result.InsertedID == nil {
		log.Println("InsertOne returned nil InsertedID")
		http.Error(w, "Failed to add review", http.StatusInternalServerError)
		return
	}

	log.Printf("Review successfully inserted with ID: %v", result.InsertedID)
	w.WriteHeader(http.StatusCreated)
}

// // POST /api/reviews/:entityType/:entityId
// func addReview(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
// 	userId, ok := r.Context().Value(userIDKey).(string)
// 	if !ok {
// 		http.Error(w, "Unauthorized", http.StatusUnauthorized)
// 		return
// 	}
// 	entityType := ps.ByName("entityType")
// 	entityId := ps.ByName("entityId")

// 	// Check if user already reviewed the entity
// 	count, err := reviewCollection.CountDocuments(context.TODO(), bson.M{
// 		"userId":     userId,
// 		"entityType": entityType,
// 		"entityId":   entityId,
// 	})
// 	if err != nil {
// 		http.Error(w, "Database error", http.StatusInternalServerError)
// 		return
// 	}

// 	if count > 0 {
// 		http.Error(w, "You have already reviewed this entity", http.StatusConflict)
// 		return
// 	}

// 	// Parse and validate review data
// 	var review Review
// 	if err := json.NewDecoder(r.Body).Decode(&review); err != nil {
// 		http.Error(w, "Invalid request body", http.StatusBadRequest)
// 		return
// 	}
// 	log.Println(review)
// 	if review.Rating < 1 || review.Rating > 5 {
// 		http.Error(w, "Invalid rating. Must be between 1 and 5.", http.StatusBadRequest)
// 		return
// 	}
// 	if review.Comment == "" {
// 		http.Error(w, "Comment is required.", http.StatusBadRequest)
// 		return
// 	}

// 	review.ID = generateID(18)
// 	review.UserID = userId
// 	review.EntityType = entityType
// 	review.EntityID = entityId
// 	review.Date = time.Now()

// 	_, err = reviewCollection.InsertOne(context.TODO(), review)
// 	if err != nil {
// 		http.Error(w, "Failed to add review", http.StatusInternalServerError)
// 		return
// 	}
// 	log.Printf("Failed to insert review: %v", err)

// 	w.WriteHeader(http.StatusCreated)
// 	response := map[string]interface{}{
// 		"status":  http.StatusOK,
// 		"ok":      true,
// 		"message": review.ID,
// 	}
// 	json.NewEncoder(w).Encode(response)
// }

// PUT /api/reviews/:entityType/:entityId/:reviewId
func editReview(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	userId, _ := r.Context().Value(userIDKey).(string)
	reviewId := ps.ByName("reviewId")

	// Retrieve review
	var review Review
	err := reviewCollection.FindOne(context.TODO(), bson.M{"_id": reviewId}).Decode(&review)
	if err != nil {
		http.Error(w, "Review not found", http.StatusNotFound)
		return
	}

	// Check if user owns the review or is admin
	if review.UserID != userId && !isAdmin(r.Context()) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	// Update review
	var updatedFields map[string]interface{}
	json.NewDecoder(r.Body).Decode(&updatedFields)
	_, err = reviewCollection.UpdateOne(context.TODO(), bson.M{"_id": reviewId}, bson.M{
		"$set": updatedFields,
	})
	if err != nil {
		http.Error(w, "Failed to update review", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// DELETE /api/reviews/:entityType/:entityId/:reviewId
func deleteReview(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	userId, _ := r.Context().Value(userIDKey).(string)
	reviewId := ps.ByName("reviewId")

	// Retrieve review
	var review Review
	err := reviewCollection.FindOne(context.TODO(), bson.M{"_id": reviewId}).Decode(&review)
	if err != nil {
		http.Error(w, "Review not found", http.StatusNotFound)
		return
	}

	// Check if user owns the review or is admin
	if review.UserID != userId && !isAdmin(r.Context()) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	// Delete review
	_, err = reviewCollection.DeleteOne(context.TODO(), bson.M{"_id": reviewId})
	if err != nil {
		http.Error(w, "Failed to delete review", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// // ValidateFile uploads (if any)
// func validateMedia(fileHeader *multipart.FileHeader) error {
// 	allowedFileTypes := []string{"image/jpeg", "image/png", "image/gif"}
// 	maxFileSize := 5 * 1024 * 1024 // 5 MB

// 	if fileHeader.Size > int64(maxFileSize) {
// 		return fmt.Errorf("file size exceeds limit of %d MB", maxFileSize/1024/1024)
// 	}

// 	fileType := fileHeader.Header.Get("Content-Type")
// 	for _, allowed := range allowedFileTypes {
// 		if fileType == allowed {
// 			return nil
// 		}
// 	}
// 	return fmt.Errorf("invalid file type: %s", fileType)
// }

// // Parse pagination and sorting parameters
// func parseQueryParams(r *http.Request) (int, int, bson.M, bson.D) {
// 	query := r.URL.Query()

// 	// Pagination
// 	page, _ := strconv.Atoi(query.Get("page"))
// 	if page < 1 {
// 		page = 1
// 	}
// 	limit, _ := strconv.Atoi(query.Get("limit"))
// 	if limit < 1 {
// 		limit = 10
// 	}

// 	// Filters
// 	filters := bson.M{}
// 	if rating := query.Get("rating"); rating != "" {
// 		filters["rating"] = rating
// 	}

// 	// Sorting
// 	sort := bson.D{}
// 	switch query.Get("sort") {
// 	case "date_asc":
// 		sort = bson.D{{Key: "date", Value: 1}}
// 	case "date_desc":
// 		sort = bson.D{{Key: "date", Value: -1}}
// 	}

// 	return page, limit, filters, sort
// }

// Parse pagination and sorting parameters
func parseQueryParams(r *http.Request) (int64, int64, bson.M, bson.D) {
	query := r.URL.Query()

	// Pagination
	page, _ := strconv.Atoi(query.Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(query.Get("limit"))
	if limit < 1 {
		limit = 10
	}

	skip := int64((page - 1) * limit)

	// Filters
	filters := bson.M{}
	if rating := query.Get("rating"); rating != "" {
		filters["rating"] = rating
	}

	// Sorting
	sort := bson.D{}
	switch query.Get("sort") {
	case "date_asc":
		sort = bson.D{{Key: "date", Value: 1}}
	case "date_desc":
		sort = bson.D{{Key: "date", Value: -1}}
	}

	return skip, int64(limit), filters, sort
}

// Check admin role
func isAdmin(ctx context.Context) bool {
	role, ok := ctx.Value(roleKey).(string)
	return ok && role == "admin"
}

const roleKey = "role"
