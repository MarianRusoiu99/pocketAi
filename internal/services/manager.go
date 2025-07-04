package services

import (
	"pocket-app/internal/config"
	"pocket-app/pkg/logger"

	"github.com/pocketbase/pocketbase"
)

// Manager manages all services
type Manager struct {
	app    *pocketbase.PocketBase
	config *config.Config
	
	// Add your services here
	User   *UserService
	Post   *PostService
	Auth   *AuthService
}

// New creates a new services manager
func New(app *pocketbase.PocketBase, cfg *config.Config) *Manager {
	return &Manager{
		app:    app,
		config: cfg,
	}
}

// Init initializes all services
func (m *Manager) Init() error {
	logger.Info("Initializing services...")
	
	// Initialize services
	m.User = NewUserService(m.app, m.config)
	m.Post = NewPostService(m.app, m.config)
	m.Auth = NewAuthService(m.app, m.config)
	
	logger.Info("Services initialized successfully")
	return nil
}
