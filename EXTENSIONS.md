# PocketBase Go Extensions System

A modern, modular, and high-performance extension system for PocketBase using native Go instead of JavaScript hooks.

## Overview

This extension system provides a clean, structured approach to extending PocketBase with custom functionality. It leverages Go's native performance and PocketBase's built-in event hooks and routing system.

## Architecture

### Core Components

```
extensions/
├── core/           # Core extension management
│   ├── manager.go  # Extension manager and interfaces
│   └── config.go   # Configuration management
├── middleware/     # Reusable middleware components
│   ├── cors.go     # CORS middleware
│   └── common.go   # Common middleware (logging, security, validation)
├── api/           # API handlers and routes
│   └── handlers.go # Health check and example handlers
├── hooks/         # Record lifecycle hooks
│   └── users.go   # User-related hooks
├── utils/         # Utility functions
│   └── helpers.go # Validation, formatting, generation utilities
└── examples/      # Example extensions
    └── blog.go    # Complete blog extension example
```

## Key Features

- **Native Go Performance**: No JavaScript VM overhead
- **Modular Design**: Easy to add, remove, and configure extensions
- **Type Safety**: Full Go type safety and compile-time checks
- **Middleware System**: Reusable middleware components
- **Configuration-Driven**: JSON configuration for easy management
- **Lifecycle Management**: Proper initialization and cleanup
- **Extensible**: Easy to create new extensions

## Getting Started

### 1. Configuration

Extensions are configured via `extensions.json`:

```json
{
  "extensions": {
    "enabled": true,
    "autoLoad": true,
    "disabled": [],
    "loadOrder": []
  },
  "cors": {
    "enabled": true,
    "allowedOrigins": ["*"],
    "allowedMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    "allowedHeaders": ["Content-Type", "Authorization", "X-Requested-With"],
    "allowCredentials": false
  },
  "api": {
    "prefix": "/api/v1",
    "version": "1.0.0",
    "enableSwagger": false
  }
}
```

### 2. Built-in Endpoints

The core extension provides several built-in endpoints:

- **Health Checks**:
  - `GET /api/v1/health` - Basic health status
  - `GET /api/v1/health/live` - Liveness probe
  - `GET /api/v1/health/ready` - Readiness probe

- **Hello Examples**:
  - `GET /api/v1/hello` - Simple greeting
  - `GET /api/v1/hello/{name}` - Personalized greeting
  - `POST /api/v1/hello` - Echo endpoint

### 3. Creating Custom Extensions

```go
// Define your extension
type MyExtension struct {
    *core.BaseExtension
    config *core.Config
}

func NewMyExtension(config *core.Config) *MyExtension {
    return &MyExtension{
        BaseExtension: core.NewBaseExtension("myext", "1.0.0", 100),
        config:        config,
    }
}

// Implement the Initialize method
func (me *MyExtension) Initialize(app *pocketbase.PocketBase) error {
    // Register routes, hooks, middleware, etc.
    return nil
}

// Register your extension
extensionManager.Register(NewMyExtension(config))
```

## Middleware System

The system includes several built-in middleware:

- **CORS**: Cross-origin resource sharing
- **Logging**: Request/response logging
- **Security**: Security headers
- **Validation**: Request validation

### Custom Middleware

```go
func CustomMiddleware() router.MiddlewareFunc {
    return func(e *core.RequestEvent) error {
        // Your middleware logic here
        return e.Next()
    }
}
```

## Record Hooks

The system provides comprehensive record lifecycle hooks:

```go
// User creation hooks
app.OnRecordCreate("users").BindFunc(func(e *core.RecordEvent) error {
    // Before user creation
    return e.Next()
})

app.OnRecordAfterCreateSuccess("users").BindFunc(func(e *core.RecordEvent) error {
    // After successful user creation
    return e.Next()
})
```

## Utilities

Common utilities are provided for:

- **Validation**: Email, password, data validation
- **Formatting**: Timestamp formatting, string manipulation
- **Generation**: Random strings, IDs, tokens
- **Security**: Input sanitization, XSS protection

## Migration from JavaScript Hooks

### Before (JavaScript)
```javascript
routerAdd("GET", "/hello/{name}", (e) => {
    let name = e.request.pathValue("name")
    return e.json(200, { "message": "Hello " + name })
})
```

### After (Go)
```go
func (h *HelloHandler) HelloName(e *core.RequestEvent) error {
    name := e.Request.PathValue("name")
    return e.JSON(200, map[string]any{
        "message": "Hello " + name,
    })
}
```

## Benefits

1. **Performance**: Native Go execution vs JavaScript VM
2. **Type Safety**: Compile-time error checking
3. **Tooling**: Full Go tooling support (debugging, profiling, etc.)
4. **Maintainability**: Better code organization and structure
5. **Scalability**: Better resource usage and performance
6. **Integration**: Direct access to PocketBase internals

## Running

```bash
# Run with extensions enabled
go run . serve

# Run with custom config
go run . serve --extensionConfig=./my-config.json

# Build and run
go build -o myapp
./myapp serve
```

## Development

### Adding New Extensions

1. Create a new extension file in `extensions/examples/`
2. Implement the `Extension` interface
3. Register it in `main.go`
4. Update configuration as needed

### Testing

```bash
# Test the health endpoint
curl http://localhost:8090/api/v1/health

# Test the hello endpoint
curl http://localhost:8090/api/v1/hello/world

# Test with authentication
curl -H "Authorization: Bearer <token>" http://localhost:8090/api/v1/hello
```

## Best Practices

1. **Use middleware for cross-cutting concerns**
2. **Keep extensions focused and single-purpose**
3. **Use proper error handling and logging**
4. **Implement proper cleanup in extension destructors**
5. **Use configuration for customizable behavior**
6. **Follow Go conventions and best practices**

This system provides a solid foundation for building scalable, maintainable PocketBase applications with native Go performance.
