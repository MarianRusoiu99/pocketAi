package hooks

import (
	"log"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

// UserHooks handles user-related lifecycle events
type UserHooks struct {
	app *pocketbase.PocketBase
}

// NewUserHooks creates a new user hooks handler
func NewUserHooks(app *pocketbase.PocketBase) *UserHooks {
	return &UserHooks{app: app}
}

// RegisterHooks registers all user-related hooks
func (uh *UserHooks) RegisterHooks() {
	// User creation hooks
	uh.app.OnRecordCreate("users").BindFunc(uh.BeforeUserCreate)
	uh.app.OnRecordAfterCreateSuccess("users").BindFunc(uh.AfterUserCreate)
	
	// User update hooks
	uh.app.OnRecordUpdate("users").BindFunc(uh.BeforeUserUpdate)
	uh.app.OnRecordAfterUpdateSuccess("users").BindFunc(uh.AfterUserUpdate)
	
	// User delete hooks
	uh.app.OnRecordDelete("users").BindFunc(uh.BeforeUserDelete)
	uh.app.OnRecordAfterDeleteSuccess("users").BindFunc(uh.AfterUserDelete)
	
	// Auth hooks
	uh.app.OnRecordAuthWithPasswordRequest("users").BindFunc(uh.OnUserLogin)
	uh.app.OnRecordAuthRefreshRequest("users").BindFunc(uh.OnUserTokenRefresh)
}

// BeforeUserCreate is called before a user is created
func (uh *UserHooks) BeforeUserCreate(e *core.RecordEvent) error {
	log.Printf("🔨 Creating new user: %s", e.Record.GetString("email"))
	
	// Add creation timestamp
	e.Record.Set("created_at", time.Now().UTC().Format(time.RFC3339))
	
	// You could add additional validation, data enrichment, etc.
	
	return e.Next()
}

// AfterUserCreate is called after a user is successfully created
func (uh *UserHooks) AfterUserCreate(e *core.RecordEvent) error {
	email := e.Record.GetString("email")
	log.Printf("✅ User created successfully: %s (ID: %s)", email, e.Record.GetId())
	
	// You could:
	// - Send welcome email
	// - Create user profile
	// - Set up default settings
	// - Trigger external webhooks
	// - Create audit log
	
	uh.createUserProfile(e.Record)
	uh.sendWelcomeNotification(e.Record)
	
	return e.Next()
}

// BeforeUserUpdate is called before a user is updated
func (uh *UserHooks) BeforeUserUpdate(e *core.RecordEvent) error {
	log.Printf("📝 Updating user: %s", e.Record.GetString("email"))
	
	// Add update timestamp
	e.Record.Set("updated_at", time.Now().UTC().Format(time.RFC3339))
	
	// Track what fields are being changed
	if e.Record.GetString("email") != e.Record.OriginalCopy().GetString("email") {
		log.Printf("🔄 Email change detected for user %s", e.Record.GetId())
		// You could require email verification here
	}
	
	return e.Next()
}

// AfterUserUpdate is called after a user is successfully updated
func (uh *UserHooks) AfterUserUpdate(e *core.RecordEvent) error {
	log.Printf("✅ User updated successfully: %s", e.Record.GetString("email"))
	
	// You could:
	// - Sync with external services
	// - Update cached data
	// - Trigger notifications
	// - Create audit log
	
	return e.Next()
}

// BeforeUserDelete is called before a user is deleted
func (uh *UserHooks) BeforeUserDelete(e *core.RecordEvent) error {
	email := e.Record.GetString("email")
	log.Printf("🗑️ Deleting user: %s", email)
	
	// You could:
	// - Check for dependencies
	// - Archive data
	// - Send notifications
	
	return e.Next()
}

// AfterUserDelete is called after a user is successfully deleted
func (uh *UserHooks) AfterUserDelete(e *core.RecordEvent) error {
	email := e.Record.GetString("email")
	log.Printf("✅ User deleted successfully: %s", email)
	
	// You could:
	// - Clean up related data
	// - Notify external services
	// - Create audit log
	
	uh.cleanupUserData(e.Record)
	
	return e.Next()
}

// OnUserLogin is called when a user logs in
func (uh *UserHooks) OnUserLogin(e *core.RecordRequestEvent) error {
	email := e.Record.GetString("email")
	log.Printf("🔐 User login: %s from IP %s", email, e.RealIP())
	
	// Update last login timestamp
	e.Record.Set("last_login", time.Now().UTC().Format(time.RFC3339))
	e.Record.Set("last_ip", e.RealIP())
	
	// You could:
	// - Track login attempts
	// - Check for suspicious activity
	// - Update user activity
	
	return e.Next()
}

// OnUserTokenRefresh is called when a user refreshes their auth token
func (uh *UserHooks) OnUserTokenRefresh(e *core.RecordRequestEvent) error {
	log.Printf("🔄 Token refresh for user: %s", e.Record.GetString("email"))
	
	// You could:
	// - Track token usage
	// - Update activity timestamps
	// - Check for token abuse
	
	return e.Next()
}

// Helper methods

func (uh *UserHooks) createUserProfile(record *core.Record) {
	// Example: Create a user profile record
	log.Printf("👤 Creating profile for user: %s", record.GetId())
	// Implementation would go here
}

func (uh *UserHooks) sendWelcomeNotification(record *core.Record) {
	// Example: Send welcome email or notification
	log.Printf("📧 Sending welcome notification to: %s", record.GetString("email"))
	// Implementation would go here
}

func (uh *UserHooks) cleanupUserData(record *core.Record) {
	// Example: Clean up user-related data
	log.Printf("🧹 Cleaning up data for user: %s", record.GetId())
	// Implementation would go here
}
