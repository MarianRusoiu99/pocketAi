<!--
Sync Impact Report:
- Version change: Template → 1.0.0
- Added sections: All principles and governance established
- Modified principles: N/A (initial creation)
- Templates requiring updates: ✅ All templates reviewed and aligned
- Follow-up TODOs: None
-->

# PocketAI Constitution

## Core Principles

### I. Single Responsibility Principle (SRP)
Each component MUST have exactly one reason to change. Frontend handles UI/UX only, PocketBase manages data/API only, Rivet processes AI workflows only, Scripts handle development lifecycle only. No component may assume responsibilities outside its domain. Cross-cutting concerns require explicit interfaces.

**Rationale**: Clear separation prevents cascading changes and improves maintainability in this multi-technology stack.

### II. Open/Closed Principle (OCP)
Components MUST be open for extension, closed for modification. PocketBase extensions via middleware, Frontend extensions via modular components, Rivet workflows via composable nodes. Core functionality remains untouched when adding features.

**Rationale**: Preserves stability while enabling growth in AI capabilities and user features.

### III. Liskov Substitution Principle (LSP)
All API contracts MUST be substitutable. PocketBase endpoints maintain consistent signatures, Frontend API layers remain interchangeable, Rivet workflows accept standardized inputs/outputs. Mock implementations MUST behave identically to production.

**Rationale**: Enables testing, prevents breaking changes, and maintains contract reliability across the stack.

### IV. Interface Segregation Principle (ISP)  
No component MUST depend on interfaces it doesn't use. Frontend consumes only required PocketBase endpoints, PocketBase calls only necessary Rivet workflows, Scripts target specific lifecycle phases. Avoid monolithic API contracts.

**Rationale**: Reduces coupling and prevents unnecessary dependencies in this distributed architecture.

### V. Dependency Inversion Principle (DIP)
High-level modules MUST NOT depend on low-level modules. Both depend on abstractions. Frontend depends on API contracts (not PocketBase internals), PocketBase depends on workflow interfaces (not Rivet specifics), Scripts depend on environment contracts (not implementation details).

**Rationale**: Enables independent development, testing, and deployment of each architectural layer.

### VI. Centralized Environment Management (NON-NEGOTIABLE)
All environment configuration MUST flow through centralized `.env.local` with symlinks to component-specific locations. Scripts MUST maintain symlink integrity. No component may maintain separate environment files. All secrets and configuration managed in one place.

**Rationale**: Prevents configuration drift, simplifies deployment, and ensures consistent behavior across all services.

### VII. Integration-First Development
All cross-component features MUST include integration tests covering the full request/response cycle: Frontend → PocketBase → Rivet → Response chain. Unit tests supplement but never replace integration coverage for user-facing functionality.

**Rationale**: Multi-service architecture requires end-to-end validation to catch contract mismatches and timing issues.

## Technology Stack Requirements

All technology choices MUST align with established stack. Frontend: React + TypeScript + Vite, Backend: Go + PocketBase, AI: Rivet workflows, DevOps: Bash scripts. No introduction of alternative frameworks without constitutional amendment. Dependencies added only when solving specific architectural needs.

Language-specific standards: TypeScript strict mode enabled, Go modules with semantic versioning, Rivet workflows with clear input/output schemas, Scripts with error handling and logging.

## Development Workflow

Script-driven development MUST be maintained. All common operations accessible via `./scripts/` commands. Development environment setup via `./scripts/setup.sh`, multi-service startup via `./scripts/dev.sh both`, production builds via `./scripts/build.sh`. No manual dependency installation or service startup procedures.

Code changes MUST include corresponding script updates when affecting deployment, environment, or service startup procedures. Scripts serve as living documentation of operational requirements.

## Governance

Constitution supersedes all other development practices. All pull requests MUST verify compliance with stated principles. Architectural decisions require justification against constitutional principles. 

Amendments require: (1) Documentation of current practice conflicts, (2) Proposed resolution with impact analysis, (3) Update of dependent templates and documentation, (4) Version increment following semantic versioning.

Use `.github/copilot-instructions.md` for AI agent guidance during development. Constitutional violations in existing code must be flagged for refactoring during related feature work.

**Version**: 1.0.0 | **Ratified**: 2025-10-17 | **Last Amended**: 2025-10-17
