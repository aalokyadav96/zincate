package main

import (
	"crypto/md5"
	"encoding/json"
	"fmt"
	rndm "math/rand"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

// Helper function to check if a user is in a slice of followers
func contains(slice []string, value string) bool {
	for _, v := range slice {
		if v == value {
			return true
		}
	}
	return false
}

// func contains(slice []string, item string) bool {
// 	for _, a := range slice {
// 		if a == item {
// 			return true
// 		}
// 	}
// 	return false
// }

// Helper function to remove a string from a slice
func removeString(slice []string, s string) []string {
	for i, v := range slice {
		if v == s {
			return append(slice[:i], slice[i+1:]...) // Remove element
		}
	}
	return slice
}

// func sendImageAsBytes(w http.ResponseWriter, _ *http.Request, a httprouter.Params) {
// 	buf, err := os.ReadFile("./images/" + a.ByName("imageName"))
// 	if err != nil {
// 		log.Print(err)
// 	}
// 	w.Header().Set("Content-Type", "image/png")
// 	w.Write(buf)
// }

func CSRF(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	fmt.Fprint(w, GenerateName(8))
}

func GenerateName(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyz0123456789_ABCDEFGHIJKLMNOPQRSTUVWXYZ")

	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rndm.Intn(len(letters))]
	}
	return string(b)
}

// func renderError(w http.ResponseWriter, message string, statusCode int) {
// 	w.WriteHeader(statusCode)
// 	w.Write([]byte(message))
// }

func EncrypIt(strToHash string) string {
	data := []byte(strToHash)
	return fmt.Sprintf("%x", md5.Sum(data))
}

func sendResponse(w http.ResponseWriter, status int, data interface{}, message string, err error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	response := map[string]interface{}{
		"status":  status,
		"message": message,
		"data":    data,
	}

	if err != nil {
		response["error"] = err.Error()
	}

	// Encode response and check for encoding errors
	if encodeErr := json.NewEncoder(w).Encode(response); encodeErr != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

// type CustomError struct {
// 	Code    int
// 	Message string
// }

// func (e *CustomError) Error() string {
// 	return e.Message
// }

// func sendError(w http.ResponseWriter, err *CustomError) {
// 	w.WriteHeader(err.Code)
// 	json.NewEncoder(w).Encode(map[string]string{"error": err.Message})
// }

// func funcname() {
// 	if err != nil {
// 		sendError(w, &CustomError{Code: http.StatusInternalServerError, Message: "Error retrieving event"})
// 		return
// 	}

// }
