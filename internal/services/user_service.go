package services

import (
	"pocket-app/internal/config"
	"pocket-app/pkg/logger"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

// UserService handles user-related business logic
type UserService struct {
	app    *pocketbase.PocketBase
	config *config.Config
}

// NewUserService creates a new user service
func NewUserService(app *pocketbase.PocketBase, cfg *config.Config) *UserService {
	return &UserService{
		app:    app,
		config: cfg,
	}
}

// GetUserProfile retrieves a user profile with extended information
func (s *UserService) GetUserProfile(userID string) (*core.Record, error) {
	// Get user record
	user, err := s.app.FindRecordById("_pb_users_auth_", userID)
	if err != nil {
		logger.Error("Failed to find user", err)
		return nil, err
	}

	// Try to get extended profile
	profile, err := s.app.FindFirstRecordByFilter(
		"user_profiles", 
		"user = {:id}",
		map[string]interface{}{"id": userID},
	)
	if err != nil {
		logger.Debug("No extended profile found for user", userID)
		// Return basic user info even if extended profile doesn't exist
		return user, nil
	}

	// You can enhance this to merge user and profile data
	return profile, nil
}

// CreateUserProfile creates an extended user profile
func (s *UserService) CreateUserProfile(userID string, data map[string]interface{}) (*core.Record, error) {
	collection, err := s.app.FindCollectionByNameOrId("user_profiles")
	if err != nil {
		logger.Error("Failed to find user_profiles collection", err)
		return nil, err
	}

	profile := core.NewRecord(collection)
	profile.Set("user", userID)
	
	// Set profile data
	for key, value := range data {
		if key != "user" { // Prevent overriding user field
			profile.Set(key, value)
		}
	}

	if err := s.app.Save(profile); err != nil {
		logger.Error("Failed to create user profile", err)
		return nil, err
	}

	return profile, nil
}

// UpdateUserProfile updates an existing user profile
func (s *UserService) UpdateUserProfile(userID string, data map[string]interface{}) (*core.Record, error) {
	profile, err := s.app.FindFirstRecordByFilter(
		"user_profiles", 
		"user = {:id}",
		map[string]interface{}{"id": userID},
	)
	if err != nil {
		logger.Error("Failed to find user profile", err)
		return nil, err
	}

	// Update profile data
	for key, value := range data {
		if key != "user" { // Prevent overriding user field
			profile.Set(key, value)
		}
	}

	if err := s.app.Save(profile); err != nil {
		logger.Error("Failed to update user profile", err)
		return nil, err
	}

	return profile, nil
}

// GetPublicProfiles retrieves public user profiles with pagination
func (s *UserService) GetPublicProfiles(page, perPage int, search string) ([]*core.Record, error) {
	filter := "is_public = true"
	params := map[string]interface{}{}
	
	if search != "" {
		filter += " && (display_name ~ {:search} || user.username ~ {:search})"
		params["search"] = search
	}

	records, err := s.app.FindRecordsByFilter(
		"user_profiles",
		filter,
		"-created",
		perPage,
		(page-1)*perPage,
	)
	if err != nil {
		logger.Error("Failed to get public profiles", err)
		return nil, err
	}

	return records, nil
}
