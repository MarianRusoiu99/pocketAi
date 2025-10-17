# Data Model: Clean and Refactor Architecture

**Generated**: 2025-10-17 | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

## Core Domain Models

### Story Generation Domain

#### Story Entity
```typescript
interface Story {
  id: string
  title: string
  chapters: Chapter[]
  metadata: StoryMetadata
  status: StoryStatus
  createdAt: Date
  updatedAt: Date
}

interface Chapter {
  id: string
  title: string
  content: string
  order: number
  wordCount: number
}

interface StoryMetadata {
  primaryCharacters: string[]
  secondaryCharacters: string[]
  genre?: string
  theme?: string
  estimatedReadingTime: number
}

enum StoryStatus {
  DRAFT = 'draft',
  GENERATING = 'generating', 
  COMPLETED = 'completed',
  FAILED = 'failed'
}
```

#### Workflow Request/Response Models
```typescript
interface StoryRequest {
  n_chapters: number
  story_instructions: string
  primary_characters: string
  secondary_characters: string
  l_chapter: number
}

interface StoryResponse {
  message: string
  status: string
  story?: Story
  story_text?: string
  attempts: number
}

interface WorkflowRequest {
  type: 'story-generation'
  parameters: StoryRequest
  userId?: string
  sessionId?: string
}

interface WorkflowResponse {
  success: boolean
  data?: any
  error?: WorkflowError
  metadata: WorkflowMetadata
}

interface WorkflowError {
  code: string
  message: string
  retryable: boolean
  context?: Record<string, any>
}

interface WorkflowMetadata {
  duration: number
  attempts: number
  timestamp: Date
  workflowType: string
}
```

### Authentication Domain

#### User Models
```typescript
interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  emailVerified: boolean
  createdAt: Date
  lastLoginAt: Date
}

interface AuthSession {
  userId: string
  token: string
  expiresAt: Date
  refreshToken?: string
}

interface AuthRequest {
  email: string
  password: string
}

interface AuthResponse {
  user: User
  session: AuthSession
  permissions: Permission[]
}

interface Permission {
  resource: string
  actions: string[]
}
```

### Configuration Domain

#### Environment Configuration
```typescript
interface AppConfig {
  server: ServerConfig
  database: DatabaseConfig
  external: ExternalConfig
  features: FeatureConfig
}

interface ServerConfig {
  host: string
  port: number
  corsOrigins: string[]
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

interface DatabaseConfig {
  path: string
  backupInterval?: number
  maxConnections?: number
}

interface ExternalConfig {
  rivet: RivetConfig
  openai?: OpenAIConfig
}

interface RivetConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelayMs: number
}

interface OpenAIConfig {
  apiKey: string
  model?: string
  maxTokens?: number
}

interface FeatureConfig {
  storyGeneration: boolean
  notifications: boolean
  analytics: boolean
}
```

## Repository Interfaces

### Story Repository
```typescript
interface StoryRepository {
  save(story: Story): Promise<Story>
  findById(id: string): Promise<Story | null>
  findByUserId(userId: string, options?: QueryOptions): Promise<Story[]>
  update(id: string, updates: Partial<Story>): Promise<Story>
  delete(id: string): Promise<void>
  search(query: StorySearchQuery): Promise<Story[]>
}

interface StorySearchQuery {
  userId?: string
  status?: StoryStatus
  title?: string
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}

interface QueryOptions {
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
```

### User Repository
```typescript
interface UserRepository {
  save(user: User): Promise<User>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  update(id: string, updates: Partial<User>): Promise<User>
  delete(id: string): Promise<void>
  exists(email: string): Promise<boolean>
}
```

### Session Repository
```typescript
interface SessionRepository {
  save(session: AuthSession): Promise<AuthSession>
  findByToken(token: string): Promise<AuthSession | null>
  findByUserId(userId: string): Promise<AuthSession[]>
  update(token: string, updates: Partial<AuthSession>): Promise<AuthSession>
  delete(token: string): Promise<void>
  deleteByUserId(userId: string): Promise<void>
  cleanup(): Promise<number> // Remove expired sessions
}
```

## Service Interfaces

### Workflow Services
```typescript
interface WorkflowService {
  execute(request: WorkflowRequest): Promise<WorkflowResponse>
  getStatus(sessionId: string): Promise<WorkflowStatus>
  cancel(sessionId: string): Promise<void>
}

interface StoryGenerationService extends WorkflowService {
  generateStory(request: StoryRequest): Promise<StoryResponse>
  validateRequest(request: StoryRequest): ValidationResult
}

interface WorkflowStatus {
  sessionId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress?: number
  message?: string
  startedAt: Date
  completedAt?: Date
}

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

interface ValidationError {
  field: string
  code: string
  message: string
}
```

### External Service Interfaces
```typescript
interface RivetClient {
  executeWorkflow(request: RivetWorkflowRequest): Promise<RivetWorkflowResponse>
  ping(): Promise<boolean>
}

interface RivetWorkflowRequest {
  workflow: string
  parameters: Record<string, any>
  timeout?: number
}

interface RivetWorkflowResponse {
  success: boolean
  result?: any
  error?: string
  metadata: {
    duration: number
    attempts: number
  }
}
```

### Authentication Services
```typescript
interface AuthService {
  login(request: AuthRequest): Promise<AuthResponse>
  logout(token: string): Promise<void>
  register(request: RegisterRequest): Promise<AuthResponse>
  refreshToken(refreshToken: string): Promise<AuthSession>
  validateToken(token: string): Promise<User | null>
  resetPassword(email: string): Promise<void>
}

interface RegisterRequest {
  email: string
  password: string
  name?: string
}
```

### Configuration Service
```typescript
interface ConfigService {
  get<T>(key: string): T | undefined
  getRequired<T>(key: string): T
  set<T>(key: string, value: T): void
  reload(): Promise<void>
  validate(): ValidationResult
}
```

## HTTP API Contracts

### REST API Endpoints
```typescript
// Story endpoints
interface StoryApiRoutes {
  'POST /api/stories': {
    request: CreateStoryRequest
    response: CreateStoryResponse
  }
  'GET /api/stories/:id': {
    response: Story
  }
  'GET /api/stories': {
    query: StorySearchQuery
    response: { stories: Story[], total: number }
  }
  'PUT /api/stories/:id': {
    request: Partial<Story>
    response: Story
  }
  'DELETE /api/stories/:id': {
    response: { success: boolean }
  }
}

// Workflow endpoints
interface WorkflowApiRoutes {
  'POST /api/workflows/story/generate': {
    request: StoryRequest
    response: StoryResponse
  }
  'GET /api/workflows/:sessionId/status': {
    response: WorkflowStatus
  }
  'DELETE /api/workflows/:sessionId': {
    response: { success: boolean }
  }
}

// Auth endpoints
interface AuthApiRoutes {
  'POST /api/auth/login': {
    request: AuthRequest
    response: AuthResponse
  }
  'POST /api/auth/logout': {
    response: { success: boolean }
  }
  'POST /api/auth/register': {
    request: RegisterRequest
    response: AuthResponse
  }
  'POST /api/auth/refresh': {
    request: { refreshToken: string }
    response: AuthSession
  }
}
```

### Standard Response Format
```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  metadata?: ApiMetadata
}

interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  stack?: string // Only in development
}

interface ApiMetadata {
  timestamp: Date
  requestId: string
  version: string
  duration?: number
}
```

## Event System

### Domain Events
```typescript
interface DomainEvent {
  id: string
  type: string
  aggregateId: string
  payload: Record<string, any>
  timestamp: Date
  version: number
}

// Story events
interface StoryCreatedEvent extends DomainEvent {
  type: 'story.created'
  payload: {
    storyId: string
    userId: string
    title: string
  }
}

interface StoryGenerationStartedEvent extends DomainEvent {
  type: 'story.generation.started'
  payload: {
    storyId: string
    sessionId: string
    parameters: StoryRequest
  }
}

interface StoryGenerationCompletedEvent extends DomainEvent {
  type: 'story.generation.completed'
  payload: {
    storyId: string
    sessionId: string
    success: boolean
    duration: number
  }
}

// Auth events
interface UserRegisteredEvent extends DomainEvent {
  type: 'user.registered'
  payload: {
    userId: string
    email: string
  }
}

interface UserLoggedInEvent extends DomainEvent {
  type: 'user.logged_in'
  payload: {
    userId: string
    sessionId: string
  }
}
```

### Event Handlers
```typescript
interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>
}

interface EventBus {
  publish(event: DomainEvent): Promise<void>
  subscribe<T extends DomainEvent>(
    eventType: string, 
    handler: EventHandler<T>
  ): void
  unsubscribe(eventType: string, handler: EventHandler<any>): void
}
```

## Error Handling Models

### Error Hierarchy
```typescript
abstract class AppError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number
  readonly context?: Record<string, any>

  constructor(message: string, context?: Record<string, any>) {
    super(message)
    this.context = context
  }
}

class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR'
  readonly statusCode = 400
}

class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND'
  readonly statusCode = 404
}

class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED'
  readonly statusCode = 401
}

class ExternalServiceError extends AppError {
  readonly code = 'EXTERNAL_SERVICE_ERROR'
  readonly statusCode = 502
}

class WorkflowExecutionError extends AppError {
  readonly code = 'WORKFLOW_EXECUTION_ERROR'
  readonly statusCode = 500
}
```

## Database Schema (PocketBase)

### Collections
```javascript
// Stories collection
{
  "name": "stories",
  "schema": [
    {"name": "title", "type": "text", "required": true},
    {"name": "status", "type": "select", "options": ["draft", "generating", "completed", "failed"]},
    {"name": "chapters", "type": "json"},
    {"name": "metadata", "type": "json"},
    {"name": "user", "type": "relation", "options": {"collectionId": "users"}}
  ]
}

// Workflow sessions collection  
{
  "name": "workflow_sessions",
  "schema": [
    {"name": "session_id", "type": "text", "required": true, "unique": true},
    {"name": "type", "type": "text", "required": true},
    {"name": "status", "type": "select", "options": ["pending", "running", "completed", "failed", "cancelled"]},
    {"name": "parameters", "type": "json"},
    {"name": "result", "type": "json"},
    {"name": "error", "type": "text"},
    {"name": "user", "type": "relation", "options": {"collectionId": "users"}}
  ]
}
```

## Migration Strategy

### Data Migration Models
```typescript
interface Migration {
  version: string
  description: string
  up(): Promise<void>
  down(): Promise<void>
}

interface MigrationResult {
  version: string
  success: boolean
  duration: number
  error?: string
}

interface MigrationRunner {
  run(targetVersion?: string): Promise<MigrationResult[]>
  rollback(targetVersion: string): Promise<MigrationResult[]>
  status(): Promise<MigrationStatus[]>
}

interface MigrationStatus {
  version: string
  applied: boolean
  appliedAt?: Date
}
```

## Testing Models

### Test Data Factories
```typescript
interface StoryFactory {
  create(overrides?: Partial<Story>): Story
  createMany(count: number, overrides?: Partial<Story>): Story[]
  createRequest(overrides?: Partial<StoryRequest>): StoryRequest
}

interface UserFactory {
  create(overrides?: Partial<User>): User
  createMany(count: number, overrides?: Partial<User>): User[]
  createAuthRequest(overrides?: Partial<AuthRequest>): AuthRequest
}

interface TestScenarios {
  happyPath: {
    storyGeneration(): Promise<Story>
    userRegistration(): Promise<User>
  }
  errorCases: {
    invalidStoryRequest(): StoryRequest
    unauthorizedAccess(): AuthRequest
  }
}
```

This data model provides a comprehensive foundation for implementing SOLID principles while maintaining clear separation between domain models, repository interfaces, service contracts, and API specifications. The model supports the planned modular architecture and enables testable, maintainable code.