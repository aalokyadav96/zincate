package main

import (
	"crypto/md5"
	"encoding/json"
	"fmt"
	rndm "math/rand"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

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

func generateID(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyz0123456789_ABCDEFGHIJKLMNOPQRSTUVWXYZ")

	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rndm.Intn(len(letters))]
	}
	return string(b)
}

// Utility function to send JSON response
func sendJSONResponse(w http.ResponseWriter, status int, response interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}
