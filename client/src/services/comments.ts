import { pb, withErrorHandling, getCurrentUser } from './base'
import { createLogger } from './logger'
import type { Comment } from './types'

const logger = createLogger('comments')

export class CommentsService {
  async getComments(postId: string): Promise<any> {
    return withErrorHandling(async () => {
      const comments = await pb.collection('comments').getList(1, 50, {
        filter: `post = "${postId}" && approved = true`,
        sort: 'created',
        expand: 'author',
      })
      logger.debug('Comments fetched', { postId, count: comments.items.length })
      return comments
    }, 'CommentsService.getComments')
  }

  async createComment(postId: string, content: string, parentId?: string): Promise<any> {
    return withErrorHandling(async () => {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        throw new Error('Authentication required')
      }

      const commentData = {
        content,
        post: postId,
        author: currentUser.id,
        parent: parentId || null,
      }

      const comment = await pb.collection('comments').create(commentData)
      logger.info('Comment created', { id: comment.id, postId })
      return comment
    }, 'CommentsService.createComment')
  }

  async updateComment(id: string, content: string): Promise<any> {
    return withErrorHandling(async () => {
      const comment = await pb.collection('comments').update(id, { content })
      logger.info('Comment updated', { id })
      return comment
    }, 'CommentsService.updateComment')
  }

  async deleteComment(id: string): Promise<void> {
    return withErrorHandling(async () => {
      await pb.collection('comments').delete(id)
      logger.info('Comment deleted', { id })
    }, 'CommentsService.deleteComment')
  }
}
