import { ApiClient } from '../ApiClient'
import ApiRoutes from '../ApiRoutes'

// Types for Analytics API
export interface AnalyticsStats {
  totalUsers: number
  totalPosts: number
  totalComments: number
  activeUsers: number
  popularPosts: Array<{
    id: string
    title: string
    likes: number
    comments: number
  }>
  userGrowth: Array<{
    date: string
    users: number
  }>
}

export interface UserAnalytics {
  userId: string
  postsCreated: number
  commentsCount: number
  likesReceived: number
  profileViews: number
  joinDate: string
  lastActive: string
}

export interface AnalyticsEvent {
  id: string
  userId: string
  eventType: string
  eventData: Record<string, any>
  timestamp: string
  sessionId: string
  userAgent?: string
  ipAddress?: string
}

export interface AnalyticsExportOptions {
  startDate?: string
  endDate?: string
  format: 'csv' | 'json' | 'xlsx'
  includeUserData?: boolean
  includeEventData?: boolean
}

/**
 * Analytics API slice
 * Handles all analytics-related API calls
 */
const AnalyticsApi = {
  /**
   * Get general analytics stats
   */
  getStats: () => ApiClient.get<AnalyticsStats>(ApiRoutes.analytics.stats),

  /**
   * Get user-specific analytics
   */
  getUserStats: (userId?: string) => 
    ApiClient.get<UserAnalytics>(
      ApiRoutes.analytics.userStats,
      userId ? { queryParams: { userId } } : {}
    ),

  /**
   * Track analytics event
   */
  trackEvent: (eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>) =>
    ApiClient.post<void>(ApiRoutes.analytics.events, { data: eventData }),

  /**
   * Get analytics events with filtering
   */
  getEvents: (params?: {
    userId?: string
    eventType?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) =>
    ApiClient.get<{
      events: AnalyticsEvent[]
      totalCount: number
      currentPage: number
      totalPages: number
    }>(ApiRoutes.analytics.events, { queryParams: params }),

  /**
   * Export analytics data
   */
  exportData: (options: AnalyticsExportOptions) =>
    ApiClient.post<{ downloadUrl: string }>(ApiRoutes.analytics.export, { data: options }),

  /**
   * Get analytics dashboard data (combines multiple metrics)
   */
  getDashboardData: () =>
    ApiClient.get<{
      stats: AnalyticsStats
      recentEvents: AnalyticsEvent[]
      topUsers: Array<{
        userId: string
        username: string
        activityScore: number
      }>
    }>('analytics/dashboard'),
}

export default AnalyticsApi
