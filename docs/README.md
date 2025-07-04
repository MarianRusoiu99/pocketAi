# Documentation Directory

This directory contains comprehensive documentation for the Go-only PocketBase application.

## 📚 Available Documentation

### Architecture & Implementation
- **[GO_ARCHITECTURE.md](./GO_ARCHITECTURE.md)** - Detailed backend architecture guide
- **[GO_IMPLEMENTATION_COMPLETE.md](./GO_IMPLEMENTATION_COMPLETE.md)** - Implementation summary and features

### Project Information
- **[README.md](../README.md)** - Main project documentation (root level)
- **[Scripts Guide](../scripts/README.md)** - Development and build scripts

## 🏗️ Architecture Overview

The application follows a **Go-only architecture** with clean separation of concerns:

```
Backend (Go)
├── cmd/server/         # Application entry point
├── internal/           # Private application code
│   ├── config/        # Configuration management
│   ├── services/      # Business logic layer
│   ├── handlers/      # Event hooks
│   └── collections/   # Database setup
└── pkg/               # Reusable packages

Frontend (React)
└── client/            # React TypeScript application
```

## 🎯 Key Benefits

- **Type Safety**: Full Go type safety throughout the backend
- **Performance**: Native Go performance for all backend operations
- **Maintainability**: Clean, modular architecture
- **Scalability**: Easy to extend and modify
- **No JavaScript**: Pure Go backend eliminates JavaScript runtime overhead

## 📖 Quick Start

1. Read the main [README.md](../README.md) for project overview
2. Follow the [setup guide](../scripts/README.md) to get started
3. Explore the [architecture documentation](./GO_ARCHITECTURE.md) for deeper understanding
4. Check the [implementation guide](./GO_IMPLEMENTATION_COMPLETE.md) for current status

## 🔗 External Resources

- [PocketBase Documentation](https://pocketbase.io/docs/)
- [Go Documentation](https://golang.org/doc/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
