import { pb, withErrorHandling } from './base'
import { createLogger } from './logger'

const logger = createLogger('analytics')

export class AnalyticsService {
  async getStats(): Promise<any> {
    return withErrorHandling(async () => {
      const response = await pb.send('/api/analytics/stats', {
        method: 'GET',
      })
      logger.debug('Stats fetched')
      return response
    }, 'AnalyticsService.getStats')
  }

  async getUserProfile(): Promise<any> {
    return withErrorHandling(async () => {
      const response = await pb.send('/api/profile', {
        method: 'GET',
      })
      logger.debug('User profile fetched')
      return response
    }, 'AnalyticsService.getUserProfile')
  }
}
