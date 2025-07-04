package core

import (
	"log"
	"net/http"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/router"

	"pocket-app/extensions"
	"pocket-app/extensions/middleware"
)

// CoreExtension provides essential functionality and middleware
type CoreExtension struct {
	*extensions.BaseExtension
	app    *pocketbase.PocketBase
	config *extensions.Config
}

// NewCoreExtension creates a new core extension
func NewCoreExtension() *CoreExtension {
	return &CoreExtension{
		BaseExtension: extensions.NewBaseExtension("core", "1.0.0", 0),
	}
}

// Initialize sets up the core extension
func (ce *CoreExtension) Initialize(app *pocketbase.PocketBase, config *extensions.Config) error {
	ce.app = app
	ce.config = config

	log.Println("🔧 Initializing Core Extension...")

	// Setup routing and middleware
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// Create API group
		apiGroup := se.Router.Group(config.API.Prefix)

		// Add global middleware
		ce.setupMiddleware(apiGroup)

		// Register core API endpoints
		ce.registerCoreRoutes(apiGroup)

		return se.Next()
	})

	// Setup graceful shutdown
	app.OnTerminate().BindFunc(func(e *core.TerminateEvent) error {
		log.Println("🔄 Core extension shutting down...")
		return e.Next()
	})

	log.Println("✅ Core Extension initialized successfully")
	return nil
}

// setupMiddleware configures all middleware
func (ce *CoreExtension) setupMiddleware(group *router.RouterGroup[*core.RequestEvent]) {
	// CORS middleware
	if ce.config.CORS.Enabled {
		corsMiddleware := middleware.NewCORSMiddleware(
			ce.config.CORS.AllowedOrigins,
			ce.config.CORS.AllowedMethods,
			ce.config.CORS.AllowedHeaders,
			ce.config.CORS.AllowCredentials,
			ce.config.CORS.MaxAge,
		)
		group.BindFunc(corsMiddleware.Handler())
		log.Println("🌐 CORS middleware enabled")
	}

	// Request logging middleware
	if ce.config.Logging.EnableRequestLogging {
		loggingMiddleware := middleware.NewLoggingMiddleware(ce.config.Logging.SkipPaths...)
		group.BindFunc(loggingMiddleware.Handler())
		log.Println("📝 Request logging middleware enabled")
	}

	// Security headers middleware
	securityMiddleware := middleware.NewSecurityMiddleware()
	group.BindFunc(securityMiddleware.Handler())
	log.Println("🔒 Security middleware enabled")

	// Rate limiting middleware (if enabled)
	if ce.config.API.RateLimit.Enabled {
		rateLimitMiddleware := middleware.NewRateLimitMiddleware(
			ce.config.API.RateLimit.Requests,
			ce.config.API.RateLimit.Window,
		)
		group.BindFunc(rateLimitMiddleware.Handler())
		log.Printf("⏱️  Rate limiting enabled: %d requests per %s", 
			ce.config.API.RateLimit.Requests, ce.config.API.RateLimit.Window)
	}

	// Request validation middleware
	validationMiddleware := middleware.NewValidationMiddleware()
	group.BindFunc(validationMiddleware.Handler())
	log.Println("✅ Request validation middleware enabled")
}

// registerCoreRoutes registers essential API routes
func (ce *CoreExtension) registerCoreRoutes(group *router.RouterGroup[*core.RequestEvent]) {
	// Health check endpoints
	group.GET("/health", ce.healthCheck)
	group.GET("/health/live", ce.livenessCheck)
	group.GET("/health/ready", ce.readinessCheck)

	// System info endpoints
	group.GET("/info", ce.systemInfo)
	group.GET("/version", ce.versionInfo)

	log.Println("🏥 Core API routes registered")
}

// Health check handlers
func (ce *CoreExtension) healthCheck(e *core.RequestEvent) error {
	return e.JSON(http.StatusOK, map[string]any{
		"status":    "healthy",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"version":   ce.config.API.Version,
		"service":   "pocketbase-app",
	})
}

func (ce *CoreExtension) livenessCheck(e *core.RequestEvent) error {
	return e.JSON(http.StatusOK, map[string]any{
		"status":    "alive",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

func (ce *CoreExtension) readinessCheck(e *core.RequestEvent) error {
	// For now, just return ready - can add more sophisticated checks later
	return e.JSON(http.StatusOK, map[string]any{
		"status":    "ready",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"checks": map[string]string{
			"database": "ok",
		},
	})
}

func (ce *CoreExtension) systemInfo(e *core.RequestEvent) error {
	return e.JSON(http.StatusOK, map[string]any{
		"name":       "PocketBase Extension System",
		"version":    ce.config.API.Version,
		"go_version": "1.23+",
		"features": map[string]bool{
			"realtime":    ce.config.Features.Realtime,
			"fileUploads": ce.config.Features.FileUploads,
			"analytics":   ce.config.Features.Analytics,
			"webhooks":    ce.config.Features.Webhooks,
		},
		"cors_enabled":     ce.config.CORS.Enabled,
		"rate_limit":       ce.config.API.RateLimit.Enabled,
		"request_logging":  ce.config.Logging.EnableRequestLogging,
	})
}

func (ce *CoreExtension) versionInfo(e *core.RequestEvent) error {
	return e.JSON(http.StatusOK, map[string]any{
		"api_version":   ce.config.API.Version,
		"extension":     ce.Version(),
		"build_time":    time.Now().UTC().Format(time.RFC3339),
	})
}

// Health returns the health status of the core extension
func (ce *CoreExtension) Health() map[string]interface{} {
	health := ce.BaseExtension.Health()
	health["database_connected"] = ce.isDatabaseConnected()
	health["middleware_count"] = ce.getMiddlewareCount()
	return health
}

func (ce *CoreExtension) isDatabaseConnected() bool {
	if ce.app == nil {
		return false
	}
	// For now, just return true - database connection is managed by PocketBase
	return true
}

func (ce *CoreExtension) getMiddlewareCount() int {
	count := 2 // security and validation always enabled
	if ce.config.CORS.Enabled {
		count++
	}
	if ce.config.Logging.EnableRequestLogging {
		count++
	}
	if ce.config.API.RateLimit.Enabled {
		count++
	}
	return count
}
