# API Client Architecture

This document describes the new modular API client architecture implemented for the PocketBase React application, following the pattern from [alchemist-ui](https://github.com/peerconcept/alchemist-ui/tree/staging/src/app/api/client).

## Overview

The API layer has been refactored from a monolithic service file into a modular, scalable architecture with the following benefits:

- **Modular**: Each resource has its own API slice
- **DRY**: Shared utilities and base classes reduce code duplication
- **Low Cognitive Complexity**: Clear separation of concerns
- **Type Safe**: Full TypeScript support with comprehensive type definitions
- **Extensible**: Easy to add new resources and endpoints
- **Testable**: Each slice can be tested independently

## Architecture

```
src/api/
├── index.ts                    # Main export file
├── ApiExampleComponent.tsx     # Usage examples
└── client/
    ├── index.ts               # Client exports
    ├── ApiClient.ts           # Base HTTP client
    ├── ApiRoutes.ts           # Centralized route definitions
    ├── CrudApi.ts             # Base CRUD operations
    └── slices/                # Resource-specific API slices
        ├── AnalyticsApi.ts
        ├── AuthApi.ts
        ├── PostsApi.ts
        ├── CommentsApi.ts
        └── RealtimeApi.ts
```

## Core Components

### ApiClient

The base HTTP client built on axios with:
- Request/response interception
- Error handling
- Authentication token management
- Query parameter serialization
- Response wrapping with success/error states

```typescript
import { ApiClient } from '@/api'

const response = await ApiClient.get<User>('user/profile')
if (response.success) {
  console.log(response.result) // User data
} else {
  console.error(response.error) // Error message
}
```

### ApiRoutes

Centralized route definitions for all endpoints:

```typescript
import ApiRoutes from '@/api/client/ApiRoutes'

// Static routes
ApiRoutes.auth.login // 'auth/login'

// Dynamic routes with parameters
ApiRoutes.posts.item('123') // 'posts/123'

// Routes with query parameters
ApiRoutes.posts.list({ page: 1, limit: 10 }) // 'posts?page=1&limit=10'
```

### CrudApi

Base class providing standard CRUD operations:

```typescript
import CrudApi from '@/api/client/CrudApi'

class MyResourceApi extends CrudApi<MyResource> {
  constructor() {
    super({ url: 'my-resource' })
  }
  
  // Inherits: get, list, create, update, delete, search, etc.
}
```

### API Slices

Resource-specific API modules with:
- Full type definitions
- CRUD operations
- Custom endpoints
- Business logic methods

## Usage Examples

### Authentication

```typescript
import { AuthApi } from '@/api'

// Login
const loginResponse = await AuthApi.login({
  email: 'user@example.com',
  password: 'password'
})

if (loginResponse.success) {
  // Store token
  localStorage.setItem('token', loginResponse.result.token)
  console.log('Logged in:', loginResponse.result.user)
}

// Get current user
const userResponse = await AuthApi.getCurrentUser()
```

### Posts Management

```typescript
import { PostsApi } from '@/api'

// List posts with pagination
const postsResponse = await PostsApi.list({
  page: 1,
  limit: 10,
  category: 'tech',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

// Create a post
const createResponse = await PostsApi.create({
  title: 'My New Post',
  content: 'Post content here...',
  status: 'published'
})

// Like a post
const likeResponse = await PostsApi.like('post-id')
```

### Analytics Tracking

```typescript
import { AnalyticsApi } from '@/api'

// Get analytics stats
const statsResponse = await AnalyticsApi.getStats()

// Track events
await AnalyticsApi.trackEvent({
  userId: 'user-id',
  eventType: 'page_view',
  eventData: { page: '/dashboard' },
  sessionId: 'session-id'
})

// Export analytics data
const exportResponse = await AnalyticsApi.exportData({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  format: 'csv'
})
```

### Comments

```typescript
import { CommentsApi } from '@/api'

// Get comments for a post
const commentsResponse = await CommentsApi.getByPost('post-id', {
  page: 1,
  limit: 20,
  includeReplies: true
})

// Add a comment
const commentResponse = await CommentsApi.create({
  postId: 'post-id',
  content: 'Great post!'
})

// Reply to a comment
const replyResponse = await CommentsApi.reply(
  'comment-id',
  'Thanks for sharing!',
  'post-id'
)
```

### Real-time Communication

```typescript
import { RealtimeApi } from '@/api'

// Connect to realtime
const connectionResponse = await RealtimeApi.connect()

// Subscribe to a channel
await RealtimeApi.subscribe({
  channel: 'notifications',
  events: ['new_comment', 'new_like']
})

// Publish a message
await RealtimeApi.publish({
  channel: 'chat',
  event: 'message',
  data: { text: 'Hello everyone!' }
})
```

## Error Handling

All API calls return a consistent response format:

```typescript
interface ApiResponse<T> {
  success: boolean
  result: T        // Data when success = true
  error: string    // Error message when success = false
}
```

Example error handling:

```typescript
const response = await PostsApi.get('invalid-id')

if (!response.success) {
  // Handle error
  console.error('Failed to fetch post:', response.error)
  showErrorToast(response.error)
  return
}

// Use data
const post = response.result
```

## Type Safety

All API slices include comprehensive TypeScript types:

```typescript
// Import types
import type { 
  Post, 
  CreatePostRequest, 
  PostsListParams 
} from '@/api'

// Use in components
const [posts, setPosts] = useState<Post[]>([])

const handleCreatePost = async (data: CreatePostRequest) => {
  const response = await PostsApi.create(data)
  // TypeScript ensures type safety
}
```

## Migration from Legacy Services

To migrate from the old services:

```typescript
// Old way
import { AnalyticsService } from '@/services/analytics'
const stats = await new AnalyticsService().getStats()

// New way
import { AnalyticsApi } from '@/api'
const response = await AnalyticsApi.getStats()
if (response.success) {
  const stats = response.result
}
```

## Adding New Resources

To add a new resource:

1. **Create the API slice** in `src/api/client/slices/MyResourceApi.ts`
2. **Add routes** to `ApiRoutes.ts`
3. **Define types** in the slice file
4. **Export** from `src/api/client/index.ts`
5. **Write tests** for the new slice

Example:

```typescript
// src/api/client/slices/MyResourceApi.ts
import { ApiClient } from '../ApiClient'
import ApiRoutes from '../ApiRoutes'

export interface MyResource {
  id: string
  name: string
  // ... other fields
}

const MyResourceApi = {
  list: () => ApiClient.get<MyResource[]>('my-resource'),
  get: (id: string) => ApiClient.get<MyResource>(`my-resource/${id}`),
  create: (data: Omit<MyResource, 'id'>) => 
    ApiClient.post<MyResource>('my-resource', { data }),
  // ... other methods
}

export default MyResourceApi
```

## Best Practices

1. **Always handle errors** - Check `response.success` before using data
2. **Use TypeScript types** - Import and use the provided types
3. **Keep slices focused** - Each slice should handle one resource
4. **Add JSDoc comments** - Document complex methods
5. **Test API slices** - Write unit tests for each slice
6. **Use query parameters** - Leverage the query parameter helpers
7. **Handle loading states** - Show loading indicators during API calls

## Testing

Example test for an API slice:

```typescript
import { ApiClient } from '@/api/client/ApiClient'
import PostsApi from '@/api/client/slices/PostsApi'

jest.mock('@/api/client/ApiClient')

describe('PostsApi', () => {
  it('should fetch posts list', async () => {
    const mockResponse = { success: true, result: { posts: [] } }
    jest.spyOn(ApiClient, 'get').mockResolvedValue(mockResponse)

    const result = await PostsApi.list({ page: 1 })

    expect(ApiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('posts'),
      expect.objectContaining({ queryParams: { page: 1 } })
    )
    expect(result).toEqual(mockResponse)
  })
})
```

## Configuration

The API client uses environment variables for configuration:

```env
VITE_API_URL=http://localhost:8090
```

## Future Enhancements

- [ ] Request caching and invalidation
- [ ] Optimistic updates
- [ ] Request deduplication
- [ ] Retry logic with exponential backoff
- [ ] Request/response interceptors for logging
- [ ] Mock API responses for development
- [ ] GraphQL integration
- [ ] WebSocket real-time updates integration
