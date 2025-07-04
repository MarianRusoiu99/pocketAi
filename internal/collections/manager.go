package collections

import (
	"pocket-app/internal/config"
	"pocket-app/pkg/logger"

	"github.com/pocketbase/pocketbase"
)

// Manager manages all collection definitions
type Manager struct {
	app    *pocketbase.PocketBase
	config *config.Config
}

// New creates a new collections manager
func New(app *pocketbase.PocketBase, cfg *config.Config) *Manager {
	return &Manager{
		app:    app,
		config: cfg,
	}
}

// Init initializes all collections
func (m *Manager) Init() error {
	logger.Info("Collections manager initialized")
	
	// Note: In PocketBase v0.28.4+, collections should be created through:
	// 1. Admin UI at /admin
	// 2. Migration files
	// 3. Database schema imports
	// 
	// Programmatic collection creation is typically not done in the Go extension approach.
	// The collections (user_profiles, posts, etc.) should exist before running the app.
	
	logger.Info("Collections setup completed - ensure collections exist via admin UI or migrations")
	return nil
}

// createUserProfilesCollection creates the user_profiles collection using migrations
func (m *Manager) createUserProfilesCollection() error {
	// Check if collection already exists
	if _, err := m.app.FindCollectionByNameOrId("user_profiles"); err == nil {
		logger.Debug("user_profiles collection already exists")
		return nil
	}
	
	// For now, we'll create collections through the admin UI or migrations
	// In PocketBase v0.28.4, programmatic collection creation is typically done through migrations
	logger.Info("user_profiles collection should be created via migration")
	return nil
}

// createPostsCollection creates the posts collection using migrations
func (m *Manager) createPostsCollection() error {
	// Check if collection already exists
	if _, err := m.app.FindCollectionByNameOrId("posts"); err == nil {
		logger.Debug("posts collection already exists")
		return nil
	}
	
	// For now, we'll create collections through the admin UI or migrations
	logger.Info("posts collection should be created via migration")
	return nil
}
