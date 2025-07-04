/**
 * API Routes configuration
 * Centralized endpoint definitions for all API calls
 */

const ApiRoutes = {
  auth: {
    login: 'auth/login',
    register: 'auth/register',
    logout: 'auth/logout',
    refresh: 'auth/refresh',
    user: 'auth/user',
    forgotPassword: 'auth/forgot-password',
    resetPassword: 'auth/reset-password',
  },
  
  analytics: {
    stats: 'analytics/stats',
    userStats: 'analytics/user-stats',
    events: 'analytics/events',
    export: 'analytics/export',
  },
  
  posts: {
    base: 'posts',
    item: (id: string) => `posts/${id}`,
    list: (params?: {
      page?: number
      limit?: number
      search?: string
      category?: string
    }) => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.category) queryParams.append('category', params.category)
      
      const query = queryParams.toString()
      return query ? `posts?${query}` : 'posts'
    },
    like: (id: string) => `posts/${id}/like`,
    unlike: (id: string) => `posts/${id}/unlike`,
    comments: (id: string) => `posts/${id}/comments`,
  },
  
  comments: {
    base: 'comments',
    item: (id: string) => `comments/${id}`,
    like: (id: string) => `comments/${id}/like`,
    unlike: (id: string) => `comments/${id}/unlike`,
    replies: (id: string) => `comments/${id}/replies`,
  },
  
  profile: {
    base: 'profile',
    current: 'profile/me',
    update: 'profile/update',
    avatar: 'profile/avatar',
    settings: 'profile/settings',
  },
  
  upload: {
    image: 'upload/image',
    file: 'upload/file',
    avatar: 'upload/avatar',
  },
  
  realtime: {
    connect: 'realtime/connect',
    subscribe: (channel: string) => `realtime/subscribe/${channel}`,
    unsubscribe: (channel: string) => `realtime/unsubscribe/${channel}`,
  },
  
  notifications: {
    base: 'notifications',
    unread: 'notifications/unread',
    markRead: (id: string) => `notifications/${id}/read`,
    markAllRead: 'notifications/mark-all-read',
  },
}

export default ApiRoutes
