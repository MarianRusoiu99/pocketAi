# Service Contracts

This directory contains interface definitions for all services in the refactored architecture. These contracts ensure SOLID principle compliance, particularly Dependency Inversion Principle (DIP) and Interface Segregation Principle (ISP).

## Organization

- `workflow-service.go` - Workflow execution interfaces
- `repository-interfaces.go` - Data access contracts
- `external-services.go` - Third-party service interfaces  
- `auth-service.go` - Authentication and authorization
- `config-service.go` - Configuration management
- `event-system.go` - Event publishing and handling

## Usage

These interfaces should be:
1. **Implemented** by concrete service classes
2. **Injected** as dependencies (never instantiated directly)
3. **Tested** with mock implementations
4. **Versioned** carefully to maintain backward compatibility

## SOLID Compliance

Each interface follows:
- **SRP**: Single, focused responsibility
- **ISP**: Minimal, client-specific interfaces
- **LSP**: Substitutable implementations
- **DIP**: Abstract dependencies, not concrete classes