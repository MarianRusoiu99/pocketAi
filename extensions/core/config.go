package core

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
)

// Config holds the configuration for extensions
type Config struct {
	// Extension settings
	Extensions ExtensionConfig `json:"extensions"`
	
	// CORS settings
	CORS CORSConfig `json:"cors"`
	
	// Rate limiting settings
	RateLimit RateLimitConfig `json:"rateLimit"`
	
	// Logging settings
	Logging LoggingConfig `json:"logging"`
	
	// Custom API settings
	API APIConfig `json:"api"`
}

type ExtensionConfig struct {
	Enabled    bool     `json:"enabled"`
	AutoLoad   bool     `json:"autoLoad"`
	Disabled   []string `json:"disabled"`
	LoadOrder  []string `json:"loadOrder"`
}

type CORSConfig struct {
	Enabled         bool     `json:"enabled"`
	AllowedOrigins  []string `json:"allowedOrigins"`
	AllowedMethods  []string `json:"allowedMethods"`
	AllowedHeaders  []string `json:"allowedHeaders"`
	AllowCredentials bool    `json:"allowCredentials"`
}

type RateLimitConfig struct {
	Enabled     bool `json:"enabled"`
	RequestsPerMinute int  `json:"requestsPerMinute"`
	BurstSize   int  `json:"burstSize"`
}

type LoggingConfig struct {
	Level       string `json:"level"`
	Format      string `json:"format"`
	File        string `json:"file"`
	MaxSize     int    `json:"maxSize"`
	MaxBackups  int    `json:"maxBackups"`
	MaxAge      int    `json:"maxAge"`
}

type APIConfig struct {
	Prefix      string `json:"prefix"`
	Version     string `json:"version"`
	EnableSwagger bool `json:"enableSwagger"`
}

// DefaultConfig returns a default configuration
func DefaultConfig() *Config {
	return &Config{
		Extensions: ExtensionConfig{
			Enabled:   true,
			AutoLoad:  true,
			Disabled:  []string{},
			LoadOrder: []string{},
		},
		CORS: CORSConfig{
			Enabled:         true,
			AllowedOrigins:  []string{"*"},
			AllowedMethods:  []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
			AllowedHeaders:  []string{"Content-Type", "Authorization", "X-Requested-With"},
			AllowCredentials: false,
		},
		RateLimit: RateLimitConfig{
			Enabled:     false,
			RequestsPerMinute: 60,
			BurstSize:   10,
		},
		Logging: LoggingConfig{
			Level:      "info",
			Format:     "json",
			File:       "",
			MaxSize:    100,
			MaxBackups: 3,
			MaxAge:     28,
		},
		API: APIConfig{
			Prefix:      "/api/v1",
			Version:     "1.0.0",
			EnableSwagger: false,
		},
	}
}

// LoadConfig loads configuration from file or returns default
func LoadConfig(configPath string) (*Config, error) {
	// If no config file, return default
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		log.Printf("📝 No config file found at %s, using defaults", configPath)
		return DefaultConfig(), nil
	}
	
	// Read config file
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}
	
	// Parse JSON
	config := DefaultConfig()
	if err := json.Unmarshal(data, config); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}
	
	log.Printf("📖 Loaded configuration from %s", configPath)
	return config, nil
}

// SaveConfig saves configuration to file
func (c *Config) SaveConfig(configPath string) error {
	data, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}
	
	if err := os.WriteFile(configPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}
	
	log.Printf("💾 Configuration saved to %s", configPath)
	return nil
}
