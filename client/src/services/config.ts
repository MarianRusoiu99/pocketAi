// Configuration and environment setup
export const API_CONFIG = {
<<<<<<< HEAD
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8090',
=======
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8091',
>>>>>>> d636ce03a53456eaef001ada76af30b2d6174ea9
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
