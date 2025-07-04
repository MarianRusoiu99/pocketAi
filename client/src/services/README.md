# PocketBase Services - Modular Architecture

This directory contains a clean, modular PocketBase service layer that follows DRY principles and keeps cognitive complexity low.

## 📁 Structure

```
services/
├── config.ts         # Configuration and constants
├── logger.ts          # Centralized logging utility
├── types.ts           # TypeScript type definitions
├── base.ts            # Core utilities and PocketBase instance
├── auth.ts            # Authentication service
├── posts.ts           # Posts management service
├── comments.ts        # Comments management service
├── realtime.ts        # Real-time subscriptions service
├── analytics.ts       # Analytics and stats service
├── index.ts           # Main exports and service instances
├── example.tsx        # Usage example component
└── pocketbase.ts      # Legacy file (deprecated)
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { getServices, login, createPost, getPosts } from './services'

// Use convenience functions
const posts = await getPosts()
await login('user@example.com', 'password')
await createPost({ title: 'Hello', content: 'World', published: true })

// Or use service instances
const services = getServices()
const user = await services.auth.login('user@example.com', 'password')
const newPost = await services.posts.createPost({ title: 'Hello', content: 'World' })
```

### React Component Example

```typescript
import React, { useEffect, useState } from 'react'
import { getServices, getCurrentUser } from './services'

function MyComponent() {
  const [posts, setPosts] = useState([])
  const services = getServices()

  useEffect(() => {
    // Load data
    loadPosts()
    
    // Set up real-time updates
    services.realtime.subscribeToNewPosts((newPost) => {
      setPosts(prev => [newPost, ...prev])
    })

    // Cleanup
    return () => services.realtime.unsubscribeAll()
  }, [])

  async function loadPosts() {
    const response = await services.posts.getPosts()
    setPosts(response.items)
  }

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

## 🛠 Key Features

### ✅ DRY Principles
- **Shared utilities**: Error handling, logging, form data building
- **Reusable base service**: Common PocketBase operations
- **Centralized configuration**: All API URLs and settings in one place

### ✅ Low Cognitive Complexity
- **Single responsibility**: Each service handles one domain
- **Small, focused functions**: Easy to understand and test
- **Clear separation**: Logic, types, config, and utilities are separate

### ✅ Consistent Patterns
- **Error handling**: All API calls wrapped with consistent error handling
- **Logging**: Structured logging with context and levels
- **Type safety**: TypeScript interfaces for all data structures

## 📖 Service Details

### AuthService
- `login(email, password)` - Authenticate user
- `register(email, password, passwordConfirm, name)` - Create new user
- `logout()` - Clear authentication
- `isAuthenticated()` - Check auth status
- `getCurrentUser()` - Get current user data

### PostsService  
- `getPosts(page, perPage)` - List published posts
- `getPost(id)` - Get single post
- `createPost(data)` - Create new post
- `updatePost(id, data)` - Update existing post
- `deletePost(id)` - Delete post
- `searchPosts(query)` - Search posts
- `likePost(postId)` - Like a post

### CommentsService
- `getComments(postId)` - Get comments for post
- `createComment(postId, content, parentId?)` - Add comment
- `updateComment(id, content)` - Update comment
- `deleteComment(id)` - Delete comment

### RealtimeService
- `subscribeToNewPosts(callback)` - Listen for new posts
- `subscribeToPostUpdates(postId, callback)` - Listen for post updates
- `subscribeToComments(postId, callback)` - Listen for new comments
- `unsubscribeAll()` - Clean up all subscriptions

### AnalyticsService
- `getStats()` - Get site statistics
- `getUserProfile()` - Get user profile data

## 🔧 Configuration

Update `config.ts` to customize:

```typescript
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8091',
  collections: {
    users: 'users',
    posts: 'posts', 
    comments: 'comments',
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
}
```

## 📝 Logging

All services include structured logging:

```typescript
import { createLogger } from './logger'

const logger = createLogger('my-component')
logger.info('Operation completed', { userId: 123 })
logger.error('Operation failed', { error: 'Network timeout' })
logger.debug('Debug info', { data: complexObject })
```

## 🔄 Migration from Legacy

If you're migrating from the old `pocketbase.ts`:

**Before:**
```typescript
import { AuthService, PostsService } from './pocketbase'

const authService = new AuthService()
const postsService = new PostsService()
```

**After:**
```typescript
import { getServices } from './services'

const { auth, posts } = getServices()
// or
import { login, createPost } from './services'
```

## 🎯 Benefits

1. **Maintainable**: Easy to add new features or modify existing ones
2. **Testable**: Small, pure functions are easy to unit test
3. **Reusable**: Services can be used across different components
4. **Type-safe**: Full TypeScript support with proper interfaces
5. **Consistent**: Standardized error handling and logging
6. **Performant**: Lazy-loaded services and efficient subscriptions

This modular architecture makes it easy to scale your application while keeping the codebase clean and maintainable!
