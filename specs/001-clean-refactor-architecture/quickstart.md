# Quickstart Guide: Clean and Refactor Architecture

**Generated**: 2025-10-17 | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

This guide provides step-by-step instructions for implementing the architecture refactoring according to SOLID principles and the established project constitution.

## Prerequisites

- Go 1.23+ installed
- Node.js 18+ and npm
- Basic understanding of SOLID principles
- Familiarity with PocketBase and React

## Implementation Phases

### Phase 1: Immediate Cleanup (Low Risk)

#### 1.1 Remove Migration Artifacts

**Estimated Time**: 30 minutes

```bash
# Remove demo and migration files
rm -f client/src/api/MigrationDemoComponent.tsx
rm -f client/src/api/MIGRATION.md
rm -f client/src/services/pocketbase.ts

# Verify no imports reference these files
grep -r "MigrationDemoComponent\|MIGRATION.md\|services/pocketbase" client/src/
```

**Expected Result**: Clean codebase with no migration artifacts

#### 1.2 Fix Type Safety Issues

**Estimated Time**: 15 minutes

```bash
# Fix @ts-ignore in router
cd client/src
# Edit router.tsx to properly type the Component property
```

**Code Change**:
```typescript
// Before (in router.tsx)
// @ts-ignore TODO: better type support
const getLayout = router.Component?.getLayout || getDefaultLayout

// After
const getLayout = (router.Component as any)?.getLayout || getDefaultLayout
```

#### 1.3 Audit Dependencies

**Estimated Time**: 45 minutes

```bash
# Analyze frontend dependencies
cd client
npm audit
npx depcheck

# Check for unused imports
npx eslint src/ --ext .ts,.tsx --fix

# Analyze Go dependencies
cd ../pocketbase
go mod tidy
go mod why -m github.com/pocketbase/pocketbase
```

**Expected Result**: Clean dependency tree with no unused packages

### Phase 2: Backend Modularization (Medium Risk)

#### 2.1 Create Service Layer Structure

**Estimated Time**: 2 hours

```bash
# Create new directory structure
mkdir -p pocketbase/src/{handlers,services,repositories,models,interfaces,middleware}
mkdir -p pocketbase/tests/{integration,handlers,services}
```

#### 2.2 Extract Interfaces

**Estimated Time**: 1 hour

Copy the contract interfaces from `specs/001-clean-refactor-architecture/contracts/` to `pocketbase/src/interfaces/`:

```bash
cp specs/001-clean-refactor-architecture/contracts/*.go pocketbase/src/interfaces/
```

#### 2.3 Implement Service Layer

**Estimated Time**: 3 hours

**Create**: `pocketbase/src/services/story_generation_service.go`

```go
package services

import (
    "context"
    "github.com/your-repo/pocket/src/interfaces"
)

type StoryGenerationServiceImpl struct {
    rivetClient interfaces.RivetClient
    storyRepo   interfaces.StoryRepository
    config      *interfaces.RivetConfig
}

func NewStoryGenerationService(
    rivetClient interfaces.RivetClient,
    storyRepo interfaces.StoryRepository,
    config *interfaces.RivetConfig,
) interfaces.StoryGenerationService {
    return &StoryGenerationServiceImpl{
        rivetClient: rivetClient,
        storyRepo:   storyRepo,
        config:      config,
    }
}

func (s *StoryGenerationServiceImpl) GenerateStory(ctx context.Context, request interfaces.StoryRequest) (*interfaces.StoryResponse, error) {
    // Implement story generation logic
    // 1. Validate request
    // 2. Call Rivet service
    // 3. Process response
    // 4. Save to database
    // 5. Return response
}
```

#### 2.4 Implement Repository Layer

**Estimated Time**: 2 hours

**Create**: `pocketbase/src/repositories/story_repository.go`

```go
package repositories

import (
    "context"
    "github.com/pocketbase/pocketbase/core"
    "github.com/your-repo/pocket/src/interfaces"
)

type StoryRepositoryImpl struct {
    app core.App
}

func NewStoryRepository(app core.App) interfaces.StoryRepository {
    return &StoryRepositoryImpl{app: app}
}

func (r *StoryRepositoryImpl) Save(ctx context.Context, story interfaces.Story) (*interfaces.Story, error) {
    // Implement save logic using PocketBase
}
```

#### 2.5 Create Handlers

**Estimated Time**: 1.5 hours

**Create**: `pocketbase/src/handlers/story_handler.go`

```go
package handlers

import (
    "github.com/pocketbase/pocketbase/core"
    "github.com/your-repo/pocket/src/interfaces"
)

type StoryHandler struct {
    storyService interfaces.StoryGenerationService
}

func NewStoryHandler(storyService interfaces.StoryGenerationService) *StoryHandler {
    return &StoryHandler{storyService: storyService}
}

func (h *StoryHandler) GenerateStory(e *core.RequestEvent) error {
    // Implement HTTP handler logic
    // 1. Parse request
    // 2. Call service
    // 3. Return response
}
```

#### 2.6 Refactor main.go

**Estimated Time**: 1 hour

**Update**: `pocketbase/main.go`

```go
package main

import (
    "log"
    "github.com/pocketbase/pocketbase"
    "github.com/pocketbase/pocketbase/core"
    "github.com/your-repo/pocket/src/handlers"
    "github.com/your-repo/pocket/src/services"
    "github.com/your-repo/pocket/src/repositories"
)

func main() {
    app := pocketbase.New()

    // Dependency injection setup
    storyRepo := repositories.NewStoryRepository(app)
    rivetClient := services.NewRivetClient(getRivetConfig())
    storyService := services.NewStoryGenerationService(rivetClient, storyRepo, getRivetConfig())
    storyHandler := handlers.NewStoryHandler(storyService)

    // Register routes
    app.OnServe().BindFunc(func(se *core.ServeEvent) error {
        se.Router.POST("/api/generate-story", storyHandler.GenerateStory)
        return nil
    })

    if err := app.Start(); err != nil {
        log.Fatal(err)
    }
}
```

### Phase 3: Frontend Organization (Medium Risk)

#### 3.1 Feature-Based Organization

**Estimated Time**: 2 hours

```bash
# Create feature directories
mkdir -p client/src/features/{auth,workflows,stories}
mkdir -p client/src/shared/{api,components,services,types}

# Move existing components
mv client/src/pages/story-generator client/src/features/stories/
mv client/src/api client/src/shared/api
mv client/src/services client/src/shared/services
```

#### 3.2 Create Custom Hooks

**Estimated Time**: 1.5 hours

**Create**: `client/src/features/stories/hooks/useStoryGeneration.ts`

```typescript
import { useState, useCallback } from 'react'
import { StoriesApi } from '@/shared/api'

export function useStoryGeneration() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const generateStory = useCallback(async (request: StoryRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await StoriesApi.generateStory(request)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])
  
  return { generateStory, loading, error }
}
```

#### 3.3 Update Imports

**Estimated Time**: 45 minutes

```bash
# Update all import statements to use new paths
find client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/services|@/shared/services|g'
find client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/api|@/shared/api|g'
```

### Phase 4: Testing Implementation

#### 4.1 Backend Testing

**Estimated Time**: 3 hours

**Create**: `pocketbase/tests/services/story_generation_service_test.go`

```go
package services_test

import (
    "context"
    "testing"
    "github.com/stretchr/testify/mock"
    "github.com/your-repo/pocket/src/services"
    "github.com/your-repo/pocket/tests/mocks"
)

func TestStoryGenerationService_GenerateStory(t *testing.T) {
    // Arrange
    mockRivetClient := &mocks.RivetClient{}
    mockStoryRepo := &mocks.StoryRepository{}
    service := services.NewStoryGenerationService(mockRivetClient, mockStoryRepo, &config)
    
    // Set up expectations
    mockRivetClient.On("ExecuteWorkflow", mock.Anything, mock.Anything).Return(&response, nil)
    mockStoryRepo.On("Save", mock.Anything, mock.Anything).Return(&story, nil)
    
    // Act
    result, err := service.GenerateStory(context.Background(), request)
    
    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, result)
    mockRivetClient.AssertExpectations(t)
    mockStoryRepo.AssertExpectations(t)
}
```

#### 4.2 Frontend Testing

**Estimated Time**: 2 hours

**Create**: `client/src/features/stories/__tests__/StoryGenerator.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StoryGenerator } from '../StoryGenerator'
import { useStoryGeneration } from '../hooks/useStoryGeneration'

jest.mock('../hooks/useStoryGeneration')

describe('StoryGenerator', () => {
  it('should generate story when form is submitted', async () => {
    const mockGenerateStory = jest.fn().mockResolvedValue({ success: true })
    
    ;(useStoryGeneration as jest.Mock).mockReturnValue({
      generateStory: mockGenerateStory,
      loading: false,
      error: null
    })
    
    render(<StoryGenerator />)
    
    fireEvent.click(screen.getByText('Generate Story'))
    
    await waitFor(() => {
      expect(mockGenerateStory).toHaveBeenCalled()
    })
  })
})
```

## Quality Gates

### Before Each Phase

1. **Run all tests**: `npm test && go test ./...`
2. **Check linting**: `npm run lint && golangci-lint run`
3. **Verify build**: `npm run build && go build`
4. **Constitution check**: Verify all SOLID principles are followed

### After Each Phase

1. **Integration test**: Test full story generation flow
2. **Performance check**: Measure build times and response times
3. **Documentation update**: Update relevant documentation
4. **Git commit**: Commit changes with descriptive messages

## Common Issues and Solutions

### Issue: Import Errors After Refactoring

**Solution**:
```bash
# Update TypeScript path mapping in tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/shared/*": ["./src/shared/*"],
      "@/features/*": ["./src/features/*"]
    }
  }
}
```

### Issue: Go Module Import Errors

**Solution**:
```bash
# Initialize proper Go module
cd pocketbase
go mod init github.com/your-repo/pocket
go mod tidy
```

### Issue: Test Dependencies

**Solution**:
```bash
# Install testing dependencies
go get github.com/stretchr/testify/mock
go get github.com/stretchr/testify/assert

npm install --save-dev @testing-library/react @testing-library/jest-dom
```

## Validation Checklist

### SOLID Principles Compliance

- [ ] **SRP**: Each class/function has a single responsibility
- [ ] **OCP**: New workflow types can be added without modifying existing code
- [ ] **LSP**: All implementations are substitutable with their interfaces
- [ ] **ISP**: Interfaces are small and client-specific
- [ ] **DIP**: Dependencies are injected, not instantiated directly

### Code Quality

- [ ] No `@ts-ignore` or `any` types (except where justified)
- [ ] Zero linting errors
- [ ] All tests passing
- [ ] No unused imports or dependencies
- [ ] Consistent error handling patterns

### Functionality

- [ ] Story generation works end-to-end
- [ ] Authentication flow unchanged
- [ ] Notifications working
- [ ] Email functionality preserved
- [ ] Development scripts working

### Performance

- [ ] Build time improved by at least 20%
- [ ] No regression in response times
- [ ] Developer setup under 10 minutes

## Rollback Plan

If issues are encountered:

1. **Immediate rollback**: `git reset --hard HEAD~1`
2. **Phase rollback**: Checkout the commit before the problematic phase
3. **Selective rollback**: Use `git revert` for specific commits
4. **Manual rollback**: Restore backup files for critical components

## Next Steps

After completing this quickstart:

1. **Monitor performance** for 48 hours
2. **Gather team feedback** on new architecture
3. **Plan Phase 2 enhancements** (advanced patterns, performance optimization)
4. **Update documentation** with lessons learned
5. **Prepare for production deployment**

## Support and Resources

- **Architecture Documentation**: `docs/GO_ARCHITECTURE.md`
- **SOLID Principles Guide**: `.specify/memory/constitution.md`
- **Testing Examples**: `tests/` directories in each component
- **Common Patterns**: `specs/001-clean-refactor-architecture/contracts/`

This quickstart ensures systematic implementation while maintaining the constitutional principles and minimizing risk through incremental changes and comprehensive testing.