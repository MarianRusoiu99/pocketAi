package main

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/ghupdate"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	"pocket-app/extensions"
	coreExt "pocket-app/extensions/modules/core"
	apiExt "pocket-app/extensions/modules/api"
	authExt "pocket-app/extensions/modules/auth"
)

func main() {
	app := pocketbase.New()

	// Plugin flags
	var hooksDir string
	app.RootCmd.PersistentFlags().StringVar(&hooksDir, "hooksDir", "./pb_hooks", "the directory with the JS app hooks")
	var hooksWatch bool
	app.RootCmd.PersistentFlags().BoolVar(&hooksWatch, "hooksWatch", false, "auto restart the app on pb_hooks file change; disabled by default for Go extensions")
	var hooksPool int
	app.RootCmd.PersistentFlags().IntVar(&hooksPool, "hooksPool", 5, "the total prewarm goja.Runtime instances for the JS app hooks execution")
	var migrationsDir string
	app.RootCmd.PersistentFlags().StringVar(&migrationsDir, "migrationsDir", "./pb_migrations", "the directory with the user defined migrations")
	var automigrate bool
	app.RootCmd.PersistentFlags().BoolVar(&automigrate, "automigrate", true, "enable/disable auto migrations")
	var publicDir string
	app.RootCmd.PersistentFlags().StringVar(&publicDir, "publicDir", defaultPublicDir(), "the directory to serve static files")
	var indexFallback bool
	app.RootCmd.PersistentFlags().BoolVar(&indexFallback, "indexFallback", true, "fallback the request to index.html on missing static path, e.g. when pretty urls are used with SPA")
	
	// Extension config flag
	var configPath string
	app.RootCmd.PersistentFlags().StringVar(&configPath, "extensionConfig", "./extensions.json", "the path to the extensions configuration file")
	
	// Disable JS hooks flag
	var disableJsHooks bool
	app.RootCmd.PersistentFlags().BoolVar(&disableJsHooks, "disableJsHooks", false, "disable JavaScript hooks completely")
	
	app.RootCmd.ParseFlags(os.Args[1:])

	// Initialize extension registry
	registry, err := extensions.NewExtensionRegistry(app, configPath)
	if err != nil {
		log.Printf("❌ Failed to create extension registry: %v", err)
		log.Fatal("Cannot continue without extension registry")
	}

	// Register all extensions
	setupGoExtensions(registry)

	// Load all extensions
	if err := registry.Load(); err != nil {
		log.Printf("❌ Failed to load extensions: %v", err)
		log.Fatal("Cannot continue with extension loading failure")
	}

	// Optional: Keep JS plugins for backward compatibility
	if !disableJsHooks {
		log.Println("🔄 Enabling JavaScript hooks for backward compatibility...")
		jsvm.MustRegister(app, jsvm.Config{
			MigrationsDir: migrationsDir,
			HooksDir:      hooksDir,
			HooksWatch:    hooksWatch,
			HooksPoolSize: hooksPool,
		})
	} else {
		log.Println("⚠️  JavaScript hooks are disabled")
	}
	
	// Register migration commands
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangJS,
		Automigrate:  automigrate,
		Dir:          migrationsDir,
	})
	
	// Register GitHub update plugin
	ghupdate.MustRegister(app, app.RootCmd, ghupdate.Config{})

	// Serve static files
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/*", func(e *core.RequestEvent) error {
			// Skip API routes
			if strings.HasPrefix(e.Request.URL.Path, "/api") || strings.HasPrefix(e.Request.URL.Path, "/_") {
				return e.Next()
			}
			
			// Serve static files (simplified for now)
			// TODO: Implement proper static file serving
			return e.NoContent(404)
		})
		
		return se.Next()
	})

	// Setup graceful shutdown
	app.OnTerminate().BindFunc(func(e *core.TerminateEvent) error {
		log.Println("🔄 Shutting down extensions...")
		registry.Shutdown()
		return e.Next()
	})

	// Add extension health endpoint
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/api/extensions/health", func(e *core.RequestEvent) error {
			health := registry.Health()
			return e.JSON(200, health)
		})
		return se.Next()
	})

	log.Println("🚀 Starting PocketBase with Go Extensions...")
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

// setupGoExtensions registers all available extensions
func setupGoExtensions(registry *extensions.ExtensionRegistry) {
	log.Println("� Registering Go extensions...")

	// Core Extension - essential functionality
	coreExtension := coreExt.NewCoreExtension()
	if err := registry.Register(coreExtension); err != nil {
		log.Printf("❌ Failed to register core extension: %v", err)
	}

	// Auth Extension - enhanced authentication
	authExtension := authExt.NewAuthExtension()
	if err := registry.Register(authExtension); err != nil {
		log.Printf("❌ Failed to register auth extension: %v", err)
	}

	// API Extension - additional API endpoints
	apiExtension := apiExt.NewAPIExtension()
	if err := registry.Register(apiExtension); err != nil {
		log.Printf("❌ Failed to register API extension: %v", err)
	}

	log.Println("✅ All extensions registered successfully")
}

func defaultPublicDir() string {
	if strings.HasPrefix(os.Args[0], os.TempDir()) {
		return "./client/dist"
	}
	return filepath.Join(filepath.Dir(os.Args[0]), "client/dist")
}
