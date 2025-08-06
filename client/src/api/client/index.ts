// Export the base API client and utilities
export { ApiClient, ApiResponse } from './ApiClient'
export { default as ApiRoutes } from './ApiRoutes'
export { default as CrudApi } from './CrudApi'

// Export all API slices
export { default as AnalyticsApi } from './slices/AnalyticsApi'
export { default as AuthApi } from './slices/AuthApi'
export { default as PostsApi } from './slices/PostsApi'
export { default as CommentsApi } from './slices/CommentsApi'
export { default as RealtimeApi } from './slices/RealtimeApi'
export { default as StoriesApi } from './slices/StoriesApi'

// Export types from slices for convenience
export type {
  AnalyticsStats,
  UserAnalytics,
  AnalyticsEvent,
  AnalyticsExportOptions
} from './slices/AnalyticsApi'

export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest
} from './slices/AuthApi'

export type {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  PostsListResponse,
  PostsListParams
} from './slices/PostsApi'

export type {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentsListResponse,
  CommentsListParams
} from './slices/CommentsApi'

export type {
  RealtimeConnection,
  RealtimeSubscription,
  RealtimeMessage,
  SubscribeRequest,
  PublishRequest,
  RealtimeEvent
} from './slices/RealtimeApi'

export type {
  StoryRequest,
  StoryChapter,
  Story,
  StoryResponse
} from './slices/StoriesApi'
