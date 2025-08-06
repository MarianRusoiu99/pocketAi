// Configuration and environment setup
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8090',
  collections: {
    users: 'users',
    posts: 'posts',
    comments: 'comments',
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
} as const

export type CollectionName = keyof typeof API_CONFIG.collections
