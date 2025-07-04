// Type definitions for better type safety
export interface User {
  id: string
  email: string
  name: string
  emailVisibility?: boolean
  verified?: boolean
  created: string
  updated: string
}

export interface Post {
  id: string
  title: string
  content: string
  excerpt?: string
  category?: string
  tags?: string[]
  featured_image?: string
  published: boolean
  author: string
  created: string
  updated: string
}

export interface Comment {
  id: string
  content: string
  post: string
  author: string
  parent?: string
  status?: 'pending' | 'approved' | 'rejected'
  created: string
  updated: string
}

export interface AuthResponse {
  token: string
  record: User
}

export interface ListResponse<T> {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: T[]
}

export interface CreatePostData {
  title: string
  content: string
  excerpt?: string
  category?: string
  tags?: string[]
  featured_image?: File
  published?: boolean
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id?: never // Prevent ID from being updated
}
