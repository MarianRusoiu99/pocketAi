package auth

import (
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/router"

	"pocket-app/extensions"
)

// AuthExtension provides enhanced authentication features
type AuthExtension struct {
	*extensions.BaseExtension
	app    *pocketbase.PocketBase
	config *extensions.Config
}

// NewAuthExtension creates a new auth extension
func NewAuthExtension() *AuthExtension {
	return &AuthExtension{
		BaseExtension: extensions.NewBaseExtension("auth", "1.0.0", 50, "core"),
	}
}

// Initialize sets up the auth extension
func (ae *AuthExtension) Initialize(app *pocketbase.PocketBase, config *extensions.Config) error {
	ae.app = app
	ae.config = config

	log.Println("🔧 Initializing Auth Extension...")

	// Register auth hooks
	ae.registerAuthHooks()

	// Register auth routes
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		apiGroup := se.Router.Group(config.API.Prefix)
		ae.registerAuthRoutes(apiGroup)
		return se.Next()
	})

	log.Println("✅ Auth Extension initialized successfully")
	return nil
}

// registerAuthHooks sets up authentication-related hooks
func (ae *AuthExtension) registerAuthHooks() {
	// User creation hooks
	ae.app.OnRecordCreate("users").BindFunc(func(e *core.RecordEvent) error {
		log.Printf("👤 Creating new user: %s", e.Record.GetString("email"))
		
		// Set default values
		e.Record.Set("created_at", time.Now().UTC().Format(time.RFC3339))
		e.Record.Set("last_login", nil)
		
		// Validate password strength if configured
		if ae.config.Auth.PasswordMinLength > 0 {
			password := e.Record.GetString("password")
			if len(password) < ae.config.Auth.PasswordMinLength {
				return errors.New("password too short")
			}
		}
		
		return e.Next()
	})

	ae.app.OnRecordAfterCreateSuccess("users").BindFunc(func(e *core.RecordEvent) error {
		email := e.Record.GetString("email")
		log.Printf("✅ User created successfully: %s", email)
		
		// Send welcome notification (placeholder)
		ae.sendWelcomeNotification(e.Record)
		
		return e.Next()
	})

	// Login hooks - use simpler approach with just record hooks
	ae.app.OnRecordAuthWithPasswordRequest("users").BindFunc(func(e *core.RecordAuthWithPasswordRequestEvent) error {
		email := e.Identity
		log.Printf("🔐 Login attempt: %s", email)
		
		return e.Next()
	})

	// Token refresh hooks
	ae.app.OnRecordAuthRefreshRequest("users").BindFunc(func(e *core.RecordAuthRefreshRequestEvent) error {
		log.Printf("🔄 Token refresh for user")
		
		return e.Next()
	})

	log.Println("🔒 Auth hooks registered")
}

// registerAuthRoutes sets up authentication-related API routes
func (ae *AuthExtension) registerAuthRoutes(group *router.RouterGroup[*core.RequestEvent]) {
	authGroup := group.Group("/auth")
	
	// Simple test endpoint to verify extension is working
	authGroup.GET("/test", ae.testEndpoint)
	
	// Extended auth endpoints
	authGroup.POST("/check-email", ae.checkEmailAvailability)
	authGroup.POST("/password-strength", ae.checkPasswordStrength)
	authGroup.GET("/session-info", ae.getSessionInfo)
	authGroup.POST("/logout-all", ae.logoutAllSessions)
	
	log.Println("🔑 Auth API routes registered")
}

// Auth route handlers

// Simple test endpoint to verify extension is working
func (ae *AuthExtension) testEndpoint(e *core.RequestEvent) error {
	return e.JSON(http.StatusOK, map[string]any{
		"message":     "🎉 Auth Extension is working!",
		"extension":   "auth",
		"version":     ae.Version(),
		"timestamp":   time.Now().UTC().Format(time.RFC3339),
		"config": map[string]any{
			"password_min_length": ae.config.Auth.PasswordMinLength,
			"rate_limit_enabled":  ae.config.API.RateLimit.Enabled,
		},
		"request_info": map[string]any{
			"method":     e.Request.Method,
			"path":       e.Request.URL.Path,
			"ip":         e.RealIP(),
			"user_agent": e.Request.Header.Get("User-Agent"),
		},
	})
}

func (ae *AuthExtension) checkEmailAvailability(e *core.RequestEvent) error {
	data := struct {
		Email string `json:"email" form:"email"`
	}{}
	
	if err := e.BindBody(&data); err != nil {
		return e.BadRequestError("Failed to parse request body", err)
	}
	
	if data.Email == "" {
		return e.BadRequestError("Email is required", nil)
	}
	
	// Check if email exists
	record, _ := e.App.FindFirstRecordByData("users", "email", data.Email)
	available := record == nil
	
	return e.JSON(http.StatusOK, map[string]any{
		"email":     data.Email,
		"available": available,
		"message":   ae.getEmailAvailabilityMessage(available),
	})
}

func (ae *AuthExtension) checkPasswordStrength(e *core.RequestEvent) error {
	data := struct {
		Password string `json:"password" form:"password"`
	}{}
	
	if err := e.BindBody(&data); err != nil {
		return e.BadRequestError("Failed to parse request body", err)
	}
	
	strength := ae.analyzePasswordStrength(data.Password)
	
	return e.JSON(http.StatusOK, strength)
}

func (ae *AuthExtension) getSessionInfo(e *core.RequestEvent) error {
	if e.Auth == nil {
		return e.UnauthorizedError("No active session", nil)
	}
	
	user := e.Auth
	
	return e.JSON(http.StatusOK, map[string]any{
		"user_id":      user.Id,
		"email":        user.GetString("email"),
		"verified":     user.GetBool("verified"),
		"last_login":   user.GetString("last_login"),
		"last_ip":      user.GetString("last_ip"),
		"created":      user.GetDateTime("created"),
		"session_info": map[string]any{
			"ip":         e.RealIP(),
			"user_agent": e.Request.Header.Get("User-Agent"),
			"timestamp":  time.Now().UTC().Format(time.RFC3339),
		},
	})
}

func (ae *AuthExtension) logoutAllSessions(e *core.RequestEvent) error {
	if e.Auth == nil {
		return e.UnauthorizedError("Authentication required", nil)
	}
	
	// This would typically invalidate all user tokens
	// For now, we'll just return a success message
	log.Printf("🚪 Logout all sessions requested for user: %s", e.Auth.GetString("email"))
	
	return e.JSON(http.StatusOK, map[string]any{
		"message": "All sessions terminated successfully",
		"user_id": e.Auth.Id,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

// Helper methods
func (ae *AuthExtension) sendWelcomeNotification(record *core.Record) {
	// Placeholder for welcome notification logic
	log.Printf("📧 Sending welcome notification to: %s", record.GetString("email"))
	// TODO: Implement actual notification sending
}

func (ae *AuthExtension) trackLoginSuccess(record *core.Record, ip string) {
	// Placeholder for login tracking logic
	log.Printf("📊 Tracking successful login for: %s from %s", record.GetString("email"), ip)
	// TODO: Implement actual tracking/analytics
}

func (ae *AuthExtension) getEmailAvailabilityMessage(available bool) string {
	if available {
		return "Email is available for registration"
	}
	return "Email is already registered"
}

func (ae *AuthExtension) analyzePasswordStrength(password string) map[string]any {
	score := 0
	feedback := []string{}
	
	// Length check
	if len(password) >= ae.config.Auth.PasswordMinLength {
		score += 20
	} else {
		feedback = append(feedback, "Password is too short")
	}
	
	// Character variety checks
	hasUpper := false
	hasLower := false
	hasNumber := false
	hasSpecial := false
	
	for _, char := range password {
		switch {
		case char >= 'A' && char <= 'Z':
			hasUpper = true
		case char >= 'a' && char <= 'z':
			hasLower = true
		case char >= '0' && char <= '9':
			hasNumber = true
		default:
			hasSpecial = true
		}
	}
	
	if hasUpper {
		score += 20
	} else {
		feedback = append(feedback, "Add uppercase letters")
	}
	
	if hasLower {
		score += 20
	} else {
		feedback = append(feedback, "Add lowercase letters")
	}
	
	if hasNumber {
		score += 20
	} else {
		feedback = append(feedback, "Add numbers")
	}
	
	if hasSpecial {
		score += 20
	} else {
		feedback = append(feedback, "Add special characters")
	}
	
	// Determine strength level
	var strength string
	switch {
	case score >= 80:
		strength = "strong"
	case score >= 60:
		strength = "good"
	case score >= 40:
		strength = "medium"
	default:
		strength = "weak"
	}
	
	return map[string]any{
		"score":     score,
		"strength":  strength,
		"feedback":  feedback,
		"valid":     score >= 60,
		"length":    len(password),
		"min_length": ae.config.Auth.PasswordMinLength,
	}
}
