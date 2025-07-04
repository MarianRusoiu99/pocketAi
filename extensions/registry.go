package extensions

import (
	"fmt"
	"log"

	"github.com/pocketbase/pocketbase"
)

// ExtensionRegistry manages all available extensions
type ExtensionRegistry struct {
	app        *pocketbase.PocketBase
	config     *Config
	extensions map[string]Extension
	loaded     []string
}

// Extension interface that all extensions must implement
type Extension interface {
	Name() string
	Version() string
	Priority() int
	Dependencies() []string
	Initialize(app *pocketbase.PocketBase, config *Config) error
	Cleanup() error
	Health() map[string]interface{}
}

// BaseExtension provides common functionality for all extensions
type BaseExtension struct {
	name         string
	version      string
	priority     int
	dependencies []string
	initialized  bool
}

// NewBaseExtension creates a new base extension
func NewBaseExtension(name, version string, priority int, deps ...string) *BaseExtension {
	return &BaseExtension{
		name:         name,
		version:      version,
		priority:     priority,
		dependencies: deps,
		initialized:  false,
	}
}

func (be *BaseExtension) Name() string        { return be.name }
func (be *BaseExtension) Version() string     { return be.version }
func (be *BaseExtension) Priority() int       { return be.priority }
func (be *BaseExtension) Dependencies() []string { return be.dependencies }

func (be *BaseExtension) Health() map[string]interface{} {
	return map[string]interface{}{
		"name":        be.name,
		"version":     be.version,
		"initialized": be.initialized,
		"status":      "healthy",
	}
}

func (be *BaseExtension) Cleanup() error {
	be.initialized = false
	return nil
}

// NewExtensionRegistry creates a new extension registry
func NewExtensionRegistry(app *pocketbase.PocketBase, configPath string) (*ExtensionRegistry, error) {
	config, err := LoadConfig(configPath)
	if err != nil {
		log.Printf("⚠️  Failed to load extension config, using defaults: %v", err)
		config = DefaultConfig()
	}

	return &ExtensionRegistry{
		app:        app,
		config:     config,
		extensions: make(map[string]Extension),
		loaded:     make([]string, 0),
	}, nil
}

// Register adds an extension to the registry
func (er *ExtensionRegistry) Register(ext Extension) error {
	if !er.config.Extensions.Enabled {
		log.Printf("⚠️  Extensions are disabled, skipping %s", ext.Name())
		return nil
	}

	// Check if extension is disabled
	for _, disabled := range er.config.Extensions.Disabled {
		if disabled == ext.Name() {
			log.Printf("⚠️  Extension %s is disabled", ext.Name())
			return nil
		}
	}

	log.Printf("🔌 Registering extension: %s v%s", ext.Name(), ext.Version())
	er.extensions[ext.Name()] = ext
	return nil
}

// Load initializes all registered extensions in the correct order
func (er *ExtensionRegistry) Load() error {
	if !er.config.Extensions.Enabled {
		log.Println("⚠️  Extensions are disabled")
		return nil
	}

	// Use load order if specified, otherwise load by priority
	if len(er.config.Extensions.LoadOrder) > 0 {
		return er.loadByOrder()
	}
	return er.loadByPriority()
}

// loadByOrder loads extensions in the specified order
func (er *ExtensionRegistry) loadByOrder() error {
	for _, name := range er.config.Extensions.LoadOrder {
		ext, exists := er.extensions[name]
		if !exists {
			log.Printf("⚠️  Extension %s not found in registry", name)
			continue
		}

		if err := er.loadExtension(ext); err != nil {
			return fmt.Errorf("failed to load extension %s: %v", name, err)
		}
	}

	// Load remaining extensions by priority
	return er.loadByPriority()
}

// loadByPriority loads extensions by their priority (lower = higher priority)
func (er *ExtensionRegistry) loadByPriority() error {
	// Create a sorted list by priority
	extensions := make([]Extension, 0)
	for _, ext := range er.extensions {
		// Skip already loaded extensions
		skip := false
		for _, loaded := range er.loaded {
			if loaded == ext.Name() {
				skip = true
				break
			}
		}
		if !skip {
			extensions = append(extensions, ext)
		}
	}

	// Simple sort by priority
	for i := 0; i < len(extensions); i++ {
		for j := i + 1; j < len(extensions); j++ {
			if extensions[i].Priority() > extensions[j].Priority() {
				extensions[i], extensions[j] = extensions[j], extensions[i]
			}
		}
	}

	// Load in order
	for _, ext := range extensions {
		if err := er.loadExtension(ext); err != nil {
			return fmt.Errorf("failed to load extension %s: %v", ext.Name(), err)
		}
	}

	return nil
}

// loadExtension loads a single extension with dependency checking
func (er *ExtensionRegistry) loadExtension(ext Extension) error {
	// Check dependencies
	for _, dep := range ext.Dependencies() {
		found := false
		for _, loaded := range er.loaded {
			if loaded == dep {
				found = true
				break
			}
		}
		if !found {
			// Try to load dependency first
			if depExt, exists := er.extensions[dep]; exists {
				if err := er.loadExtension(depExt); err != nil {
					return fmt.Errorf("failed to load dependency %s for %s: %v", dep, ext.Name(), err)
				}
			} else {
				return fmt.Errorf("dependency %s not found for extension %s", dep, ext.Name())
			}
		}
	}

	// Initialize the extension
	log.Printf("🚀 Loading extension: %s v%s", ext.Name(), ext.Version())
	if err := ext.Initialize(er.app, er.config); err != nil {
		return fmt.Errorf("failed to initialize extension %s: %v", ext.Name(), err)
	}

	er.loaded = append(er.loaded, ext.Name())
	log.Printf("✅ Extension %s loaded successfully", ext.Name())
	return nil
}

// GetExtension returns an extension by name
func (er *ExtensionRegistry) GetExtension(name string) (Extension, bool) {
	ext, exists := er.extensions[name]
	return ext, exists
}

// GetLoadedExtensions returns all loaded extension names
func (er *ExtensionRegistry) GetLoadedExtensions() []string {
	return er.loaded
}

// Health returns the health status of all extensions
func (er *ExtensionRegistry) Health() map[string]interface{} {
	health := make(map[string]interface{})
	health["enabled"] = er.config.Extensions.Enabled
	health["total"] = len(er.extensions)
	health["loaded"] = len(er.loaded)
	
	extensions := make(map[string]interface{})
	for name, ext := range er.extensions {
		extensions[name] = ext.Health()
	}
	health["extensions"] = extensions
	
	return health
}

// Shutdown cleanly shuts down all loaded extensions
func (er *ExtensionRegistry) Shutdown() error {
	log.Println("🔄 Shutting down extensions...")
	
	// Shutdown in reverse order
	for i := len(er.loaded) - 1; i >= 0; i-- {
		name := er.loaded[i]
		if ext, exists := er.extensions[name]; exists {
			log.Printf("🔄 Shutting down extension: %s", name)
			if err := ext.Cleanup(); err != nil {
				log.Printf("❌ Error shutting down extension %s: %v", name, err)
			}
		}
	}
	
	er.loaded = make([]string, 0)
	log.Println("✅ All extensions shut down")
	return nil
}

// ReloadConfig reloads the configuration
func (er *ExtensionRegistry) ReloadConfig(configPath string) error {
	config, err := LoadConfig(configPath)
	if err != nil {
		return err
	}
	er.config = config
	return nil
}

// Config returns the current configuration
func (er *ExtensionRegistry) Config() *Config {
	return er.config
}
