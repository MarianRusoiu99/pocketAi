package contracts

import (
	"context"
	"time"
)

// External service interfaces for third-party integrations
// Implements: DIP (depend on abstractions, not concrete implementations)
// Supports: LSP (all implementations must be substitutable)

// RivetClient handles communication with Rivet AI workflows
type RivetClient interface {
	ExecuteWorkflow(ctx context.Context, request RivetWorkflowRequest) (*RivetWorkflowResponse, error)
	Ping(ctx context.Context) error
	GetStatus(ctx context.Context) (*RivetStatus, error)
}

// HTTPClient provides abstraction for HTTP communications
type HTTPClient interface {
	Post(ctx context.Context, url string, body interface{}, headers map[string]string) (*HTTPResponse, error)
	Get(ctx context.Context, url string, headers map[string]string) (*HTTPResponse, error)
	Put(ctx context.Context, url string, body interface{}, headers map[string]string) (*HTTPResponse, error)
	Delete(ctx context.Context, url string, headers map[string]string) (*HTTPResponse, error)
}

// EmailService handles email delivery
type EmailService interface {
	SendWelcomeEmail(ctx context.Context, user User) error
	SendPasswordResetEmail(ctx context.Context, user User, resetToken string) error
	SendNotificationEmail(ctx context.Context, user User, notification Notification) error
	ValidateEmail(email string) error
}

// NotificationService handles in-app notifications
type NotificationService interface {
	Send(ctx context.Context, notification Notification) error
	MarkAsRead(ctx context.Context, userID, notificationID string) error
	GetUnreadCount(ctx context.Context, userID string) (int, error)
	GetNotifications(ctx context.Context, userID string, options *QueryOptions) ([]Notification, error)
}

// Request/Response models for external services

// RivetWorkflowRequest represents a request to Rivet AI service
type RivetWorkflowRequest struct {
	Workflow   string                 `json:"workflow"`
	Parameters map[string]interface{} `json:"parameters"`
	Timeout    time.Duration          `json:"timeout,omitempty"`
	SessionID  string                 `json:"session_id,omitempty"`
}

// RivetWorkflowResponse represents a response from Rivet AI service
type RivetWorkflowResponse struct {
	Success  bool                   `json:"success"`
	Result   map[string]interface{} `json:"result,omitempty"`
	Error    string                 `json:"error,omitempty"`
	Type     string                 `json:"type,omitempty"` // for control-flow-excluded detection
	Metadata RivetMetadata          `json:"metadata"`
}

// RivetMetadata contains execution metadata from Rivet
type RivetMetadata struct {
	Duration  time.Duration `json:"duration"`
	Attempts  int           `json:"attempts"`
	Timestamp time.Time     `json:"timestamp"`
}

// RivetStatus represents the status of Rivet service
type RivetStatus struct {
	Online    bool      `json:"online"`
	Version   string    `json:"version,omitempty"`
	CheckedAt time.Time `json:"checked_at"`
}

// HTTPResponse represents a generic HTTP response
type HTTPResponse struct {
	StatusCode int                    `json:"status_code"`
	Headers    map[string]string      `json:"headers"`
	Body       map[string]interface{} `json:"body"`
	RawBody    []byte                 `json:"raw_body,omitempty"`
}

// Notification represents an in-app notification
type Notification struct {
	ID        string                 `json:"id"`
	UserID    string                 `json:"user_id"`
	Type      string                 `json:"type"`
	Title     string                 `json:"title"`
	Message   string                 `json:"message"`
	Data      map[string]interface{} `json:"data,omitempty"`
	Read      bool                   `json:"read"`
	CreatedAt time.Time              `json:"created_at"`
	ReadAt    *time.Time             `json:"read_at,omitempty"`
}

// Service configuration interfaces

// RivetConfig contains configuration for Rivet client
type RivetConfig struct {
	BaseURL       string        `json:"base_url"`
	Timeout       time.Duration `json:"timeout"`
	RetryAttempts int           `json:"retry_attempts"`
	RetryDelayMs  int           `json:"retry_delay_ms"`
	MaxRetryDelay time.Duration `json:"max_retry_delay"`
}

// EmailConfig contains configuration for email service
type EmailConfig struct {
	Provider  string            `json:"provider"` // smtp, sendgrid, etc.
	Host      string            `json:"host,omitempty"`
	Port      int               `json:"port,omitempty"`
	Username  string            `json:"username,omitempty"`
	Password  string            `json:"password,omitempty"`
	APIKey    string            `json:"api_key,omitempty"`
	FromEmail string            `json:"from_email"`
	FromName  string            `json:"from_name"`
	Templates map[string]string `json:"templates,omitempty"`
}

// HTTPConfig contains configuration for HTTP client
type HTTPConfig struct {
	Timeout        time.Duration `json:"timeout"`
	MaxRetries     int           `json:"max_retries"`
	RetryDelay     time.Duration `json:"retry_delay"`
	MaxConnections int           `json:"max_connections"`
	UserAgent      string        `json:"user_agent"`
}

// Factory interfaces for creating external service clients

// ExternalServiceFactory creates external service clients
type ExternalServiceFactory interface {
	CreateRivetClient(config RivetConfig) RivetClient
	CreateHTTPClient(config HTTPConfig) HTTPClient
	CreateEmailService(config EmailConfig) EmailService
	CreateNotificationService() NotificationService
}

// Circuit breaker interface for resilient external service calls
type CircuitBreaker interface {
	Execute(ctx context.Context, fn func() (interface{}, error)) (interface{}, error)
	State() string // open, half-open, closed
	Reset()
}

// Retry policy interface for configurable retry behavior
type RetryPolicy interface {
	ShouldRetry(attempt int, err error) bool
	GetDelay(attempt int) time.Duration
	MaxAttempts() int
}
