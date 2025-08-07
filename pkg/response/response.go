package response

import (
	"encoding/json"
	"net/http"
	"time"
)

// Response represents a standard API response
type Response struct {
	Success   bool        `json:"success"`
	Message   string      `json:"message"`
	Data      interface{} `json:"data,omitempty"`
	Error     interface{} `json:"error,omitempty"`
	Timestamp string      `json:"timestamp"`
}

// PaginatedResponse represents a paginated API response
type PaginatedResponse struct {
	Response
	Page     int `json:"page"`
	PerPage  int `json:"perPage"`
	Total    int `json:"total"`
	HasMore  bool `json:"hasMore"`
}

// JSON writes a JSON response
func JSON(w http.ResponseWriter, statusCode int, data interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	return json.NewEncoder(w).Encode(data)
}

// Success returns a successful response
func Success(w http.ResponseWriter, data interface{}, message string) error {
	return JSON(w, http.StatusOK, Response{
		Success:   true,
		Message:   message,
		Data:      data,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}

// Created returns a created response
func Created(w http.ResponseWriter, data interface{}, message string) error {
	return JSON(w, http.StatusCreated, Response{
		Success:   true,
		Message:   message,
		Data:      data,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}

// Error returns an error response
func Error(w http.ResponseWriter, statusCode int, message string, err ...interface{}) error {
	var errorDetail interface{}
	if len(err) > 0 {
		errorDetail = err[0]
	}
	
	return JSON(w, statusCode, Response{
		Success:   false,
		Message:   message,
		Error:     errorDetail,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}

// BadRequest returns a bad request response
func BadRequest(w http.ResponseWriter, message string, err ...interface{}) error {
	var errorDetail interface{}
	if len(err) > 0 {
		errorDetail = err[0]
	}
	return Error(w, http.StatusBadRequest, message, errorDetail)
}

// Unauthorized returns an unauthorized response
func Unauthorized(w http.ResponseWriter, message string) error {
	return Error(w, http.StatusUnauthorized, message)
}

// Forbidden returns a forbidden response
func Forbidden(w http.ResponseWriter, message string) error {
	return Error(w, http.StatusForbidden, message)
}

// NotFound returns a not found response
func NotFound(w http.ResponseWriter, message string) error {
	return Error(w, http.StatusNotFound, message)
}

// ValidationError returns a validation error response
func ValidationError(w http.ResponseWriter, errors interface{}) error {
	return JSON(w, http.StatusUnprocessableEntity, Response{
		Success:   false,
		Message:   "Validation failed",
		Error:     errors,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}

// InternalError returns an internal server error response
func InternalError(w http.ResponseWriter, message string, err error) error {
	errorDetail := "Internal server error"
	if err != nil {
		errorDetail = err.Error()
	}
	return Error(w, http.StatusInternalServerError, message, errorDetail)
}

// Paginated returns a paginated response
func Paginated(w http.ResponseWriter, data interface{}, page, perPage, total int, message string) error {
	hasMore := (page * perPage) < total
	
	return JSON(w, http.StatusOK, PaginatedResponse{
		Response: Response{
			Success:   true,
			Message:   message,
			Data:      data,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		},
		Page:    page,
		PerPage: perPage,
		Total:   total,
		HasMore: hasMore,
	})
}
