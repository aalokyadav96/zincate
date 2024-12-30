package main

import (
	"crypto/md5"
	"encoding/json"
	"fmt"
	rndm "math/rand"
	"net/http"
)

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
