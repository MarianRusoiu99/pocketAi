package contracts

import (
	"context"
)

// Repository interfaces implementing Repository pattern for data access
// Implements: SRP (single data access responsibility per repository)
// Supports: LSP (all implementations must be substitutable)

// StoryRepository handles story data persistence
type StoryRepository interface {
	Save(ctx context.Context, story Story) (*Story, error)
	FindByID(ctx context.Context, id string) (*Story, error)
	FindByUserID(ctx context.Context, userID string, options *QueryOptions) ([]Story, error)
	Update(ctx context.Context, id string, updates map[string]interface{}) (*Story, error)
	Delete(ctx context.Context, id string) error
	Search(ctx context.Context, query StorySearchQuery) ([]Story, int, error)
	Count(ctx context.Context, userID string) (int, error)
}

// UserRepository handles user data persistence
type UserRepository interface {
	Save(ctx context.Context, user User) (*User, error)
	FindByID(ctx context.Context, id string) (*User, error)
	FindByEmail(ctx context.Context, email string) (*User, error)
	Update(ctx context.Context, id string, updates map[string]interface{}) (*User, error)
	Delete(ctx context.Context, id string) error
	Exists(ctx context.Context, email string) (bool, error)
	List(ctx context.Context, options *QueryOptions) ([]User, int, error)
}

// SessionRepository handles authentication session persistence
type SessionRepository interface {
	Save(ctx context.Context, session AuthSession) (*AuthSession, error)
	FindByToken(ctx context.Context, token string) (*AuthSession, error)
	FindByUserID(ctx context.Context, userID string) ([]AuthSession, error)
	Update(ctx context.Context, token string, updates map[string]interface{}) (*AuthSession, error)
	Delete(ctx context.Context, token string) error
	DeleteByUserID(ctx context.Context, userID string) error
	Cleanup(ctx context.Context) (int, error) // Remove expired sessions
}

// WorkflowSessionRepository handles workflow execution session data
type WorkflowSessionRepository interface {
	Save(ctx context.Context, session WorkflowSession) (*WorkflowSession, error)
	FindBySessionID(ctx context.Context, sessionID string) (*WorkflowSession, error)
	FindByUserID(ctx context.Context, userID string, options *QueryOptions) ([]WorkflowSession, error)
	Update(ctx context.Context, sessionID string, updates map[string]interface{}) (*WorkflowSession, error)
	Delete(ctx context.Context, sessionID string) error
	DeleteExpired(ctx context.Context) (int, error)
}

// Query and search models

// QueryOptions represents common query parameters
type QueryOptions struct {
	Limit     int    `json:"limit,omitempty"`
	Offset    int    `json:"offset,omitempty"`
	SortBy    string `json:"sort_by,omitempty"`
	SortOrder string `json:"sort_order,omitempty"` // asc, desc
}

// StorySearchQuery represents story search parameters
type StorySearchQuery struct {
	UserID    string   `json:"user_id,omitempty"`
	Status    string   `json:"status,omitempty"`
	Title     string   `json:"title,omitempty"`
	Genres    []string `json:"genres,omitempty"`
	Limit     int      `json:"limit,omitempty"`
	Offset    int      `json:"offset,omitempty"`
	SortBy    string   `json:"sort_by,omitempty"`
	SortOrder string   `json:"sort_order,omitempty"`
}

// Data models used by repositories

// User represents a user in the system
type User struct {
	ID            string    `json:"id"`
	Email         string    `json:"email"`
	Name          string    `json:"name,omitempty"`
	Avatar        string    `json:"avatar,omitempty"`
	EmailVerified bool      `json:"email_verified"`
	CreatedAt     string    `json:"created"`
	UpdatedAt     string    `json:"updated"`
}

// AuthSession represents an authentication session
type AuthSession struct {
	UserID       string `json:"user_id"`
	Token        string `json:"token"`
	RefreshToken string `json:"refresh_token,omitempty"`
	ExpiresAt    string `json:"expires_at"`
	CreatedAt    string `json:"created"`
	UpdatedAt    string `json:"updated"`
}

// WorkflowSession represents a workflow execution session
type WorkflowSession struct {
	ID         string                 `json:"id"`
	SessionID  string                 `json:"session_id"`
	Type       string                 `json:"type"`
	Status     string                 `json:"status"`
	Parameters map[string]interface{} `json:"parameters"`
	Result     map[string]interface{} `json:"result,omitempty"`
	Error      string                 `json:"error,omitempty"`
	UserID     string                 `json:"user_id,omitempty"`
	CreatedAt  string                 `json:"created"`
	UpdatedAt  string                 `json:"updated"`
}

// Repository factory for dependency injection
type RepositoryFactory interface {
	StoryRepository() StoryRepository
	UserRepository() UserRepository
	SessionRepository() SessionRepository
	WorkflowSessionRepository() WorkflowSessionRepository
}

// Unit of Work pattern for transactional operations
type UnitOfWork interface {
	Begin(ctx context.Context) error
	Commit(ctx context.Context) error
	Rollback(ctx context.Context) error
	StoryRepository() StoryRepository
	UserRepository() UserRepository
	SessionRepository() SessionRepository
	WorkflowSessionRepository() WorkflowSessionRepository
}