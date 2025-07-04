# Migration Guide: Legacy Services to New API Client

This guide helps you migrate from the legacy services to the new modular API client architecture.

## Quick Reference

| Legacy Service | New API Slice | Import Path |
|---|---|---|
| `AnalyticsService` | `AnalyticsApi` | `import { AnalyticsApi } from '@/api'` |
| `AuthService` | `AuthApi` | `import { AuthApi } from '@/api'` |
| `PostsService` | `PostsApi` | `import { PostsApi } from '@/api'` |
| `CommentsService` | `CommentsApi` | `import { CommentsApi } from '@/api'` |
| `RealtimeService` | `RealtimeApi` | `import { RealtimeApi } from '@/api'` |

## Migration Examples

### Analytics Service

**Before (Legacy):**
```typescript
import { AnalyticsService } from '@/services'

const analyticsService = new AnalyticsService()
const stats = await analyticsService.getStats()
const userProfile = await analyticsService.getUserProfile()
```

**After (New API):**
```typescript
import { AnalyticsApi } from '@/api'

const statsResponse = await AnalyticsApi.getStats()
if (statsResponse.success) {
  const stats = statsResponse.result
}

const userStatsResponse = await AnalyticsApi.getUserStats()
if (userStatsResponse.success) {
  const userStats = userStatsResponse.result
}
```

### Auth Service

**Before (Legacy):**
```typescript
import { AuthService } from '@/services'

const authService = new AuthService()
const user = await authService.login(email, password)
const currentUser = await authService.getCurrentUser()
await authService.logout()
```

**After (New API):**
```typescript
import { AuthApi } from '@/api'

const loginResponse = await AuthApi.login({ email, password })
if (loginResponse.success) {
  const { user, token } = loginResponse.result
  localStorage.setItem('token', token)
}

const userResponse = await AuthApi.getCurrentUser()
if (userResponse.success) {
  const user = userResponse.result
}

await AuthApi.logout()
```

### Posts Service

**Before (Legacy):**
```typescript
import { PostsService } from '@/services'

const postsService = new PostsService()
const posts = await postsService.getPosts(1, 10)
const post = await postsService.getPost('post-id')
const newPost = await postsService.createPost({
  title: 'New Post',
  content: 'Content...'
})
```

**After (New API):**
```typescript
import { PostsApi } from '@/api'

const postsResponse = await PostsApi.list({ page: 1, limit: 10 })
if (postsResponse.success) {
  const posts = postsResponse.result.posts
}

const postResponse = await PostsApi.get('post-id')
if (postResponse.success) {
  const post = postResponse.result
}

const createResponse = await PostsApi.create({
  title: 'New Post',
  content: 'Content...',
  status: 'published'
})
if (createResponse.success) {
  const newPost = createResponse.result
}
```

### Comments Service

**Before (Legacy):**
```typescript
import { CommentsService } from '@/services'

const commentsService = new CommentsService()
const comments = await commentsService.getComments('post-id')
const comment = await commentsService.createComment({
  postId: 'post-id',
  content: 'Great post!'
})
```

**After (New API):**
```typescript
import { CommentsApi } from '@/api'

const commentsResponse = await CommentsApi.getByPost('post-id')
if (commentsResponse.success) {
  const comments = commentsResponse.result.comments
}

const commentResponse = await CommentsApi.create({
  postId: 'post-id',
  content: 'Great post!'
})
if (commentResponse.success) {
  const comment = commentResponse.result
}
```

## Key Differences

### 1. Response Format

**Legacy**: Direct return of data or throws errors
```typescript
const data = await service.getData() // Returns data directly
```

**New API**: Consistent response wrapper
```typescript
const response = await Api.getData()
if (response.success) {
  const data = response.result
} else {
  console.error(response.error)
}
```

### 2. Error Handling

**Legacy**: Try/catch blocks for error handling
```typescript
try {
  const data = await service.getData()
  // Use data
} catch (error) {
  console.error('Error:', error)
}
```

**New API**: Success/error checking
```typescript
const response = await Api.getData()
if (response.success) {
  // Use response.result
} else {
  // Handle response.error
}
```

### 3. Type Safety

**Legacy**: Limited TypeScript support
```typescript
const posts = await postsService.getPosts() // any[]
```

**New API**: Full TypeScript support
```typescript
const response = await PostsApi.list() // ApiResponse<PostsListResponse>
if (response.success) {
  const posts = response.result.posts // Post[]
}
```

### 4. Configuration

**Legacy**: Multiple configuration points
```typescript
// Different config for each service
```

**New API**: Centralized configuration
```typescript
// Single ApiClient configuration
// Environment variables: VITE_API_URL
```

## Step-by-Step Migration

### 1. Install Dependencies

The new API client requires axios:
```bash
npm install axios
```

### 2. Update Imports

Replace legacy service imports:
```typescript
// Remove
import { AnalyticsService, AuthService } from '@/services'

// Add
import { AnalyticsApi, AuthApi } from '@/api'
```

### 3. Update Component Logic

Replace service calls with API calls:
```typescript
// Before
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

const fetchData = async () => {
  setLoading(true)
  try {
    const result = await analyticsService.getStats()
    setData(result)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

// After
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

const fetchData = async () => {
  setLoading(true)
  const response = await AnalyticsApi.getStats()
  
  if (response.success) {
    setData(response.result)
    setError(null)
  } else {
    setError(response.error)
  }
  setLoading(false)
}
```

### 4. Update Type Definitions

Replace legacy types with new types:
```typescript
// Before
import type { User, Post } from '@/services/types'

// After
import type { User, Post } from '@/api'
```

### 5. Test Migration

1. Update one component at a time
2. Test each component thoroughly
3. Check for any breaking changes
4. Update error handling logic

## React Hook Examples

### Custom Hook for Data Fetching

**New API with Custom Hook:**
```typescript
import { useState, useEffect } from 'react'
import { AnalyticsApi, type AnalyticsStats } from '@/api'

export const useAnalyticsStats = () => {
  const [data, setData] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    const response = await AnalyticsApi.getStats()
    
    if (response.success) {
      setData(response.result)
    } else {
      setError(response.error)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { data, loading, error, refetch: fetchStats }
}
```

### Generic API Hook

```typescript
import { useState, useEffect } from 'react'
import type { ApiResponse } from '@/api'

export const useApiCall = <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  immediate = true
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiCall()
      
      if (response.success) {
        setData(response.result)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }
    
    setLoading(false)
  }

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate])

  return { data, loading, error, execute }
}

// Usage
const { data: posts, loading, error } = useApiCall(() => PostsApi.list())
```

## Common Pitfalls

### 1. Forgetting Success Check

❌ **Wrong:**
```typescript
const response = await PostsApi.list()
const posts = response.result // Might be undefined if error
```

✅ **Correct:**
```typescript
const response = await PostsApi.list()
if (response.success) {
  const posts = response.result
}
```

### 2. Not Handling Errors

❌ **Wrong:**
```typescript
const response = await PostsApi.list()
// No error handling
```

✅ **Correct:**
```typescript
const response = await PostsApi.list()
if (!response.success) {
  console.error('Failed to fetch posts:', response.error)
  showErrorToast(response.error)
  return
}
```

### 3. Type Confusion

❌ **Wrong:**
```typescript
import type { User } from '@/services/types' // Legacy type
import { AuthApi } from '@/api'

const response = await AuthApi.getCurrentUser()
const user: User = response.result // Type mismatch
```

✅ **Correct:**
```typescript
import { AuthApi, type User } from '@/api'

const response = await AuthApi.getCurrentUser()
if (response.success) {
  const user: User = response.result // Correct type
}
```

## Timeline and Strategy

### Phase 1: Setup (Week 1)
- [ ] Install axios dependency
- [ ] Verify new API client structure
- [ ] Update build configuration if needed

### Phase 2: Critical Components (Week 2)
- [ ] Migrate authentication logic
- [ ] Update main dashboard components
- [ ] Test user flows

### Phase 3: Feature Components (Week 3-4)
- [ ] Migrate posts management
- [ ] Update comments system
- [ ] Migrate analytics pages

### Phase 4: Cleanup (Week 5)
- [ ] Remove legacy service files
- [ ] Update documentation
- [ ] Final testing and optimization

## Support

If you encounter issues during migration:

1. Check the [API README](./README.md) for detailed usage
2. Look at the [example component](./ApiExampleComponent.tsx)
3. Review the type definitions in each API slice
4. Test with the provided example endpoints

## Benefits After Migration

- ✅ Better type safety with full TypeScript support
- ✅ Consistent error handling across the application
- ✅ Modular architecture for easier maintenance
- ✅ Better testing capabilities
- ✅ Easier to add new features and endpoints
- ✅ Reduced code duplication
- ✅ Clearer separation of concerns
