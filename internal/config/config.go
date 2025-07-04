package config

import (
	"os"
	"strconv"
)

// Config holds all configuration for the application
type Config struct {
	Environment string
	LogLevel    string
	AppName     string
	AppVersion  string
	APIPrefix   string
	Database    DatabaseConfig
	Auth        AuthConfig
	Features    Features
}

// DatabaseConfig holds database-related configuration
type DatabaseConfig struct {
	EnableMigrations bool
	EnableBackups    bool
	BackupInterval   string
	MaxBackups       int
}

// AuthConfig holds authentication configuration
type AuthConfig struct {
	EnableRegistration bool
	RequireEmailVerification bool
	MinPasswordLength int
	SessionTimeout    string
}

// Features holds feature flags
type Features struct {
	EnableWebhooks     bool
	EnableNotifications bool
	EnableFileUploads  bool
	EnableRealtime     bool
	EnableAnalytics    bool
}

// New creates a new configuration instance with defaults
func New() *Config {
	return &Config{
		Environment: getEnv("APP_ENV", "development"),
		LogLevel:    getEnv("LOG_LEVEL", "info"),
		AppName:     getEnv("APP_NAME", "PocketBase App"),
		AppVersion:  getEnv("APP_VERSION", "1.0.0"),
		APIPrefix:   getEnv("API_PREFIX", "/api/v1"),
		Database: DatabaseConfig{
			EnableMigrations: getEnvBool("DB_ENABLE_MIGRATIONS", true),
			EnableBackups:    getEnvBool("DB_ENABLE_BACKUPS", true),
			BackupInterval:   getEnv("DB_BACKUP_INTERVAL", "24h"),
			MaxBackups:       getEnvInt("DB_MAX_BACKUPS", 7),
		},
		Auth: AuthConfig{
			EnableRegistration:       getEnvBool("AUTH_ENABLE_REGISTRATION", true),
			RequireEmailVerification: getEnvBool("AUTH_REQUIRE_EMAIL_VERIFICATION", false),
			MinPasswordLength:        getEnvInt("AUTH_MIN_PASSWORD_LENGTH", 8),
			SessionTimeout:           getEnv("AUTH_SESSION_TIMEOUT", "24h"),
		},
		Features: Features{
			EnableWebhooks:      getEnvBool("FEATURE_WEBHOOKS", true),
			EnableNotifications: getEnvBool("FEATURE_NOTIFICATIONS", true),
			EnableFileUploads:   getEnvBool("FEATURE_FILE_UPLOADS", true),
			EnableRealtime:      getEnvBool("FEATURE_REALTIME", true),
			EnableAnalytics:     getEnvBool("FEATURE_ANALYTICS", false),
		},
	}
}

// IsDevelopment returns true if the environment is development
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

// IsProduction returns true if the environment is production
func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}

// Helper functions to get environment variables with defaults
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}
