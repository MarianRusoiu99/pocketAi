// Main API module entry point
// This file exports everything from the api/client structure for easy access

export * from './client'

// Re-export the most commonly used items for convenience
export {
  ApiClient,
  AnalyticsApi,
  AuthApi,
  PostsApi,
  CommentsApi,
  RealtimeApi,
  StoriesApi,
  ApiRoutes
} from './client'
