package main

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/plugins/ghupdate"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	"pocket-app/internal/config"
	"pocket-app/internal/handlers"
	"pocket-app/internal/collections"
	"pocket-app/internal/services"
	"pocket-app/pkg/logger"
)

func main() {
	app := pocketbase.New()

	// Initialize configuration
	cfg := config.New()
	
	// Initialize logger
	logger.Init(cfg.LogLevel)
	logger.Info("🚀 Starting PocketBase Application")

	// Plugin flags
	var migrationsDir string
	app.RootCmd.PersistentFlags().StringVar(&migrationsDir, "migrationsDir", "./migrations", "the directory with the user defined migrations")
	var automigrate bool
	app.RootCmd.PersistentFlags().BoolVar(&automigrate, "automigrate", true, "enable/disable auto migrations")
	var publicDir string
	app.RootCmd.PersistentFlags().StringVar(&publicDir, "publicDir", defaultPublicDir(), "the directory to serve static files")
	var indexFallback bool
	app.RootCmd.PersistentFlags().BoolVar(&indexFallback, "indexFallback", true, "fallback the request to index.html on missing static path")
	app.RootCmd.ParseFlags(os.Args[1:])

	// Register plugins (removed jsvm since we're going Go-only)
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangGo,
		Automigrate:  automigrate,
		Dir:          migrationsDir,
	})
	ghupdate.MustRegister(app, app.RootCmd, ghupdate.Config{})

	// Initialize services
	servicesManager := services.New(app, cfg)
	
	// Initialize collections
	collectionsManager := collections.New(app, cfg)
	
	// Initialize handlers
	handlersManager := handlers.New(app, cfg, servicesManager)

	// Initialize components directly
	logger.Info("📦 Initializing collections...")
	if err := collectionsManager.Init(); err != nil {
		logger.Error("Failed to initialize collections", err)
		os.Exit(1)
	}

	logger.Info("🔧 Initializing services...")
	if err := servicesManager.Init(); err != nil {
		logger.Error("Failed to initialize services", err)
		os.Exit(1)
	}

	logger.Info("🛣️ Initializing handlers...")
	if err := handlersManager.Init(); err != nil {
		logger.Error("Failed to initialize handlers", err)
		os.Exit(1)
	}

	logger.Info("✅ Application initialized successfully")

	// Note: Static file serving can be configured via PocketBase's built-in settings
	// or through a reverse proxy. For now, we'll rely on PocketBase's default behavior.

	// Start the application
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

func defaultPublicDir() string {
	if strings.HasPrefix(os.Args[0], os.TempDir()) {
		return "./frontend/dist"
	}
	return filepath.Join(filepath.Dir(os.Args[0]), "frontend/dist")
}
