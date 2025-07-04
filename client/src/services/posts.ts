import { pb, withErrorHandling, buildFormData, getCurrentUser } from './base'
import { createLogger } from './logger'
import { API_CONFIG } from './config'
import type { Post, CreatePostData, UpdatePostData, ListResponse } from './types'

const logger = createLogger('posts')

export class PostsService {
  async getPosts(page = 1, perPage = API_CONFIG.pagination.defaultPageSize): Promise<any> {
    return withErrorHandling(async () => {
      const posts = await pb.collection('posts').getList(page, perPage, {
        filter: 'published = true',
        sort: '-created',
        expand: 'author',
      })
      logger.debug('Posts fetched', { count: posts.items.length, page })
      return posts
    }, 'PostsService.getPosts')
  }

  async getPost(id: string): Promise<any> {
    return withErrorHandling(async () => {
      const post = await pb.collection('posts').getOne(id, {
        expand: 'author',
      })
      logger.debug('Post fetched', { id })
      return post
    }, 'PostsService.getPost')
  }

  async createPost(postData: CreatePostData): Promise<any> {
    return withErrorHandling(async () => {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        throw new Error('Authentication required')
      }

      const formData = buildFormData({
        ...postData,
        author: currentUser.id,
        published: postData.published ?? false,
      })

      const post = await pb.collection('posts').create(formData)
      logger.info('Post created', { id: post.id, title: post.title })
      return post
    }, 'PostsService.createPost')
  }

  async updatePost(id: string, postData: UpdatePostData): Promise<any> {
    return withErrorHandling(async () => {
      const post = await pb.collection('posts').update(id, postData)
      logger.info('Post updated', { id, title: post.title })
      return post
    }, 'PostsService.updatePost')
  }

  async deletePost(id: string): Promise<void> {
    return withErrorHandling(async () => {
      await pb.collection('posts').delete(id)
      logger.info('Post deleted', { id })
    }, 'PostsService.deletePost')
  }

  async searchPosts(query: string): Promise<any> {
    return withErrorHandling(async () => {
      const response = await pb.send(`/api/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
      })
      logger.debug('Posts searched', { query, resultCount: response.results?.length })
      return response
    }, 'PostsService.searchPosts')
  }

  async likePost(postId: string): Promise<any> {
    return withErrorHandling(async () => {
      const response = await pb.send(`/api/posts/${postId}/like`, {
        method: 'POST',
      })
      logger.info('Post liked', { postId })
      return response
    }, 'PostsService.likePost')
  }
}
