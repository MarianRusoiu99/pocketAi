# PocketBase Go-Only Architecture

This project has been restructured to use **PocketBase as a Go framework** exclusively, removing the JavaScript hooks approach for a cleaner, more maintainable codebase.

## Architecture Overview

### Why Go-Only?

1. **Better Performance**: Native Go code runs faster than JavaScript through the embedded JS engine
2. **Type Safety**: Full compile-time type checking and IDE support
3. **Ecosystem Access**: Use any Go library directly
4. **Simpler Deployment**: Single binary with no JavaScript runtime dependencies
5. **Better Debugging**: Standard Go debugging tools and stack traces
6. **Maintainability**: Consistent language across the entire backend

### Project Structure

```
pocket-app/
├── cmd/
│   └── server/           # Application entry point
│       └── main.go
├── internal/             # Private application code
│   ├── config/           # Configuration management
│   ├── handlers/         # HTTP handlers (controllers)
│   ├── services/         # Business logic layer
│   ├── collections/      # Database collection definitions
│   ├── middleware/       # Custom middleware
│   └── models/           # Data models
├── pkg/                  # Public packages (reusable)
│   ├── logger/           # Logging utilities
│   ├── response/         # HTTP response helpers
│   └── validator/        # Input validation
├── migrations/           # Database migrations
├── frontend/             # React frontend (renamed from client)
├── docs/                 # Documentation
└── scripts/              # Build and deployment scripts
```

## Key Components

### 1. Collections Manager (`internal/collections/`)
- **Purpose**: Programmatically define and manage PocketBase collections
- **Features**:
  - Auto-creation of collections with proper schemas
  - Type-safe field definitions
  - Access rule management
  - Migration support

**Example Usage**:
```go
// Collections are automatically created on app bootstrap
// Defined in internal/collections/manager.go
```

### 2. Services Layer (`internal/services/`)
- **Purpose**: Business logic separated from HTTP handlers
- **Services**:
  - `UserService`: User profile management
  - `PostService`: Blog post operations
  - `AuthService`: Authentication logic

**Example Usage**:
```go
// Get user profile
profile, err := servicesManager.User.GetProfile(userID)

// Create new post
post, err := servicesManager.Post.CreatePost(authorID, postData)
```

### 3. Handlers Layer (`internal/handlers/`)
- **Purpose**: HTTP request/response handling
- **Features**:
  - RESTful API endpoints
  - Request validation
  - Response formatting
  - Authentication middleware

**Example Routes**:
- `GET /api/v1/users/profile` - Get current user profile
- `PATCH /api/v1/users/profile` - Update user profile
- `GET /api/v1/posts` - Get published posts
- `POST /api/v1/posts` - Create new post

### 4. Configuration (`internal/config/`)
- **Purpose**: Centralized application configuration
- **Features**:
  - Environment-based configuration
  - Feature flags
  - Database settings
  - Authentication options

## API Design

### Standard Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2025-01-05T10:00:00Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "timestamp": "2025-01-05T10:00:00Z"
}
```

## Development Workflow

### Running the Application

1. **Development Mode**:
   ```bash
   npm run dev  # Starts both backend and frontend
   ```

2. **Backend Only**:
   ```bash
   npm run dev:backend  # or: go run ./cmd/server
   ```

3. **Frontend Only**:
   ```bash
   npm run dev:frontend
   ```

### Building for Production

```bash
npm run build  # Builds both frontend and backend
# Creates: ./pocket-app binary
```

### Testing

```bash
npm run test         # Run all tests
npm run test:verbose # Verbose test output
```

## Database Collections

### Automatically Created Collections

1. **user_profiles**
   - Extended user information beyond auth
   - Fields: display_name, bio, avatar, location, website, etc.
   - Access rules based on privacy settings

2. **posts**
   - Blog posts/articles
   - Fields: title, slug, content, author, status, tags, etc.
   - Publication workflow (draft → published → archived)

## Advantages of This Architecture

### 1. **Performance**
- No JavaScript engine overhead
- Direct database access
- Efficient memory usage
- Fast startup times

### 2. **Development Experience**
- Full IDE support with autocomplete
- Compile-time error checking
- Standard Go debugging tools
- Better refactoring support

### 3. **Deployment**
- Single binary deployment
- No Node.js runtime required
- Smaller container images
- Simpler configuration

### 4. **Extensibility**
- Easy to add new services
- Modular architecture
- Dependency injection support
- Testing-friendly design

## Migration from JavaScript Hooks

The previous JavaScript hooks system (`pb_hooks/`) has been completely replaced with:

- **Collections**: `pb_hooks/collections/` → `internal/collections/`
- **Routes**: `pb_hooks/routes/` → `internal/handlers/`
- **Services**: `pb_hooks/services/` → `internal/services/`
- **Utils**: `pb_hooks/utils/` → `pkg/`

### Benefits of Migration

1. **Type Safety**: Compile-time checking vs runtime errors
2. **Performance**: Native Go vs JavaScript engine
3. **Debugging**: Standard tools vs limited JS debugging
4. **Libraries**: Full Go ecosystem vs limited JS modules
5. **Maintenance**: Single language vs mixed stack

## Best Practices

### 1. **Service Layer Pattern**
- Keep business logic in services
- Handlers should be thin
- Services should be testable

### 2. **Error Handling**
- Use structured errors
- Log appropriately
- Return user-friendly messages

### 3. **Configuration**
- Use environment variables
- Provide sensible defaults
- Document all settings

### 4. **Database Access**
- Use PocketBase's built-in ORM
- Leverage access rules
- Handle migrations properly

## Future Enhancements

- [ ] Add middleware for rate limiting
- [ ] Implement caching layer
- [ ] Add real-time features
- [ ] Create admin dashboard
- [ ] Add monitoring and metrics
- [ ] Implement background jobs

---

This architecture provides a solid foundation for building scalable, maintainable applications with PocketBase as a Go framework.
