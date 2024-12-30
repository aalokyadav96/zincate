package main

// // JWT-based Authorization Middleware
// func authorize(roles []string, next httprouter.Handle) httprouter.Handle {
// 	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
// 		tokenStr := r.Header.Get("Authorization")
// 		if tokenStr == "" {
// 			http.Error(w, "Unauthorized", http.StatusUnauthorized)
// 			return
// 		}

// 		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
// 			return []byte("SECRET_KEY"), nil
// 		})
// 		if err != nil || !token.Valid {
// 			http.Error(w, "Forbidden", http.StatusForbidden)
// 			return
// 		}

// 		claims := token.Claims.(jwt.MapClaims)
// 		userRoles := claims["roles"].([]interface{})
// 		for _, role := range roles {
// 			if contains(userRoles, role) {
// 				next(w, r, ps)
// 				return
// 			}
// 		}

// 		http.Error(w, "Forbidden", http.StatusForbidden)
// 	}
// }

// func contains(slice []interface{}, value string) bool {
// 	for _, v := range slice {
// 		if v == value {
// 			return true
// 		}
// 	}
// 	return false
// }
