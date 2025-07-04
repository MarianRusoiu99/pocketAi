package middleware

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/pocketbase/pocketbase/core"
)

// CORSMiddleware handles Cross-Origin Resource Sharing
type CORSMiddleware struct {
	allowedOrigins   []string
	allowedMethods   []string
	allowedHeaders   []string
	allowCredentials bool
	maxAge           int
}

// NewCORSMiddleware creates a new CORS middleware
func NewCORSMiddleware(origins, methods, headers []string, allowCredentials bool, maxAge int) *CORSMiddleware {
	return &CORSMiddleware{
		allowedOrigins:   origins,
		allowedMethods:   methods,
		allowedHeaders:   headers,
		allowCredentials: allowCredentials,
		maxAge:           maxAge,
	}
}

// Handler returns the CORS middleware handler
func (c *CORSMiddleware) Handler() func(e *core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		origin := e.Request.Header.Get("Origin")
		
		// Check if origin is allowed
		if c.isOriginAllowed(origin) {
			e.Response.Header().Set("Access-Control-Allow-Origin", origin)
		}
		
		e.Response.Header().Set("Access-Control-Allow-Methods", strings.Join(c.allowedMethods, ", "))
		e.Response.Header().Set("Access-Control-Allow-Headers", strings.Join(c.allowedHeaders, ", "))
		
		if c.allowCredentials {
			e.Response.Header().Set("Access-Control-Allow-Credentials", "true")
		}
		
		// Handle preflight requests
		if e.Request.Method == "OPTIONS" {
			e.Response.Header().Set("Access-Control-Max-Age", fmt.Sprintf("%d", c.maxAge))
			return e.NoContent(204)
		}
		
		return e.Next()
	}
}

func (c *CORSMiddleware) isOriginAllowed(origin string) bool {
	for _, allowed := range c.allowedOrigins {
		if allowed == "*" || allowed == origin {
			return true
		}
	}
	return false
}

// LoggingMiddleware provides detailed request logging
type LoggingMiddleware struct {
	skipPaths []string
}

// NewLoggingMiddleware creates a new logging middleware
func NewLoggingMiddleware(skipPaths ...string) *LoggingMiddleware {
	return &LoggingMiddleware{
		skipPaths: skipPaths,
	}
}

// Handler returns the logging middleware handler
func (l *LoggingMiddleware) Handler() func(e *core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		// Skip logging for specified paths
		for _, skipPath := range l.skipPaths {
			if strings.HasPrefix(e.Request.URL.Path, skipPath) {
				return e.Next()
			}
		}

		start := time.Now()
		method := e.Request.Method
		path := e.Request.URL.Path
		userAgent := e.Request.Header.Get("User-Agent")
		clientIP := e.RealIP()

		// Get user info if authenticated
		userID := "anonymous"
		if e.Auth != nil {
			userID = e.Auth.Id
		}

		// Process request
		err := e.Next()

		// Log request details
		duration := time.Since(start)
		status := http.StatusOK
		if err != nil {
			status = http.StatusInternalServerError
		}

		log.Printf("Request: %s %s | Status: %d | Duration: %v | User: %s | IP: %s | UA: %s",
			method, path, status, duration, userID, clientIP, userAgent)

		return err
	}
}

// SecurityMiddleware adds security headers
type SecurityMiddleware struct{}

// NewSecurityMiddleware creates a new security middleware
func NewSecurityMiddleware() *SecurityMiddleware {
	return &SecurityMiddleware{}
}

// Handler returns the security middleware handler
func (s *SecurityMiddleware) Handler() func(e *core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		// Add security headers
		e.Response.Header().Set("X-Content-Type-Options", "nosniff")
		e.Response.Header().Set("X-Frame-Options", "DENY")
		e.Response.Header().Set("X-XSS-Protection", "1; mode=block")
		e.Response.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		e.Response.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		
		// Add CSP for API responses
		if strings.HasPrefix(e.Request.URL.Path, "/api/") {
			e.Response.Header().Set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
		}

		return e.Next()
	}
}

// ValidationMiddleware provides request validation
type ValidationMiddleware struct{}

// NewValidationMiddleware creates a new validation middleware
func NewValidationMiddleware() *ValidationMiddleware {
	return &ValidationMiddleware{}
}

// Handler returns the validation middleware handler
func (v *ValidationMiddleware) Handler() func(e *core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		// Basic request validation
		if e.Request.ContentLength < 0 {
			return e.BadRequestError("Invalid content length", nil)
		}

		// Validate content type for POST/PUT requests
		if (e.Request.Method == "POST" || e.Request.Method == "PUT") &&
			e.Request.ContentLength > 0 {
			contentType := e.Request.Header.Get("Content-Type")
			if contentType == "" {
				return e.BadRequestError("Content-Type header is required", nil)
			}
		}

		// Validate request size (max 10MB)
		if e.Request.ContentLength > 10*1024*1024 {
			return e.BadRequestError("Request too large", nil)
		}

		return e.Next()
	}
}

// RateLimitMiddleware provides rate limiting
type RateLimitMiddleware struct {
	requests int
	window   time.Duration
	clients  map[string]*clientInfo
	mutex    sync.RWMutex
}

type clientInfo struct {
	requests  int
	lastReset time.Time
}

// NewRateLimitMiddleware creates a new rate limit middleware
func NewRateLimitMiddleware(requests int, window string) *RateLimitMiddleware {
	duration, err := time.ParseDuration(window)
	if err != nil {
		duration = time.Minute // default to 1 minute
	}

	rl := &RateLimitMiddleware{
		requests: requests,
		window:   duration,
		clients:  make(map[string]*clientInfo),
	}

	// Start cleanup goroutine
	go rl.cleanup()

	return rl
}

// Handler returns the rate limit middleware handler
func (rl *RateLimitMiddleware) Handler() func(e *core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		clientIP := e.RealIP()
		
		rl.mutex.Lock()
		defer rl.mutex.Unlock()

		client, exists := rl.clients[clientIP]
		if !exists {
			client = &clientInfo{
				requests:  0,
				lastReset: time.Now(),
			}
			rl.clients[clientIP] = client
		}

		// Reset if window has passed
		if time.Since(client.lastReset) > rl.window {
			client.requests = 0
			client.lastReset = time.Now()
		}

		// Check rate limit
		if client.requests >= rl.requests {
			e.Response.Header().Set("X-RateLimit-Limit", strconv.Itoa(rl.requests))
			e.Response.Header().Set("X-RateLimit-Remaining", "0")
			e.Response.Header().Set("X-RateLimit-Reset", strconv.FormatInt(client.lastReset.Add(rl.window).Unix(), 10))
			
			return e.TooManyRequestsError("Rate limit exceeded", nil)
		}

		// Increment counter
		client.requests++

		// Add rate limit headers
		e.Response.Header().Set("X-RateLimit-Limit", strconv.Itoa(rl.requests))
		e.Response.Header().Set("X-RateLimit-Remaining", strconv.Itoa(rl.requests-client.requests))
		e.Response.Header().Set("X-RateLimit-Reset", strconv.FormatInt(client.lastReset.Add(rl.window).Unix(), 10))

		return e.Next()
	}
}

// cleanup removes old client entries
func (rl *RateLimitMiddleware) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			rl.mutex.Lock()
			now := time.Now()
			for ip, client := range rl.clients {
				if now.Sub(client.lastReset) > rl.window*2 {
					delete(rl.clients, ip)
				}
			}
			rl.mutex.Unlock()
		}
	}
}
