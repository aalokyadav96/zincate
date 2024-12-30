package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/julienschmidt/httprouter"
	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	router := httprouter.New()

	router.GET("/api/profile", authenticate(getProfile))
	router.PUT("/api/profile", authenticate(editProfile))
	router.PUT("/api/profile/avatar", authenticate(editProfilePic))
	router.PUT("/api/profile/banner", authenticate(editProfileBanner))
	router.DELETE("/api/profile", authenticate(deleteProfile))

	router.GET("/api/user/:username", getUserProfile)
	router.GET("/api/suggestions/follow", authenticate(suggestFollowers))

	router.POST("/api/follows/:id", rateLimit(authenticate(toggleFollow)))
	router.DELETE("/api/follows/:id", rateLimit(authenticate(toggleUnFollow)))
	router.GET("/api/follows/:id/status", rateLimit(authenticate(doesFollow)))
	router.GET("/api/followers/:id", rateLimit(authenticate(getFollowers)))
	router.GET("/api/following/:id", rateLimit(authenticate(getFollowing)))

	// CORS setup

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		// Debug:            true,
	})

	router.ServeFiles("/userpic/*filepath", http.Dir("userpic"))

	handler := securityHeaders(c.Handler(router))

	server := &http.Server{
		Addr:    ":6003",
		Handler: handler, // Use the middleware-wrapped handler
	}

	// Start server in a goroutine to handle graceful shutdown
	go func() {
		log.Println("Server started on port 6003")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not listen on port 6003: %v", err)
		}
	}()

	// Graceful shutdown listener
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	// Wait for termination signal
	<-shutdownChan
	log.Println("Shutting down gracefully...")

	// Attempt to gracefully shut down the server
	if err := server.Shutdown(context.Background()); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}
	log.Println("Server stopped")
}

// Security headers middleware
func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set HTTP headers for enhanced security
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		next.ServeHTTP(w, r) // Call the next handler
	})
}

var (
	userCollection *mongo.Collection
	client         *mongo.Client
	STATIC_URL     = os.Getenv("STATIC_URL")
)

type contextKey string

const userIDKey contextKey = "userId"

// Initialize MongoDB connection
func init() {
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	var err error
	client, err = mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	userCollection = client.Database("eventdb").Collection("users")
}

// Initialize MongoDB connection
// func loadDB() {

// 	// Load environment variables from .env file
// 	err := godotenv.Load()
// 	if err != nil {
// 		log.Fatalf("Error loading .env file")
// 	}

// 	// Get the MongoDB URI from the environment variable
// 	mongoURI := os.Getenv("MONGODB_URI")
// 	if mongoURI == "" {
// 		log.Fatalf("MONGODB_URI environment variable is not set")
// 	}

// 	// Use the SetServerAPIOptions() method to set the version of the Stable API on the client
// 	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
// 	opts := options.Client().ApplyURI(mongoURI).SetServerAPIOptions(serverAPI)

// 	// Create a new client and connect to the server
// 	client, err := mongo.Connect(context.TODO(), opts)
// 	if err != nil {
// 		panic(err)
// 	}

// 	defer func() {
// 		if err = client.Disconnect(context.TODO()); err != nil {
// 			panic(err)
// 		}
// 	}()

// 	userCollection = client.Database("eventdb").Collection("users")
// }

// func init() {
// 	// Load environment variables from .env file
// 	err := godotenv.Load()
// 	if err != nil {
// 		log.Fatalf("Error loading .env file")
// 	}

// 	// Get the MongoDB URI from the environment variable
// 	mongoURI := os.Getenv("MONGODB_URI")
// 	if mongoURI == "" {
// 		log.Fatalf("MONGODB_URI environment variable is not set")
// 	}

// 	// Set up MongoDB client options
// 	clientOptions := options.Client().ApplyURI(mongoURI)

// 	// Connect to MongoDB
// 	client, err = mongo.Connect(context.TODO(), clientOptions)
// 	if err != nil {
// 		log.Fatalf("Failed to connect to MongoDB: %v", err)
// 	}

// 	// Set the user collection
// 	userCollection = client.Database("eventdb").Collection("users")
// }
