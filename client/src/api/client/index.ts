// Export the base API client and utilities
export { ApiClient, ApiResponse } from './ApiClient'
export { default as ApiRoutes } from './ApiRoutes'
<<<<<<< HEAD

// Export Stories API slice
export { default as StoriesApi } from './slices/StoriesApi'

// Export types from StoriesApi for convenience
export type { StoryRequest, StoryChapter, Story, StoryResponse } from './slices/StoriesApi'
=======
export { default as CrudApi } from './CrudApi'

// Export all API slices
export { default as AnalyticsApi } from './slices/AnalyticsApi'
export { default as AuthApi } from './slices/AuthApi'
export { default as PostsApi } from './slices/PostsApi'
export { default as CommentsApi } from './slices/CommentsApi'
export { default as RealtimeApi } from './slices/RealtimeApi'

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
>>>>>>> d636ce03a53456eaef001ada76af30b2d6174ea9
