// ===================================================
// MIGRATION NOTICE: 
// The legacy services below are deprecated in favor of the new modular API client.
// Please use the new API client from src/api for new development.
// 
// New usage:
// import { AnalyticsApi, AuthApi, PostsApi } from '@/api'
//
// Legacy usage (deprecated):
// import { AnalyticsService } from '@/services'
// ===================================================

// Legacy services configuration and utilities (still used)
export { API_CONFIG } from './config'
export { createLogger } from './logger'
export { pb, isAuthenticated, getCurrentUser } from './base'

// Legacy types (DEPRECATED - use types from @/api instead)
export type * from './types'

// Legacy service classes (DEPRECATED)
export { AuthService } from './auth'
export { PostsService } from './posts'
export { CommentsService } from './comments'
export { RealtimeService } from './realtime'
export { AnalyticsService } from './analytics'

// NEW API CLIENT - Import directly from @/api to avoid conflicts
// import { AnalyticsApi, AuthApi, PostsApi, CommentsApi, RealtimeApi } from '@/api'

// Legacy service instances (lazy initialization) - DEPRECATED
let authService: any
let postsService: any
let commentsService: any
let realtimeService: any
let analyticsService: any

export const getServices = () => ({
  auth: authService || (authService = new (require('./auth')).AuthService()),
  posts: postsService || (postsService = new (require('./posts')).PostsService()),
  comments: commentsService || (commentsService = new (require('./comments')).CommentsService()),
  realtime: realtimeService || (realtimeService = new (require('./realtime')).RealtimeService()),
  analytics: analyticsService || (analyticsService = new (require('./analytics')).AnalyticsService()),
})

// Legacy convenience functions - DEPRECATED
// Use the new API slices instead: AuthApi.login(), PostsApi.list(), etc.
export const createPost = (data: any) => getServices().posts.createPost(data)
export const getPosts = (page?: number) => getServices().posts.getPosts(page)
export const login = (email: string, password: string) => getServices().auth.login(email, password)
export const logout = () => getServices().auth.logout()
