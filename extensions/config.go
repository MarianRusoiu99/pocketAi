package extensions

import (
	"encoding/json"
	"fmt"
	"os"
)

// Config holds the complete extension configuration
type Config struct {
	Extensions ExtensionsConfig `json:"extensions"`
	CORS       CORSConfig       `json:"cors"`
	API        APIConfig        `json:"api"`
	Auth       AuthConfig       `json:"auth"`
	Logging    LoggingConfig    `json:"logging"`
	Features   FeaturesConfig   `json:"features"`
}

// ExtensionsConfig holds extension-specific configuration
type ExtensionsConfig struct {
	Enabled   bool     `json:"enabled"`
	AutoLoad  bool     `json:"autoLoad"`
	Disabled  []string `json:"disabled"`
	LoadOrder []string `json:"loadOrder"`
}

// CORSConfig holds CORS configuration
type CORSConfig struct {
	Enabled          bool     `json:"enabled"`
	AllowedOrigins   []string `json:"allowedOrigins"`
	AllowedMethods   []string `json:"allowedMethods"`
	AllowedHeaders   []string `json:"allowedHeaders"`
	AllowCredentials bool     `json:"allowCredentials"`
	MaxAge           int      `json:"maxAge"`
}

// APIConfig holds API configuration
type APIConfig struct {
	Prefix        string         `json:"prefix"`
	Version       string         `json:"version"`
	EnableSwagger bool           `json:"enableSwagger"`
	RateLimit     RateLimitConfig `json:"rateLimit"`
}

// RateLimitConfig holds rate limiting configuration
type RateLimitConfig struct {
	Enabled  bool   `json:"enabled"`
	Requests int    `json:"requests"`
	Window   string `json:"window"`
}

// AuthConfig holds authentication configuration
type AuthConfig struct {
	SessionTimeout           string   `json:"sessionTimeout"`
	PasswordMinLength        int      `json:"passwordMinLength"`
	RequireEmailVerification bool     `json:"requireEmailVerification"`
	AllowedProviders         []string `json:"allowedProviders"`
}

// LoggingConfig holds logging configuration
type LoggingConfig struct {
	Level                string   `json:"level"`
	Format               string   `json:"format"`
	EnableRequestLogging bool     `json:"enableRequestLogging"`
	SkipPaths            []string `json:"skipPaths"`
}

// FeaturesConfig holds feature flags
type FeaturesConfig struct {
	Realtime    bool `json:"realtime"`
	FileUploads bool `json:"fileUploads"`
	Analytics   bool `json:"analytics"`
	Webhooks    bool `json:"webhooks"`
}

// LoadConfig loads configuration from a JSON file
func LoadConfig(path string) (*Config, error) {
	if path == "" {
		return DefaultConfig(), nil
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %v", err)
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %v", err)
	}

	// Validate configuration
	if err := validateConfig(&config); err != nil {
		return nil, fmt.Errorf("invalid configuration: %v", err)
	}

	return &config, nil
}

// DefaultConfig returns the default configuration
func DefaultConfig() *Config {
	return &Config{
		Extensions: ExtensionsConfig{
			Enabled:   true,
			AutoLoad:  true,
			Disabled:  []string{},
			LoadOrder: []string{"core", "auth", "api"},
		},
		CORS: CORSConfig{
			Enabled:          true,
			AllowedOrigins:   []string{"http://localhost:5000", "http://localhost:3000"},
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
			AllowedHeaders:   []string{"Content-Type", "Authorization", "X-Requested-With"},
			AllowCredentials: true,
			MaxAge:           86400,
		},
		API: APIConfig{
			Prefix:        "/api/v1",
			Version:       "1.0.0",
			EnableSwagger: false,
			RateLimit: RateLimitConfig{
				Enabled:  false,
				Requests: 100,
				Window:   "1m",
			},
		},
		Auth: AuthConfig{
			SessionTimeout:           "24h",
			PasswordMinLength:        8,
			RequireEmailVerification: false,
			AllowedProviders:         []string{"email"},
		},
		Logging: LoggingConfig{
			Level:                "info",
			Format:               "json",
			EnableRequestLogging: true,
			SkipPaths:            []string{"/health", "/api/v1/health"},
		},
		Features: FeaturesConfig{
			Realtime:    true,
			FileUploads: true,
			Analytics:   false,
			Webhooks:    false,
		},
	}
}

// validateConfig validates the configuration
func validateConfig(config *Config) error {
	// Validate API prefix
	if config.API.Prefix == "" {
		return fmt.Errorf("API prefix cannot be empty")
	}

	// Validate CORS origins
	if config.CORS.Enabled && len(config.CORS.AllowedOrigins) == 0 {
		return fmt.Errorf("CORS enabled but no allowed origins specified")
	}

	// Validate auth password length
	if config.Auth.PasswordMinLength < 6 {
		return fmt.Errorf("password minimum length must be at least 6")
	}

	// Validate logging level
	validLevels := []string{"debug", "info", "warn", "error"}
	valid := false
	for _, level := range validLevels {
		if config.Logging.Level == level {
			valid = true
			break
		}
	}
	if !valid {
		return fmt.Errorf("invalid logging level: %s", config.Logging.Level)
	}

	return nil
}

// SaveConfig saves configuration to a JSON file
func SaveConfig(config *Config, path string) error {
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %v", err)
	}

	if err := os.WriteFile(path, data, 0644); err != nil {
		return fmt.Errorf("failed to write config file: %v", err)
	}

	return nil
}
