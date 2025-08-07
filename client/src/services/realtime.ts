import { pb } from './base'
import { createLogger } from './logger'

const logger = createLogger('realtime')

export class RealtimeService {
  private subscriptions: Promise<() => void>[] = []

  async subscribeToNewPosts(callback: (post: any) => void): Promise<() => void> {
    const unsubscribe = await pb.collection('posts').subscribe('*', (e: any) => {
      if (e.action === 'create' && e.record.published) {
        logger.debug('New post received', { id: e.record.id })
        callback(e.record)
      }
    })
    
    this.subscriptions.push(Promise.resolve(unsubscribe))
    return unsubscribe
  }

  async subscribeToPostUpdates(postId: string, callback: (post: any) => void): Promise<() => void> {
    const unsubscribe = await pb.collection('posts').subscribe(postId, (e: any) => {
      if (e.action === 'update') {
        logger.debug('Post updated', { id: postId })
        callback(e.record)
      }
    })
    
    this.subscriptions.push(Promise.resolve(unsubscribe))
    return unsubscribe
  }

  async subscribeToComments(postId: string, callback: (comment: any) => void): Promise<() => void> {
    const unsubscribe = await pb.collection('comments').subscribe('*', (e: any) => {
      if (e.action === 'create' && e.record.post === postId && e.record.approved) {
        logger.debug('New comment received', { postId, commentId: e.record.id })
        callback(e.record)
      }
    })
    
    this.subscriptions.push(Promise.resolve(unsubscribe))
    return unsubscribe
  }

  async unsubscribeAll(): Promise<void> {
    logger.debug('Unsubscribing from all realtime events')
    const unsubscribeFunctions = await Promise.all(this.subscriptions)
    unsubscribeFunctions.forEach(unsubscribe => unsubscribe())
    this.subscriptions = []
  }
}
