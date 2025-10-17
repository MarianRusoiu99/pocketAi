# PocketAI Copilot Instructions

## Project Architecture
This is a simplified AI story generation app with PocketBase Go extension backend and React frontend.

**Core Components:**
- `pocketbase/main.go` - PocketBase Go extension with custom `/api/generate-story` and `/api/test` endpoints
- `client/src/pages/story-generator/` - Single-page React app for story generation
- `client/src/api/client/slices/StoriesApi.ts` - Simplified API layer with only story generation endpoints
- `rivet/` - Rivet AI project for story generation workflow

## Development Workflow

**Essential Commands (run from project root):**
```bash
./scripts/dev.sh both          # Start all servers (PocketBase + Frontend + Rivet)
./scripts/dev.sh pocketbase    # PocketBase only (port 8090)
./scripts/dev.sh frontend      # Frontend only (port 5173)
./scripts/setup.sh            # First-time setup
```

**Architecture Flow:**
1. Frontend (React) → API call via `StoriesApi.generateStory()`
2. PocketBase Go extension → HTTP request to Rivet AI service (port 3000)
3. Rivet processes story generation with retry logic (3 attempts)
4. Response parsed and returned to frontend with markdown JSON extraction

## Project-Specific Patterns

**Environment Management:**
- Centralized `.env.local` at root with symlinks to `pocketbase/.env.local` and `client/.env.local`
- Required vars: `STORY_API_URL=http://localhost:3000`, `OPENAI_API_KEY`, `RIVET_PORT=3000`

**API Response Handling:**
- PocketBase main.go implements sophisticated retry logic for "control-flow-excluded" responses
- Automatic JSON extraction from markdown code blocks (```json...```)
- Fallback to `story_text` when JSON parsing fails

**Frontend Simplicity:**
- Single route (`/`) pointing to `StoryGenerator` component
- Only `StoriesApi` slice remains - all other API slices removed
- TypeScript interfaces: `StoryRequest`, `StoryResponse`, `Story`, `StoryChapter`

**Go Extension Pattern:**
```go
app.OnServe().BindFunc(func(se *core.ServeEvent) error {
    se.Router.POST("/api/generate-story", func(e *core.RequestEvent) error {
        // Custom endpoint logic with retry mechanism
    })
})
```

## Key Integration Points

**PocketBase → Rivet Communication:**
- Uses `STORY_API_URL` environment variable (defaults to `http://localhost:3000`)
- Implements 3-attempt retry with 2-second delays
- Detects `"type": "control-flow-excluded"` responses for retries

**Frontend → PocketBase API:**
- Uses simplified `ApiClient.post<StoryResponse>()` pattern
- Routes defined in `ApiRoutes.stories.generate` and `ApiRoutes.stories.test`
- Response structure handles both `story` object and `story_text` fallback

**Error Handling:**
- PocketBase logs all retry attempts with detailed HTTP response info
- Frontend displays parsing errors and raw content when structured parsing fails
- Services use `withErrorHandling()` wrapper for consistent error logging

## Development Notes

**File Structure (simplified):**
- No authentication, analytics, or complex routing - single-purpose story generator
- `client/src/components/` contains only essential UI components
- All demo files and unused API slices have been removed

**Testing:**
- Test scripts: `test-story-endpoint.sh`, `test-retry-logic.sh`, `test-json-parsing.sh`
- PocketBase test endpoint: `GET /api/test` returns basic health check

**Build & Deploy:**
```bash
./scripts/build.sh     # Build both frontend and Go extension
./scripts/start.sh     # Start production PocketBase server
```