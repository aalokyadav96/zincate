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

	router.GET("/business/businesses", rateLimit(GetBusinesses))
	router.POST("/business/business", authenticate(AddBusinessHandler))
	router.GET("/business/business/:id", GetBusinessHandler)
	router.POST("/business/business/:id/book", BookSlotHandler)
	router.GET("/business/business/:id/menu", GetMenuHandler)
	router.GET("/business/business/:id/promotions", GetPromotionsHandler)

	// Define business-side routes
	router.POST("/owner/register", RegisterOwnerHandler)
	router.POST("/owner/login", LoginOwnerHandler)
	router.POST("/owner/business", AddBusinessByOwnerHandler)
	router.PUT("/owner/business/:id", UpdateBusinessHandler)
	router.DELETE("/owner/business/:id", DeleteBusinessHandler)
	router.POST("/owner/business/:id/menu", AddOrUpdateMenuHandler)
	router.DELETE("/owner/business/:id/menu/:itemId", DeleteMenuItemHandler)
	router.POST("/owner/business/:id/promotions", AddPromotionHandler)
	router.DELETE("/owner/business/:id/promotions/:promoId", DeletePromotionHandler)
	router.GET("/owner/business/:id/bookings", ViewBookingsHandler)
	router.DELETE("/owner/business/:id/bookings/:bookingId", CancelBookingHandler)

	// CORS setup

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		// Debug:            true,
	})

	router.ServeFiles("/eventpic/*filepath", http.Dir("eventpic"))

	handler := securityHeaders(c.Handler(router))

	server := &http.Server{
		Addr:    ":6009",
		Handler: handler, // Use the middleware-wrapped handler
	}

	// Start server in a goroutine to handle graceful shutdown
	go func() {
		log.Println("Server started on port 6009")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not listen on port 6009: %v", err)
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
	// userCollection *mongo.Collection
	client     *mongo.Client
	STATIC_URL = os.Getenv("STATIC_URL")
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
	// userCollection = client.Database("eventdb").Collection("users")
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
