# PocketAI Copilot Instructions

## Project Architecture

This is a **simplified AI story generation app** with a streamlined 3-tier architecture:
- **PocketBase Go Extension** (`pocketbase/main.go`) - Custom backend with story generation endpoints
- **React Frontend** (`client/src/pages/story-generator/`) - Single-page story generation interface  
- **Rivet AI Service** (`rivet/`) - AI workflow for story generation with OpenAI integration

## Essential Development Commands

Run all commands from project root:

```bash
./scripts/dev.sh both          # Start all services (PocketBase + Frontend + Rivet)
./scripts/dev.sh pocketbase    # PocketBase only (default port 8090)
./scripts/dev.sh frontend      # Frontend only (port 5173)
./scripts/setup.sh            # First-time environment setup
```

**Key Ports:**
- PocketBase: `http://localhost:8090` (API at `/api/`)
- Frontend: `http://localhost:5173`
- Rivet AI: `http://localhost:3000` (configured via `STORY_API_URL`)

## Project-Specific Patterns

### Simplified API Architecture
The project underwent **significant simplification** - only story generation remains:

```typescript
// client/src/api/client/ApiRoutes.ts - ONLY these routes exist
const ApiRoutes = {
  stories: {
    generate: 'generate-story',
    test: 'test',
  },
}

// client/src/api/client/slices/StoriesApi.ts - Single API slice
StoriesApi.generateStory(requestData: StoryRequest)
StoriesApi.testConnection()
```

**Removed:** All auth, analytics, posts, comments, and realtime API slices.

### Environment Management Pattern
Centralized `.env.local` with **symlinks** to components:
```bash
.env.local                    # Master config
pocketbase/.env.local  →  ../.env.local  # Symlink
client/.env.local      →  ../.env.local  # Symlink
```

Required variables: `STORY_API_URL=http://localhost:3000`, `OPENAI_API_KEY`, `RIVET_PORT=3000`

### PocketBase Go Extension Pattern

```go
// pocketbase/main.go - Custom endpoint registration
app.OnServe().BindFunc(func(se *core.ServeEvent) error {
    se.Router.POST("/api/generate-story", func(e *core.RequestEvent) error {
        // Sophisticated retry logic with control-flow-excluded detection
        // Automatic JSON extraction from markdown code blocks
        // 3 attempts with 2-second delays
    })
})
```

**Key Features:**
- Detects `"type": "control-flow-excluded"` responses from Rivet
- Extracts JSON from markdown blocks (````json...````)
- Comprehensive logging for debugging AI integration

### Frontend Simplification
Single route architecture - **no complex routing**:
```typescript
// client/src/router.tsx
export const routerObjects: RouteObject[] = [
  { path: '/', Component: StoryGenerator }  // Only route
]
```

**Services simplified** to essential utilities only:
- `pb` PocketBase instance
- `withErrorHandling()` wrapper
- `API_CONFIG` and logging utilities

## Critical Integration Points

### Story Generation Flow
1. **Frontend** → `StoriesApi.generateStory()` → **PocketBase** (`/api/generate-story`)
2. **PocketBase** → HTTP POST to `STORY_API_URL` (Rivet AI service)
3. **Rivet** processes story with retry logic → JSON response (potentially in markdown)
4. **PocketBase** parses JSON, handles retries → **Frontend** displays structured story

### Error Handling Patterns
- **PocketBase**: Logs all retry attempts with detailed HTTP responses
- **Frontend**: Handles both `story` object and `story_text` fallback gracefully
- **Rivet Integration**: Automatic retry for control-flow-excluded responses

### TypeScript Interfaces
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
  story?: Story              // Parsed JSON object
  story_text?: string        // Fallback raw text
  attempts: number           // Retry count
}
```

## Development Notes

**Project Structure (Post-Simplification):**
- No authentication, user management, or complex features
- Single-purpose: AI story generation only
- Minimal dependencies and clean architecture
- All demo files and unused components removed

**Testing Endpoints:**
- `GET /api/test` - PocketBase health check
- Test scripts available in project root for story generation validation