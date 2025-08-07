import { ApiClient } from '../ApiClient'
import ApiRoutes from '../ApiRoutes'

// Types for Comments API
export interface Comment {
  id: string
  content: string
  authorId: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  postId: string
  parentId?: string // for nested comments/replies
  likesCount: number
  repliesCount: number
  isLiked?: boolean
  isEdited: boolean
  createdAt: string
  updatedAt: string
  replies?: Comment[]
}

export interface CreateCommentRequest {
  content: string
  postId: string
  parentId?: string // for replies
}

export interface UpdateCommentRequest {
  id: string
  content: string
}

export interface CommentsListResponse {
  comments: Comment[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface CommentsListParams {
  postId?: string
  authorId?: string
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'likesCount'
  sortOrder?: 'asc' | 'desc'
  includeReplies?: boolean
}

/**
 * Comments API slice
 * Handles all comment-related API calls
 */
const CommentsApi = {
  /**
   * Get list of comments with filtering and pagination
   */
  list: (params?: CommentsListParams) =>
    ApiClient.get<CommentsListResponse>(
      ApiRoutes.comments.base,
      params ? { queryParams: params } : {}
    ),

  /**
   * Get comments for a specific post
   */
  getByPost: (postId: string, params?: Omit<CommentsListParams, 'postId'>) =>
    ApiClient.get<CommentsListResponse>(
      ApiRoutes.posts.comments(postId),
      params ? { queryParams: params } : {}
    ),

  /**
   * Get a single comment by ID
   */
  get: (id: string) =>
    ApiClient.get<Comment>(ApiRoutes.comments.item(id)),

  /**
   * Create a new comment
   */
  create: (data: CreateCommentRequest) =>
    ApiClient.post<Comment>(ApiRoutes.comments.base, { data }),

  /**
   * Update an existing comment
   */
  update: (data: UpdateCommentRequest) => {
    const { id, ...updateData } = data
    return ApiClient.put<Comment>(ApiRoutes.comments.item(id), { data: updateData })
  },

  /**
   * Delete a comment
   */
  delete: (id: string) =>
    ApiClient.delete<void>(ApiRoutes.comments.item(id)),

  /**
   * Like a comment
   */
  like: (id: string) =>
    ApiClient.post<{ likesCount: number; isLiked: boolean }>(ApiRoutes.comments.like(id)),

  /**
   * Unlike a comment
   */
  unlike: (id: string) =>
    ApiClient.delete<{ likesCount: number; isLiked: boolean }>(ApiRoutes.comments.unlike(id)),

  /**
   * Get replies to a comment
   */
  getReplies: (commentId: string, params?: CommentsListParams) =>
    ApiClient.get<CommentsListResponse>(
      ApiRoutes.comments.replies(commentId),
      params ? { queryParams: params } : {}
    ),

  /**
   * Reply to a comment
   */
  reply: (commentId: string, content: string, postId: string) =>
    ApiClient.post<Comment>(ApiRoutes.comments.base, {
      data: {
        content,
        postId,
        parentId: commentId
      }
    }),

  /**
   * Get comments by author
   */
  getByAuthor: (authorId: string, params?: Omit<CommentsListParams, 'authorId'>) =>
    ApiClient.get<CommentsListResponse>(
      ApiRoutes.comments.base,
      { queryParams: { ...params, authorId } }
    ),

  /**
   * Get comment thread (comment with all its nested replies)
   */
  getThread: (commentId: string) =>
    ApiClient.get<Comment>(`comments/${commentId}/thread`),

  /**
   * Report a comment
   */
  report: (commentId: string, reason: string) =>
    ApiClient.post<{ message: string }>(`comments/${commentId}/report`, {
      data: { reason }
    }),

  /**
   * Pin a comment (admin/moderator only)
   */
  pin: (commentId: string) =>
    ApiClient.post<Comment>(`comments/${commentId}/pin`),

  /**
   * Unpin a comment (admin/moderator only)
   */
  unpin: (commentId: string) =>
    ApiClient.delete<Comment>(`comments/${commentId}/pin`),
}

export default CommentsApi
