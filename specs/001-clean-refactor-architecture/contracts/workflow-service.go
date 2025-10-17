package contracts

import (
	"context"
	"time"
)

// WorkflowService defines the contract for executing AI workflows
// Implements: SRP (single workflow execution responsibility)
// Supports: OCP (extensible to new workflow types)
type WorkflowService interface {
	Execute(ctx context.Context, request WorkflowRequest) (*WorkflowResponse, error)
	GetStatus(ctx context.Context, sessionID string) (*WorkflowStatus, error)
	Cancel(ctx context.Context, sessionID string) error
}

// StoryGenerationService extends WorkflowService for story-specific operations
// Implements: ISP (clients only depend on story generation methods)
type StoryGenerationService interface {
	WorkflowService
	GenerateStory(ctx context.Context, request StoryRequest) (*StoryResponse, error)
	ValidateStoryRequest(request StoryRequest) ValidationResult
}

// WorkflowFactory creates workflow services based on type
// Implements: OCP (extensible to new workflow types without modification)
type WorkflowFactory interface {
	CreateWorkflow(workflowType string) (WorkflowService, error)
	RegisterWorkflow(workflowType string, factory func() WorkflowService)
	SupportedTypes() []string
}

// WorkflowRequest represents a generic workflow execution request
type WorkflowRequest struct {
	Type       string                 `json:"type"`
	SessionID  string                 `json:"session_id,omitempty"`
	UserID     string                 `json:"user_id,omitempty"`
	Parameters map[string]interface{} `json:"parameters"`
	Timeout    time.Duration          `json:"timeout,omitempty"`
}

// WorkflowResponse represents the result of workflow execution
type WorkflowResponse struct {
	Success   bool                   `json:"success"`
	SessionID string                 `json:"session_id"`
	Data      map[string]interface{} `json:"data,omitempty"`
	Error     *WorkflowError         `json:"error,omitempty"`
	Metadata  WorkflowMetadata       `json:"metadata"`
}

// WorkflowStatus represents the current state of a workflow execution
type WorkflowStatus struct {
	SessionID   string    `json:"session_id"`
	Status      string    `json:"status"` // pending, running, completed, failed, cancelled
	Progress    float64   `json:"progress,omitempty"`
	Message     string    `json:"message,omitempty"`
	StartedAt   time.Time `json:"started_at"`
	CompletedAt time.Time `json:"completed_at,omitempty"`
}

// WorkflowError represents an error that occurred during workflow execution
type WorkflowError struct {
	Code      string                 `json:"code"`
	Message   string                 `json:"message"`
	Retryable bool                   `json:"retryable"`
	Context   map[string]interface{} `json:"context,omitempty"`
}

// WorkflowMetadata contains execution metadata
type WorkflowMetadata struct {
	Duration     time.Duration `json:"duration"`
	Attempts     int           `json:"attempts"`
	Timestamp    time.Time     `json:"timestamp"`
	WorkflowType string        `json:"workflow_type"`
}

// StoryRequest represents parameters for story generation
type StoryRequest struct {
	NChapters           int    `json:"n_chapters" validate:"required,min=1,max=20"`
	StoryInstructions   string `json:"story_instructions" validate:"required,min=10,max=1000"`
	PrimaryCharacters   string `json:"primary_characters" validate:"required,min=2,max=500"`
	SecondaryCharacters string `json:"secondary_characters" validate:"max=500"`
	LChapter            int    `json:"l_chapter" validate:"required,min=100,max=5000"`
}

// StoryResponse represents the result of story generation
type StoryResponse struct {
	Message   string `json:"message"`
	Status    string `json:"status"`
	Story     *Story `json:"story,omitempty"`
	StoryText string `json:"story_text,omitempty"`
	Attempts  int    `json:"attempts"`
	SessionID string `json:"session_id,omitempty"`
}

// Story represents a generated story
type Story struct {
	ID       string        `json:"id"`
	Title    string        `json:"title"`
	Chapters []Chapter     `json:"chapters"`
	Metadata StoryMetadata `json:"metadata"`
	Status   string        `json:"status"`
}

// Chapter represents a single chapter in a story
type Chapter struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Content   string `json:"content"`
	Order     int    `json:"order"`
	WordCount int    `json:"word_count"`
}

// StoryMetadata contains story metadata
type StoryMetadata struct {
	PrimaryCharacters    []string `json:"primary_characters"`
	SecondaryCharacters  []string `json:"secondary_characters"`
	Genre                string   `json:"genre,omitempty"`
	Theme                string   `json:"theme,omitempty"`
	EstimatedReadingTime int      `json:"estimated_reading_time"`
}

// ValidationResult represents the result of request validation
type ValidationResult struct {
	Valid  bool              `json:"valid"`
	Errors []ValidationError `json:"errors,omitempty"`
}

// ValidationError represents a single validation error
type ValidationError struct {
	Field   string `json:"field"`
	Code    string `json:"code"`
	Message string `json:"message"`
}
