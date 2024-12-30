package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/julienschmidt/httprouter"
	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type contextKey string

const userIDKey contextKey = "userId"

// Global variables
var (
	client        *mongo.Client
	STATIC_URL    = os.Getenv("STATIC_URL")
	AD_SERV       = os.Getenv("AD_SERV")
	AUTH_SERV     = os.Getenv("AUTH_SERV")
	BUSINESS_SERV = os.Getenv("BUSINESS_SERV")
	EVENTS_SERV   = os.Getenv("EVENTS_SERV")
	FEED_SERV     = os.Getenv("FEED_SERV")
	MEDIA_SERV    = os.Getenv("MEDIA_SERV")
	MERCH_SERV    = os.Getenv("MERCH_SERV")
	PLACE_SERV    = os.Getenv("PLACE_SERV")
	PROFILE_SERV  = os.Getenv("PROFILE_SERV")
	SETTINGS_SERV = os.Getenv("SETTINGS_SERV")
	TICKET_SERV   = os.Getenv("TICKET_SERV")
)

func getServiceURL(serviceName string) (string, error) {
	fmt.Println(serviceName)
	serviceURL := os.Getenv(serviceName)
	if serviceURL == "" {
		return "", fmt.Errorf("service %s not configured", serviceName)
	}
	return serviceURL, nil
}

// Enhanced error handling in proxyWithCircuitBreaker
func proxyWithCircuitBreaker(serviceName string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		serviceURL, err := getServiceURL(serviceName)
		if err != nil {
			http.Error(w, "Service Unavailable", http.StatusServiceUnavailable)
			log.Printf("Service %s not found: %v", serviceName, err)
			return
		}

		cb, exists := circuitBreakers[serviceName]
		if !exists {
			cb = initCircuitBreaker(serviceName)
		}

		result, err := cb.Execute(func() (interface{}, error) {
			client := &http.Client{Timeout: 10 * time.Second}
			req, err := http.NewRequest(r.Method, serviceURL+r.URL.Path, r.Body)
			if err != nil {
				return nil, err
			}
			req.Header = r.Header

			resp, err := client.Do(req)
			if err != nil {
				return nil, err
			}
			defer resp.Body.Close()

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				return nil, err
			}
			return body, nil
		})
		var ErrCircuitOpen error
		if err != nil {
			if errors.Is(err, ErrCircuitOpen) {
				http.Error(w, "Circuit Open", http.StatusServiceUnavailable)
			} else {
				http.Error(w, "Service Unavailable", http.StatusServiceUnavailable)
			}
			log.Printf("Error in circuit breaker for service %s: %v", serviceName, err)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write(result.([]byte))
	}
}

// Wrap http.HandlerFunc into httprouter.Handle
func wrapHandler(handler http.HandlerFunc) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		handler(w, r) // Call the wrapped handler
	}
}

// Redirector function for HTTP methods
func redirector(router *httprouter.Router, path, serviceName string) {
	for _, method := range []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"} {
		router.Handle(method, path, wrapHandler(proxyWithCircuitBreaker(serviceName)))
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	router := httprouter.New()

	// Example Routes
	router.GET("/", wrapHandler(proxyWithCircuitBreaker("frontend-service")))

	// // Example of Authorization
	// router.POST("/api/admin/create", authorize([]string{"admin"}, wrapHandler(proxyWithCircuitBreaker("admin-service"))))

	redirector(router, "/api/auth/*path", "AUTH_SERV")
	redirector(router, "/api/settings/*path", "SETTINGS_SERV")
	redirector(router, "/api/profile/*path", "PROFILE_SERV")
	redirector(router, "/api/follows/*path", "PROFILE_SERV")
	redirector(router, "/userpic/*filepath", "PROFILE_SERV")
	router.Handle("GET", "/api/suggestions/follow", wrapHandler(proxyWithCircuitBreaker("PROFILE_SERV")))
	redirector(router, "/api/feed/*path", "FEED_SERV")
	redirector(router, "/postpic/*filepath", "FEED_SERV")
	redirector(router, "/api/media/*path", "MEDIA_SERV")
	redirector(router, "/uploads/*filepath", "MEDIA_SERV")
	redirector(router, "/api/merch/*path", "MERCH_SERV")
	redirector(router, "/merchpic/*filepath", "MERCH_SERV")
	redirector(router, "/api/ticket/*path", "TICKET_SERV")
	redirector(router, "/api/places/*path", "PLACE_SERV")
	redirector(router, "/placepic/*filepath", "PLACE_SERV")
	router.Handle("GET", "/api/suggestions/places", wrapHandler(proxyWithCircuitBreaker("PLACE_SERV")))
	redirector(router, "/api/events/*path", "EVENTS_SERV")
	redirector(router, "/eventpic/*filepath", "EVENTS_SERV")
	redirector(router, "/api/business/*path", "BUSINESS_SERV")
	redirector(router, "/api/owner/*path", "BUSINESS_SERV")
	redirector(router, "/api/sda/*path", "AD_SERV")
	redirector(router, "/sdapic/*filepath", "AD_SERV")

	router.POST("/api/activity", authenticate(logActivity))
	router.GET("/api/activity", authenticate(getActivityFeed))

	router.GET("/api/search/events", rateLimit(searchEvents))

	router.GET("/api/reviews/:entityType/:entityId", authenticate(getReviews))
	router.GET("/api/reviews/:entityType/:entityId/:reviewId", authenticate(getReview))
	router.POST("/api/reviews/:entityType/:entityId", authenticate(addReview))
	router.PUT("/api/reviews/:entityType/:entityId/:reviewId", authenticate(editReview))
	router.DELETE("/api/reviews/:entityType/:entityId/:reviewId", authenticate(deleteReview))
	// CORS setup
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := securityHeaders(c.Handler(router))

	server := &http.Server{
		Addr:    ":4000",
		Handler: handler, // Use the middleware-wrapped handler
	}

	// Start server in a goroutine to handle graceful shutdown
	go func() {
		log.Println("Server started on port 4000")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not listen on port 4000: %v", err)
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

// Initialize MongoDB connection with context timeout
func init() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	var err error
	client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
}

// // Initialize MongoDB connection
// func init() {
// 	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
// 	var err error
// 	client, err = mongo.Connect(context.TODO(), clientOptions)
// 	if err != nil {
// 		log.Fatalf("Failed to connect to MongoDB: %v", err)
// 	}
// }
