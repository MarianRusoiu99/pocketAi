import { ApiClient } from '../ApiClient'
import ApiRoutes from '../ApiRoutes'

// Types for Posts API
export interface Post {
  id: string
  title: string
  content: string
  excerpt?: string
  authorId: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  category?: string
  tags?: string[]
  status: 'draft' | 'published' | 'archived'
  likesCount: number
  commentsCount: number
  viewsCount: number
  isLiked?: boolean
  featuredImage?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface CreatePostRequest {
  title: string
  content: string
  excerpt?: string
  category?: string
  tags?: string[]
  status?: 'draft' | 'published'
  featuredImage?: File | string
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: string
}

export interface PostsListResponse {
  posts: Post[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PostsListParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  authorId?: string
  status?: 'draft' | 'published' | 'archived'
  sortBy?: 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount' | 'viewsCount'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Posts API slice
 * Handles all post-related API calls
 */
const PostsApi = {
  /**
   * Get list of posts with filtering and pagination
   */
  list: (params?: PostsListParams) =>
    ApiClient.get<PostsListResponse>(
      ApiRoutes.posts.list(params),
      params ? { queryParams: params } : {}
    ),

  /**
   * Get a single post by ID
   */
  get: (id: string) =>
    ApiClient.get<Post>(ApiRoutes.posts.item(id)),

  /**
   * Create a new post
   */
  create: (data: CreatePostRequest) => {
    // Handle file upload for featured image
    if (data.featuredImage instanceof File) {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'featuredImage' && value instanceof File) {
          formData.append(key, value)
        } else if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else if (value !== undefined) {
          formData.append(key, String(value))
        }
      })
      return ApiClient.post<Post>(ApiRoutes.posts.base, { data: formData })
    }
    
    return ApiClient.post<Post>(ApiRoutes.posts.base, { data })
  },

  /**
   * Update an existing post
   */
  update: (data: UpdatePostRequest) => {
    const { id, ...updateData } = data
    
    // Handle file upload for featured image
    if (updateData.featuredImage instanceof File) {
      const formData = new FormData()
      Object.entries(updateData).forEach(([key, value]) => {
        if (key === 'featuredImage' && value instanceof File) {
          formData.append(key, value)
        } else if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else if (value !== undefined) {
          formData.append(key, String(value))
        }
      })
      return ApiClient.put<Post>(ApiRoutes.posts.item(id), { data: formData })
    }
    
    return ApiClient.put<Post>(ApiRoutes.posts.item(id), { data: updateData })
  },

  /**
   * Delete a post
   */
  delete: (id: string) =>
    ApiClient.delete<void>(ApiRoutes.posts.item(id)),

  /**
   * Like a post
   */
  like: (id: string) =>
    ApiClient.post<{ likesCount: number; isLiked: boolean }>(ApiRoutes.posts.like(id)),

  /**
   * Unlike a post
   */
  unlike: (id: string) =>
    ApiClient.delete<{ likesCount: number; isLiked: boolean }>(ApiRoutes.posts.unlike(id)),

  /**
   * Get posts by author
   */
  getByAuthor: (authorId: string, params?: Omit<PostsListParams, 'authorId'>) =>
    ApiClient.get<PostsListResponse>(
      ApiRoutes.posts.list({ ...params, authorId } as PostsListParams)
    ),

  /**
   * Get featured posts
   */
  getFeatured: (limit?: number) =>
    ApiClient.get<Post[]>('posts/featured', limit ? { queryParams: { limit } } : {}),

  /**
   * Get trending posts
   */
  getTrending: (limit?: number, timeframe?: '24h' | '7d' | '30d') =>
    ApiClient.get<Post[]>('posts/trending', {
      queryParams: { limit, timeframe }
    }),

  /**
   * Search posts
   */
  search: (query: string, params?: Omit<PostsListParams, 'search'>) =>
    ApiClient.get<PostsListResponse>(
      ApiRoutes.posts.list({ ...params, search: query })
    ),

  /**
   * Get post statistics
   */
  getStats: (id: string) =>
    ApiClient.get<{
      views: number
      likes: number
      comments: number
      shares: number
      viewHistory: Array<{ date: string; views: number }>
    }>(`posts/${id}/stats`),
}

export default PostsApi
