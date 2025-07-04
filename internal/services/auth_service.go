package services

import (
	"pocket-app/internal/config"
	"pocket-app/pkg/logger"

	"github.com/pocketbase/pocketbase"
)

// AuthService handles authentication-related business logic
type AuthService struct {
	app    *pocketbase.PocketBase
	config *config.Config
}

// NewAuthService creates a new auth service
func NewAuthService(app *pocketbase.PocketBase, cfg *config.Config) *AuthService {
	return &AuthService{
		app:    app,
		config: cfg,
	}
}

// ValidateUser validates user credentials
func (s *AuthService) ValidateUser(email, password string) (map[string]interface{}, error) {
	logger.Debug("Validating user", map[string]interface{}{"email": email})
	
	// Use PocketBase's built-in authentication
	record, err := s.app.FindAuthRecordByEmail("users", email)
	if err != nil {
		return nil, err
	}
	
	// Validate password
	if !record.ValidatePassword(password) {
		return nil, err
	}
	
	return map[string]interface{}{
		"id":       record.Id,
		"email":    record.GetString("email"),
		"username": record.GetString("username"),
		"verified": record.GetBool("verified"),
	}, nil
}

// GetUserByToken retrieves user by authentication token
func (s *AuthService) GetUserByToken(token string) (map[string]interface{}, error) {
	logger.Debug("Getting user by token")
	
	// This would typically involve JWT validation
	// For now, return a placeholder implementation
	return map[string]interface{}{
		"id":       "user123",
		"email":    "user@example.com",
		"username": "user",
		"verified": true,
	}, nil
}

// RefreshToken refreshes an authentication token
func (s *AuthService) RefreshToken(refreshToken string) (map[string]interface{}, error) {
	logger.Debug("Refreshing token")
	
	// This would typically involve token validation and generation
	// For now, return a placeholder implementation
	return map[string]interface{}{
		"token":         "new_access_token",
		"refresh_token": "new_refresh_token",
		"expires_in":    3600,
	}, nil
}
