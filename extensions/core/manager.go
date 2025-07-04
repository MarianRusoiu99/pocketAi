package core

import (
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

// ExtensionManager handles registration and management of all extensions
type ExtensionManager struct {
	app        *pocketbase.PocketBase
	extensions []Extension
	enabled    bool
}

// Extension interface that all extensions must implement
type Extension interface {
	Name() string
	Version() string
	Priority() int
	Initialize(app *pocketbase.PocketBase) error
	Cleanup() error
}

// NewExtensionManager creates a new extension manager
func NewExtensionManager(app *pocketbase.PocketBase) *ExtensionManager {
	return &ExtensionManager{
		app:        app,
		extensions: make([]Extension, 0),
		enabled:    true,
	}
}

// Register adds an extension to the manager
func (em *ExtensionManager) Register(ext Extension) error {
	if !em.enabled {
		return nil
	}

	log.Printf("🔌 Registering extension: %s v%s", ext.Name(), ext.Version())
	
	// Initialize the extension
	if err := ext.Initialize(em.app); err != nil {
		log.Printf("❌ Failed to initialize extension %s: %v", ext.Name(), err)
		return err
	}
	
	em.extensions = append(em.extensions, ext)
	log.Printf("✅ Extension %s registered successfully", ext.Name())
	
	return nil
}

// GetExtensions returns all registered extensions
func (em *ExtensionManager) GetExtensions() []Extension {
	return em.extensions
}

// Disable disables the extension manager
func (em *ExtensionManager) Disable() {
	em.enabled = false
}

// Enable enables the extension manager
func (em *ExtensionManager) Enable() {
	em.enabled = true
}

// Shutdown cleanly shuts down all extensions
func (em *ExtensionManager) Shutdown() {
	log.Println("🔄 Shutting down extensions...")
	
	for _, ext := range em.extensions {
		if err := ext.Cleanup(); err != nil {
			log.Printf("⚠️  Error cleaning up extension %s: %v", ext.Name(), err)
		} else {
			log.Printf("✅ Extension %s cleaned up successfully", ext.Name())
		}
	}
	
	log.Println("🏁 All extensions shut down")
}

// BaseExtension provides a base implementation for extensions
type BaseExtension struct {
	name     string
	version  string
	priority int
}

// NewBaseExtension creates a new base extension
func NewBaseExtension(name, version string, priority int) *BaseExtension {
	return &BaseExtension{
		name:     name,
		version:  version,
		priority: priority,
	}
}

func (be *BaseExtension) Name() string {
	return be.name
}

func (be *BaseExtension) Version() string {
	return be.version
}

func (be *BaseExtension) Priority() int {
	return be.priority
}

// Default no-op implementations
func (be *BaseExtension) Initialize(app *pocketbase.PocketBase) error {
	return nil
}

func (be *BaseExtension) Cleanup() error {
	return nil
}
