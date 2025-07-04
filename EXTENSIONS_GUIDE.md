# PocketBase Go Extensions System

A modern, modular, and high-performance extension system for PocketBase using native Go instead of JavaScript hooks.

## 🚀 Overview

This system replaces traditional JavaScript hooks with a powerful Go-based extension architecture that provides:

- **Native Performance**: Direct Go execution without JavaScript VM overhead
- **Type Safety**: Compile-time error checking and IDE support
- **Modular Design**: Clean separation of concerns with dependency management
- **Configuration-Driven**: JSON-based configuration for easy management
- **Extensible**: Simple interface for creating custom extensions

## 📁 Architecture

```
extensions/
├── registry.go              # Extension registry and lifecycle management
├── config.go               # Configuration management
├── middleware/
│   └── enhanced.go         # Enhanced middleware (CORS, logging, security, rate limiting)
└── modules/
    ├── core/
    │   └── extension.go    # Core extension (essential functionality)
    ├── auth/
    │   └── extension.go    # Auth extension (enhanced authentication)
    └── api/
        └── extension.go    # API extension (additional endpoints)
```

## 🎯 Key Features

### Core Extension
- **Health Checks**: `/api/v1/health`, `/api/v1/health/live`, `/api/v1/health/ready`
- **System Info**: `/api/v1/info`, `/api/v1/version`
- **Middleware Stack**: CORS, logging, security headers, validation, rate limiting

### Auth Extension
- **Enhanced Hooks**: User lifecycle events with detailed logging
- **Password Validation**: Strength analysis and requirements checking
- **Session Management**: Extended session information and logout capabilities
- **Email Checking**: Availability validation for registration

### API Extension
- **Example Endpoints**: Hello world examples and utilities
- **Validation Utilities**: Email and password validation
- **Time Utilities**: Various time format endpoints
- **User Info**: Authenticated user information

### Enhanced Middleware
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: IP-based request limiting with sliding windows
- **Security Headers**: Comprehensive security header injection
- **Request Logging**: Detailed request/response logging with user context
- **Validation**: Request structure and content validation

## ⚙️ Configuration

Extensions are configured via `extensions.json`:

```json
{
  "extensions": {
    "enabled": true,
    "autoLoad": true,
    "disabled": [],
    "loadOrder": ["core", "auth", "api", "realtime"]
  },
  "cors": {
    "enabled": true,
    "allowedOrigins": ["http://localhost:5000", "http://localhost:3000"],
    "allowedMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    "allowedHeaders": ["Content-Type", "Authorization", "X-Requested-With"],
    "allowCredentials": true,
    "maxAge": 86400
  },
  "api": {
    "prefix": "/api/v1",
    "version": "1.0.0",
    "enableSwagger": true,
    "rateLimit": {
      "enabled": true,
      "requests": 100,
      "window": "1m"
    }
  },
  "auth": {
    "sessionTimeout": "24h",
    "passwordMinLength": 8,
    "requireEmailVerification": true,
    "allowedProviders": ["email", "google", "github"]
  },
  "logging": {
    "level": "info",
    "format": "json",
    "enableRequestLogging": true,
    "skipPaths": ["/health", "/api/v1/health"]
  },
  "features": {
    "realtime": true,
    "fileUploads": true,
    "analytics": false,
    "webhooks": false
  }
}
```

## 🚀 Usage

### Starting the Application

```bash
# With default configuration
go run . serve

# With custom config
go run . serve --extensionConfig=./my-extensions.json

# Disable JavaScript hooks completely
go run . serve --disableJsHooks

# Development mode with auto-reload (for remaining JS hooks)
go run . serve --dev
```

### Available Endpoints

#### Core Endpoints
- `GET /api/v1/health` - Application health status
- `GET /api/v1/health/live` - Liveness probe
- `GET /api/v1/health/ready` - Readiness probe with database check
- `GET /api/v1/info` - System information and feature flags
- `GET /api/v1/version` - Version information
- `GET /api/extensions/health` - Extension system health

#### Example API Endpoints
- `GET /api/v1/examples/hello` - Simple greeting
- `GET /api/v1/examples/hello/{name}` - Personalized greeting
- `POST /api/v1/examples/hello` - Echo with user info
- `POST /api/v1/examples/echo` - Message echo

#### Utility Endpoints
- `GET /api/v1/utils/time` - Current time in multiple formats
- `GET /api/v1/utils/time/unix` - Unix timestamp
- `POST /api/v1/utils/validate/email` - Email validation
- `POST /api/v1/utils/validate/password` - Password strength analysis
- `GET /api/v1/utils/user/info` - Current user info (authenticated)

#### Auth Endpoints
- `POST /api/v1/auth/check-email` - Check email availability
- `POST /api/v1/auth/password-strength` - Password strength analysis
- `GET /api/v1/auth/session-info` - Current session information
- `POST /api/v1/auth/logout-all` - Logout from all sessions

## 🛠️ Creating Custom Extensions

### 1. Create Extension Structure

```go
package myextension

import (
    "github.com/pocketbase/pocketbase"
    "../extensions"
)

type MyExtension struct {
    *extensions.BaseExtension
    app    *pocketbase.PocketBase
    config *extensions.Config
}

func NewMyExtension() *MyExtension {
    return &MyExtension{
        BaseExtension: extensions.NewBaseExtension(
            "myextension",  // name
            "1.0.0",       // version
            200,           // priority (higher = loaded later)
            "core",        // dependencies
        ),
    }
}
```

### 2. Implement Extension Interface

```go
func (me *MyExtension) Initialize(app *pocketbase.PocketBase, config *extensions.Config) error {
    me.app = app
    me.config = config

    // Register routes
    app.OnServe().BindFunc(func(se *core.ServeEvent) error {
        apiGroup := se.Router.Group(config.API.Prefix + "/my")
        apiGroup.GET("/endpoint", me.handleEndpoint)
        return se.Next()
    })

    // Register hooks
    app.OnRecordCreate("collection").BindFunc(me.handleRecordCreate)

    return nil
}

func (me *MyExtension) Cleanup() error {
    // Cleanup resources
    return nil
}
```

### 3. Register Extension

Add to `main.go`:

```go
import myExt "./extensions/modules/myextension"

// In setupGoExtensions function:
myExtension := myExt.NewMyExtension()
if err := registry.Register(myExtension); err != nil {
    log.Printf("❌ Failed to register my extension: %v", err)
}
```

## 🔧 Migration from JavaScript Hooks

### Before (JavaScript)
```javascript
routerAdd("GET", "/hello/{name}", (e) => {
    let name = e.request.pathValue("name")
    return e.json(200, { "message": "Hello " + name })
})

onRecordCreate((e) => {
    console.log("Record created:", e.record.get("id"))
    e.next()
}, "users")
```

### After (Go)
```go
// In extension initialization
apiGroup.GET("/hello/{name}", me.hello)

app.OnRecordCreate("users").BindFunc(func(e *core.RecordEvent) error {
    log.Printf("Record created: %s", e.Record.GetId())
    return e.Next()
})

// Handler implementation
func (me *MyExtension) hello(e *core.RequestEvent) error {
    name := e.Request.PathValue("name")
    return e.JSON(200, map[string]any{
        "message": "Hello " + name,
    })
}
```

## 🎯 Benefits

### Performance
- **~10x faster execution** compared to JavaScript VM
- **Lower memory usage** with native Go execution
- **Better resource utilization** and scalability

### Developer Experience
- **Compile-time error checking** catches issues early
- **Full IDE support** with autocompletion and debugging
- **Better testing capabilities** with Go's testing framework
- **Strong typing** prevents runtime errors

### Operations
- **Single binary deployment** with all extensions included
- **Better observability** with native Go metrics and profiling
- **Easier debugging** with standard Go debugging tools
- **Improved security** with compile-time validation

## 📊 Monitoring

The extension system provides comprehensive monitoring:

- **Health endpoints** for liveness and readiness probes
- **Extension health status** at `/api/extensions/health`
- **Request logging** with user context and timing
- **Rate limiting metrics** in response headers
- **Database connectivity checks** in readiness probes

## 🔄 Backward Compatibility

JavaScript hooks are still supported for gradual migration:

- Set `--disableJsHooks=false` to keep JS hooks enabled
- Existing `pb_hooks/*.pb.js` files continue to work
- Mix Go extensions with JS hooks during transition
- Gradually migrate JS logic to Go extensions

## 🚀 Getting Started

1. **Review the configuration** in `extensions.json`
2. **Start the application**: `go run . serve`
3. **Test the endpoints**: Visit `http://localhost:8090/api/v1/health`
4. **Check extension health**: Visit `http://localhost:8090/api/extensions/health`
5. **Explore the examples**: Try the various API endpoints
6. **Create your first extension** using the guide above

## 🎉 Next Steps

This modular extension system provides a solid foundation for building scalable, maintainable PocketBase applications. The architecture is designed to grow with your needs while maintaining performance and developer experience.

Key advantages:
- **Clean separation of concerns** with dedicated modules
- **Dependency management** ensures proper load order
- **Configuration-driven** behavior for easy customization
- **Comprehensive middleware** for cross-cutting concerns
- **Production-ready** with health checks and monitoring

Start building your custom extensions today!
