package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"regexp"
	"strings"
	"time"
)

// Validator provides common validation functions
type Validator struct{}

// NewValidator creates a new validator instance
func NewValidator() *Validator {
	return &Validator{}
}

// ValidateEmail validates an email address
func (v *Validator) ValidateEmail(email string) error {
	if email == "" {
		return fmt.Errorf("email is required")
	}
	
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return fmt.Errorf("invalid email format")
	}
	
	return nil
}

// ValidatePassword validates a password
func (v *Validator) ValidatePassword(password string) error {
	if password == "" {
		return fmt.Errorf("password is required")
	}
	
	if len(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters")
	}
	
	// Check for at least one uppercase letter
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	if !hasUpper {
		return fmt.Errorf("password must contain at least one uppercase letter")
	}
	
	// Check for at least one lowercase letter
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	if !hasLower {
		return fmt.Errorf("password must contain at least one lowercase letter")
	}
	
	// Check for at least one digit
	hasDigit := regexp.MustCompile(`\d`).MatchString(password)
	if !hasDigit {
		return fmt.Errorf("password must contain at least one digit")
	}
	
	return nil
}

// SanitizeString removes potentially dangerous characters
func (v *Validator) SanitizeString(input string) string {
	// Remove HTML tags
	htmlRegex := regexp.MustCompile(`<[^>]*>`)
	sanitized := htmlRegex.ReplaceAllString(input, "")
	
	// Remove script tags and content
	scriptRegex := regexp.MustCompile(`(?i)<script[^>]*>.*?</script>`)
	sanitized = scriptRegex.ReplaceAllString(sanitized, "")
	
	// Trim whitespace
	return strings.TrimSpace(sanitized)
}

// Formatter provides common formatting functions
type Formatter struct{}

// NewFormatter creates a new formatter instance
func NewFormatter() *Formatter {
	return &Formatter{}
}

// FormatTimestamp formats a timestamp to RFC3339
func (f *Formatter) FormatTimestamp(t time.Time) string {
	return t.UTC().Format(time.RFC3339)
}

// FormatNow returns the current timestamp formatted as RFC3339
func (f *Formatter) FormatNow() string {
	return f.FormatTimestamp(time.Now())
}

// Generator provides utility generation functions
type Generator struct{}

// NewGenerator creates a new generator instance
func NewGenerator() *Generator {
	return &Generator{}
}

// GenerateRandomString generates a random string of specified length
func (g *Generator) GenerateRandomString(length int) (string, error) {
	bytes := make([]byte, length/2)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	
	return hex.EncodeToString(bytes)[:length], nil
}

// GenerateID generates a random ID
func (g *Generator) GenerateID() (string, error) {
	return g.GenerateRandomString(16)
}

// Helper provides various helper functions
type Helper struct {
	Validator *Validator
	Formatter *Formatter
	Generator *Generator
}

// NewHelper creates a new helper instance with all utilities
func NewHelper() *Helper {
	return &Helper{
		Validator: NewValidator(),
		Formatter: NewFormatter(),
		Generator: NewGenerator(),
	}
}

// Contains checks if a slice contains a specific string
func Contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// StringInSlice checks if a string exists in a slice
func StringInSlice(str string, slice []string) bool {
	return Contains(slice, str)
}

// RemoveFromSlice removes a string from a slice
func RemoveFromSlice(slice []string, item string) []string {
	result := make([]string, 0, len(slice))
	for _, s := range slice {
		if s != item {
			result = append(result, s)
		}
	}
	return result
}

// TruncateString truncates a string to a maximum length
func TruncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	
	if maxLen <= 3 {
		return s[:maxLen]
	}
	
	return s[:maxLen-3] + "..."
}
