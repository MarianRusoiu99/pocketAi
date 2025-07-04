package api

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/router"

	"pocket-app/extensions"
)

// APIExtension provides additional API endpoints
type APIExtension struct {
	*extensions.BaseExtension
	app    *pocketbase.PocketBase
	config *extensions.Config
}

// NewAPIExtension creates a new API extension
func NewAPIExtension() *APIExtension {
	return &APIExtension{
		BaseExtension: extensions.NewBaseExtension("api", "1.0.0", 100, "core"),
	}
}

// Initialize sets up the API extension
func (ae *APIExtension) Initialize(app *pocketbase.PocketBase, config *extensions.Config) error {
	ae.app = app
	ae.config = config

	log.Println("🔧 Initializing API Extension...")

	// Register API routes
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		apiGroup := se.Router.Group(config.API.Prefix)
		
		// Example endpoints
		ae.registerExampleRoutes(apiGroup)
		
		// Utility endpoints
		ae.registerUtilityRoutes(apiGroup)

		return se.Next()
	})

	log.Println("✅ API Extension initialized successfully")
	return nil
}

// registerExampleRoutes registers example API endpoints
func (ae *APIExtension) registerExampleRoutes(group *router.RouterGroup[*core.RequestEvent]) {
	exampleGroup := group.Group("/examples")
	
	// Hello endpoints
	exampleGroup.GET("/hello", ae.hello)
	exampleGroup.GET("/hello/{name}", ae.helloName)
	exampleGroup.POST("/hello", ae.helloPost)
	
	// Echo endpoint
	exampleGroup.POST("/echo", ae.echo)
	
	log.Println("📝 Example API routes registered")
}

// registerUtilityRoutes registers utility API endpoints
func (ae *APIExtension) registerUtilityRoutes(group *router.RouterGroup[*core.RequestEvent]) {
	utilGroup := group.Group("/utils")
	
	// Time utilities
	utilGroup.GET("/time", ae.currentTime)
	utilGroup.GET("/time/unix", ae.unixTime)
	
	// Validation utilities
	utilGroup.POST("/validate/email", ae.validateEmail)
	utilGroup.POST("/validate/password", ae.validatePassword)
	
	// User info (authenticated)
	utilGroup.GET("/user/info", ae.userInfo).Bind(apis.RequireAuth())
	
	log.Println("🛠️  Utility API routes registered")
}

// Example handlers
func (ae *APIExtension) hello(e *core.RequestEvent) error {
	return e.JSON(http.StatusOK, map[string]any{
		"message":   "Hello from PocketBase API Extension!",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"version":   ae.config.API.Version,
	})
}

func (ae *APIExtension) helloName(e *core.RequestEvent) error {
	name := e.Request.PathValue("name")
	if name == "" {
		return e.BadRequestError("Name parameter is required", nil)
	}
	
	// Basic sanitization
	name = sanitizeInput(name)
	
	return e.JSON(http.StatusOK, map[string]any{
		"message":   "Hello " + name + "!",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"user":      getUserInfo(e),
	})
}

func (ae *APIExtension) helloPost(e *core.RequestEvent) error {
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
		"greeting":  "Hello " + sanitizeInput(data.Name) + "!",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"user":      getUserInfo(e),
	}
	
	if data.Message != "" {
		response["echo"] = sanitizeInput(data.Message)
	}
	
	return e.JSON(http.StatusOK, response)
}

func (ae *APIExtension) echo(e *core.RequestEvent) error {
	data := struct {
		Message string `json:"message" form:"message"`
	}{}
	
	if err := e.BindBody(&data); err != nil {
		return e.BadRequestError("Failed to parse request body", err)
	}
	
	return e.JSON(http.StatusOK, map[string]any{
		"original": data.Message,
		"echo":     data.Message,
		"length":   len(data.Message),
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

// Utility handlers
func (ae *APIExtension) currentTime(e *core.RequestEvent) error {
	now := time.Now().UTC()
	
	return e.JSON(http.StatusOK, map[string]any{
		"iso":       now.Format(time.RFC3339),
		"rfc822":    now.Format(time.RFC822),
		"unix":      now.Unix(),
		"timestamp": now.UnixMilli(),
		"timezone":  "UTC",
	})
}

func (ae *APIExtension) unixTime(e *core.RequestEvent) error {
	return e.JSON(http.StatusOK, map[string]any{
		"unix": time.Now().Unix(),
	})
}

func (ae *APIExtension) validateEmail(e *core.RequestEvent) error {
	data := struct {
		Email string `json:"email" form:"email"`
	}{}
	
	if err := e.BindBody(&data); err != nil {
		return e.BadRequestError("Failed to parse request body", err)
	}
	
	isValid := isValidEmail(data.Email)
	
	return e.JSON(http.StatusOK, map[string]any{
		"email":   data.Email,
		"valid":   isValid,
		"message": getEmailValidationMessage(data.Email, isValid),
	})
}

func (ae *APIExtension) validatePassword(e *core.RequestEvent) error {
	data := struct {
		Password string `json:"password" form:"password"`
	}{}
	
	if err := e.BindBody(&data); err != nil {
		return e.BadRequestError("Failed to parse request body", err)
	}
	
	validation := validatePassword(data.Password, ae.config.Auth.PasswordMinLength)
	
	return e.JSON(http.StatusOK, validation)
}

func (ae *APIExtension) userInfo(e *core.RequestEvent) error {
	if e.Auth == nil {
		return e.UnauthorizedError("Authentication required", nil)
	}
	
	user := e.Auth
	
	return e.JSON(http.StatusOK, map[string]any{
		"id":       user.Id,
		"email":    user.GetString("email"),
		"verified": user.GetBool("verified"),
		"created":  user.GetDateTime("created"),
		"updated":  user.GetDateTime("updated"),
		"type":     "authenticated",
	})
}

// Helper functions
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
		"id":           e.Auth.Id,
		"email":        e.Auth.GetString("email"),
	}
}

func sanitizeInput(input string) string {
	// Basic XSS protection
	input = strings.ReplaceAll(input, "<", "&lt;")
	input = strings.ReplaceAll(input, ">", "&gt;")
	input = strings.ReplaceAll(input, "\"", "&quot;")
	input = strings.ReplaceAll(input, "'", "&#x27;")
	return strings.TrimSpace(input)
}

func isValidEmail(email string) bool {
	// Basic email validation (you might want to use a proper library)
	return strings.Contains(email, "@") && 
		   strings.Contains(email, ".") && 
		   len(email) > 5 && 
		   !strings.HasPrefix(email, "@") && 
		   !strings.HasSuffix(email, "@")
}

func getEmailValidationMessage(email string, isValid bool) string {
	if isValid {
		return "Email format is valid"
	}
	
	if email == "" {
		return "Email is required"
	}
	if !strings.Contains(email, "@") {
		return "Email must contain @ symbol"
	}
	if !strings.Contains(email, ".") {
		return "Email must contain a domain"
	}
	if len(email) < 6 {
		return "Email is too short"
	}
	
	return "Email format is invalid"
}

func validatePassword(password string, minLength int) map[string]any {
	result := map[string]any{
		"valid":      true,
		"issues":     []string{},
		"strength":   "strong",
		"minLength":  minLength,
		"length":     len(password),
	}
	
	issues := []string{}
	
	if len(password) < minLength {
		issues = append(issues, fmt.Sprintf("Password must be at least %d characters", minLength))
	}
	
	if !hasUpperCase(password) {
		issues = append(issues, "Password should contain uppercase letters")
	}
	
	if !hasLowerCase(password) {
		issues = append(issues, "Password should contain lowercase letters")
	}
	
	if !hasNumbers(password) {
		issues = append(issues, "Password should contain numbers")
	}
	
	if !hasSpecialChars(password) {
		issues = append(issues, "Password should contain special characters")
	}
	
	if len(issues) > 0 {
		result["valid"] = false
		result["issues"] = issues
		
		if len(issues) > 3 {
			result["strength"] = "weak"
		} else if len(issues) > 1 {
			result["strength"] = "medium"
		} else {
			result["strength"] = "good"
		}
	}
	
	return result
}

func hasUpperCase(s string) bool {
	for _, r := range s {
		if r >= 'A' && r <= 'Z' {
			return true
		}
	}
	return false
}

func hasLowerCase(s string) bool {
	for _, r := range s {
		if r >= 'a' && r <= 'z' {
			return true
		}
	}
	return false
}

func hasNumbers(s string) bool {
	for _, r := range s {
		if r >= '0' && r <= '9' {
			return true
		}
	}
	return false
}

func hasSpecialChars(s string) bool {
	specialChars := "!@#$%^&*()_+-=[]{}|;:,.<>?"
	for _, r := range s {
		for _, sc := range specialChars {
			if r == sc {
				return true
			}
		}
	}
	return false
}
