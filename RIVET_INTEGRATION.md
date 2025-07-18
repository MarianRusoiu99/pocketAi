# Rivet Integration Architecture

This document explains the simplified Rivet integration architecture for this PocketBase + TypeScript application.

## Architecture Overview

### 🏗️ How It Works

```
┌─────────────────┐    HTTP API    ┌─────────────────┐
│                 │ ────────────► │                 │
│  PocketBase     │               │  Rivet Server   │
│  (Port 8090)    │ ◄──────────── │  (Port 3001)    │
│                 │    Results     │                 │
└─────────────────┘                └─────────────────┘
        │                                    │
        │ TypeScript                         │ CLI
        │ Hooks                              │ 
        ▼                                    ▼
┌─────────────────┐                ┌─────────────────┐
│ RivetService    │                │ rivet serve     │
│ - HTTP Client   │                │ - Loads graphs  │
│ - Error Handling│                │ - Validates     │
│ - Type Safety   │                │ - Executes      │
└─────────────────┘                └─────────────────┘
```

### 🎯 Key Benefits

1. **Simple**: HTTP-based communication between services
2. **Reliable**: Rivet CLI handles all workflow execution 
3. **Debuggable**: Easy to test workflows manually via CLI
4. **Scalable**: Rivet server can be moved to separate machine
5. **Type-Safe**: Full TypeScript integration

## Components

### 1. Rivet HTTP Server (`rivet serve`)

- **Purpose**: Serves Rivet workflows as HTTP endpoints
- **Command**: `npx @ironclad/rivet-cli serve ../rivet/ai.rivet-project --port 3001 --dev`
- **Endpoints**:
  - `POST /` - Execute main graph
  - `POST /{graphName}` - Execute specific graph

### 2. RivetService (TypeScript)

- **Location**: `backend/src/services/rivet-service.ts`
- **Purpose**: HTTP client for communicating with Rivet server
- **Features**:
  - Type-safe workflow execution
  - Error handling and retries
  - Input/output format conversion
  - Health checking

### 3. PocketBase Hooks

- **Location**: `backend/hooks/main.pb.ts`
- **Purpose**: Event-driven workflow triggers
- **Example**: Automatically process content when posts are created

## Usage Examples

### 1. Manual Workflow Execution

```bash
# Test a workflow directly via CLI
npx @ironclad/rivet-cli run ../rivet/ai.rivet-project --input content="Hello World"

# Test via HTTP API
curl -X POST http://localhost:3001 \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello World"}'
```

### 2. From TypeScript Code

```typescript
// Simple workflow execution
const result = await rivetService.runWorkflow('content-processor', {
  content: "Hello World",
  metadata: { source: "user_input" }
});

// Pre-defined methods
const analysis = await rivetService.processContent("Hello World");
const moderation = await rivetService.moderateContent("Hello World");
```

### 3. Via API Endpoints

```bash
# Health check (includes Rivet status)
curl http://localhost:8090/api/health

# Test workflow endpoint
curl -X POST http://localhost:8090/api/rivet/test \
  -H "Content-Type: application/json" \
  -d '{"graphName": "content-processor", "input": {"content": "Hello"}}'

# Demo endpoint
curl -X POST http://localhost:8090/api/rivet/demo
```

## Development Workflow

### 1. Start Development Servers

```bash
# Start both PocketBase and Rivet servers
./scripts/dev.sh backend

# Or start everything including frontend
./scripts/dev.sh both
```

This will start:
- Rivet server on `http://localhost:3001`
- PocketBase on `http://localhost:8090`
- Frontend on `http://localhost:5173` (if using "both")

### 2. Create/Edit Workflows

1. Open Rivet application
2. Load `rivet/ai.rivet-project`
3. Create or modify graphs
4. Save the project file
5. The dev server will auto-reload (`--dev` flag)

### 3. Test Workflows

```bash
# Test via CLI
cd backend && npm run rivet:test

# Test via API
curl -X POST http://localhost:8090/api/rivet/demo
```

## Configuration

### Environment Variables

```bash
# Rivet server configuration
RIVET_SERVER_URL=http://localhost:3001
RIVET_TIMEOUT=30100
RIVET_RETRY_ATTEMPTS=3

# Workflow names (customize for your project)
RIVET_WORKFLOW_CONTENT_PROCESSOR=content-processor
RIVET_WORKFLOW_USER_ANALYTICS=user-analytics
RIVET_WORKFLOW_CONTENT_MODERATION=content-moderation

# OpenAI API (for Chat nodes in workflows)
OPENAI_API_KEY=your-api-key
```

### NPM Scripts

```json
{
  "rivet:serve": "npx @ironclad/rivet-cli serve ../rivet/ai.rivet-project --port 3001 --dev",
  "rivet:test": "npx @ironclad/rivet-cli run ../rivet/ai.rivet-project --input test=hello"
}
```

## Error Handling

### 1. Rivet Server Down

- Health check endpoint will report unhealthy
- Workflow calls will fail gracefully
- PocketBase continues working (non-blocking)

### 2. Workflow Errors

- Errors are logged with context
- Failed workflows return error details
- System remains stable

### 3. Development Debugging

```bash
# Check Rivet server logs
tail -f /tmp/pocket_rivet_*.log

# Check PocketBase logs  
tail -f /tmp/pocket_backend_*.log

# Test individual workflows
npx @ironclad/rivet-cli run ../rivet/ai.rivet-project --input test=debug
```

## Migration from Previous Architecture

### What Changed

1. **Removed**: Direct CLI execution from PocketBase hooks
2. **Added**: Rivet HTTP server (`rivet serve`)
3. **Simplified**: HTTP-based communication
4. **Improved**: Better error handling and debugging

### Migration Steps

1. Update environment variables (remove `RIVET_PROJECT_PATH`, add `RIVET_SERVER_URL`)
2. Use new development scripts (`./scripts/dev.sh backend`)
3. Test workflows via new API endpoints
4. Update any custom workflow calls to use HTTP service

## Best Practices

### 1. Workflow Design

- Keep workflows focused and single-purpose
- Use clear input/output naming
- Add Graph Output nodes for all results
- Test workflows individually before integration

### 2. Error Handling

- Always check `result.success` before using data
- Log workflow errors for debugging
- Don't let workflow failures break main application flow

### 3. Performance

- Use appropriate timeouts for workflows
- Consider caching for expensive operations
- Monitor workflow execution costs (if using paid APIs)

### 4. Security

- Don't expose sensitive data in workflow inputs
- Use environment variables for API keys
- Validate inputs before sending to workflows

## Troubleshooting

### Common Issues

1. **"Connection refused"**: Rivet server not running
   - Solution: Start with `./scripts/dev.sh backend`

2. **"Graph not found"**: Graph name mismatch
   - Solution: Check graph names in Rivet application

3. **"Timeout"**: Workflow taking too long
   - Solution: Increase `RIVET_TIMEOUT` or optimize workflow

4. **"OpenAI API error"**: Missing or invalid API key
   - Solution: Set `OPENAI_API_KEY` environment variable

### Debug Commands

```bash
# Check if Rivet server is running
curl http://localhost:3001

# Check PocketBase health including Rivet status
curl http://localhost:8090/api/health

# Test simple workflow
curl -X POST http://localhost:8090/api/rivet/demo

# Check logs
./scripts/dev.sh backend  # Watch live logs
```

## Next Steps

1. **Create Custom Workflows**: Design workflows specific to your application
2. **Add Event Triggers**: Use PocketBase hooks to trigger workflows automatically
3. **Implement Caching**: Cache expensive workflow results
4. **Add Monitoring**: Track workflow performance and costs
5. **Scale Up**: Move Rivet server to dedicated machine for production
