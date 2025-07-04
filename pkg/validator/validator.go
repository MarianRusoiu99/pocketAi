package validator

import (
	"regexp"
	"strings"
)

// ValidationError represents a field validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidationErrors is a slice of validation errors
type ValidationErrors []ValidationError

// Add adds a new validation error
func (ve *ValidationErrors) Add(field, message string) {
	*ve = append(*ve, ValidationError{
		Field:   field,
		Message: message,
	})
}

// HasErrors returns true if there are validation errors
func (ve ValidationErrors) HasErrors() bool {
	return len(ve) > 0
}

// Validator provides validation utilities
type Validator struct {
	errors ValidationErrors
}

// New creates a new validator instance
func New() *Validator {
	return &Validator{
		errors: make(ValidationErrors, 0),
	}
}

// Required validates that a field is not empty
func (v *Validator) Required(field, value, message string) *Validator {
	if strings.TrimSpace(value) == "" {
		if message == "" {
			message = field + " is required"
		}
		v.errors.Add(field, message)
	}
	return v
}

// MinLength validates minimum string length
func (v *Validator) MinLength(field, value string, min int, message string) *Validator {
	if len(strings.TrimSpace(value)) < min {
		if message == "" {
			message = field + " must be at least " + string(rune(min)) + " characters"
		}
		v.errors.Add(field, message)
	}
	return v
}

// MaxLength validates maximum string length
func (v *Validator) MaxLength(field, value string, max int, message string) *Validator {
	if len(strings.TrimSpace(value)) > max {
		if message == "" {
			message = field + " must be at most " + string(rune(max)) + " characters"
		}
		v.errors.Add(field, message)
	}
	return v
}

// Email validates email format
func (v *Validator) Email(field, value, message string) *Validator {
	if value != "" && !isValidEmail(value) {
		if message == "" {
			message = field + " must be a valid email address"
		}
		v.errors.Add(field, message)
	}
	return v
}

// Alphanumeric validates that string contains only letters and numbers
func (v *Validator) Alphanumeric(field, value, message string) *Validator {
	if value != "" && !isAlphanumeric(value) {
		if message == "" {
			message = field + " must contain only letters and numbers"
		}
		v.errors.Add(field, message)
	}
	return v
}

// URL validates URL format
func (v *Validator) URL(field, value, message string) *Validator {
	if value != "" && !isValidURL(value) {
		if message == "" {
			message = field + " must be a valid URL"
		}
		v.errors.Add(field, message)
	}
	return v
}

// Custom allows custom validation logic
func (v *Validator) Custom(field string, isValid bool, message string) *Validator {
	if !isValid {
		v.errors.Add(field, message)
	}
	return v
}

// Errors returns all validation errors
func (v *Validator) Errors() ValidationErrors {
	return v.errors
}

// HasErrors returns true if there are validation errors
func (v *Validator) HasErrors() bool {
	return v.errors.HasErrors()
}

// Helper functions

func isValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
	return emailRegex.MatchString(email)
}

func isAlphanumeric(str string) bool {
	alphanumericRegex := regexp.MustCompile(`^[a-zA-Z0-9]+$`)
	return alphanumericRegex.MatchString(str)
}

func isValidURL(url string) bool {
	urlRegex := regexp.MustCompile(`^https?:\/\/[^\s/$.?#].[^\s]*$`)
	return urlRegex.MatchString(url)
}
