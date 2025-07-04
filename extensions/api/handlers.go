package api

import (
	"net/http"
	"time"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/router"
)

// HealthHandler provides health check endpoints
type HealthHandler struct{}

// NewHealthHandler creates a new health handler
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// RegisterRoutes registers health check routes
func (h *HealthHandler) RegisterRoutes(group *router.RouterGroup) {
	group.GET("/health", h.Health)
	group.GET("/health/live", h.Liveness)
	group.GET("/health/ready", h.Readiness)
}

// Health returns basic health status
func (h *HealthHandler) Health(e *core.RequestEvent) error {
	return e.JSON(http.StatusOK, map[string]any{
		"status":    "healthy",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"version":   "1.0.0",
		"service":   "pocketbase-app",
	})
}

// Liveness checks if the application is alive
func (h *HealthHandler) Liveness(e *core.RequestEvent) error {
	return e.JSON(http.StatusOK, map[string]any{
		"status": "alive",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

// Readiness checks if the application is ready to serve requests
func (h *HealthHandler) Readiness(e *core.RequestEvent) error {
	// Check database connectivity
	if err := e.App.DB().Ping(); err != nil {
		return e.JSON(http.StatusServiceUnavailable, map[string]any{
			"status": "not ready",
			"error":  "database not available",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	}
	
	return e.JSON(http.StatusOK, map[string]any{
		"status": "ready",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"checks": map[string]string{
			"database": "ok",
		},
	})
}

// HelloHandler provides example endpoints
type HelloHandler struct{}

// NewHelloHandler creates a new hello handler
func NewHelloHandler() *HelloHandler {
	return &HelloHandler{}
}

// RegisterRoutes registers hello routes
func (h *HelloHandler) RegisterRoutes(group *router.RouterGroup) {
	group.GET("/hello", h.Hello)
	group.GET("/hello/{name}", h.HelloName)
	group.POST("/hello", h.HelloPost)
}

// Hello returns a simple greeting
func (h *HelloHandler) Hello(e *core.RequestEvent) error {
	return e.JSON(http.StatusOK, map[string]any{
		"message":   "Hello from PocketBase Go Extensions!",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"user":      getUserInfo(e),
	})
}

// HelloName returns a personalized greeting
func (h *HelloHandler) HelloName(e *core.RequestEvent) error {
	name := e.Request.PathValue("name")
	
	// Basic validation
	if name == "" {
		return e.BadRequestError("Name parameter is required", nil)
	}
	
	// Basic sanitization
	if len(name) > 50 {
		return e.BadRequestError("Name too long", nil)
	}
	
	return e.JSON(http.StatusOK, map[string]any{
		"message":   "Hello " + name + "!",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"user":      getUserInfo(e),
	})
}

// HelloPost handles POST requests to hello endpoint
func (h *HelloHandler) HelloPost(e *core.RequestEvent) error {
	data := struct {
		Name    string `json:"name" form:"name"`
		Message string `json:"message" form:"message"`
	}{}
	
	if err := e.BindBody(&data); err != nil {
		return e.BadRequestError("Failed to parse request body", err)
	}
	
	if data.Name == "" {
		return e.BadRequestError("Name is required", nil)
	}
	
	response := map[string]any{
		"greeting":  "Hello " + data.Name + "!",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"user":      getUserInfo(e),
	}
	
	if data.Message != "" {
		response["echo"] = data.Message
	}
	
	return e.JSON(http.StatusOK, response)
}

// getUserInfo extracts user information from the request
func getUserInfo(e *core.RequestEvent) map[string]any {
	if e.Auth == nil {
		return map[string]any{
			"type":         "guest",
			"authenticated": false,
		}
	}
	
	return map[string]any{
		"type":         "authenticated",
		"authenticated": true,
		"id":           e.Auth.GetId(),
		"email":        e.Auth.GetString("email"),
	}
}
