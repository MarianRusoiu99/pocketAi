import { ApiClient } from '../ApiClient'
import ApiRoutes from '../ApiRoutes'

// Types for Realtime API
export interface RealtimeConnection {
  id: string
  userId: string
  status: 'connected' | 'disconnected' | 'reconnecting'
  connectedAt: string
  lastHeartbeat: string
}

export interface RealtimeSubscription {
  id: string
  channel: string
  userId: string
  events: string[]
  createdAt: string
}

export interface RealtimeMessage {
  id: string
  channel: string
  event: string
  data: any
  senderId?: string
  timestamp: string
}

export interface SubscribeRequest {
  channel: string
  events?: string[]
}

export interface PublishRequest {
  channel: string
  event: string
  data: any
  targetUsers?: string[]
}

export interface RealtimeEvent {
  type: 'message' | 'notification' | 'status' | 'error'
  channel: string
  data: any
  timestamp: string
}

/**
 * Realtime API slice
 * Handles all real-time communication API calls
 */
const RealtimeApi = {
  /**
   * Establish realtime connection
   */
  connect: () =>
    ApiClient.post<RealtimeConnection>(ApiRoutes.realtime.connect),

  /**
   * Disconnect from realtime
   */
  disconnect: () =>
    ApiClient.delete<void>('realtime/disconnect'),

  /**
   * Subscribe to a channel
   */
  subscribe: (data: SubscribeRequest) =>
    ApiClient.post<RealtimeSubscription>(
      ApiRoutes.realtime.subscribe(data.channel),
      { data }
    ),

  /**
   * Unsubscribe from a channel
   */
  unsubscribe: (channel: string) =>
    ApiClient.delete<void>(ApiRoutes.realtime.unsubscribe(channel)),

  /**
   * Publish message to a channel
   */
  publish: (data: PublishRequest) =>
    ApiClient.post<RealtimeMessage>('realtime/publish', { data }),

  /**
   * Get active connections
   */
  getConnections: () =>
    ApiClient.get<RealtimeConnection[]>('realtime/connections'),

  /**
   * Get user's subscriptions
   */
  getSubscriptions: () =>
    ApiClient.get<RealtimeSubscription[]>('realtime/subscriptions'),

  /**
   * Get channel members
   */
  getChannelMembers: (channel: string) =>
    ApiClient.get<Array<{
      userId: string
      username: string
      status: 'online' | 'away' | 'offline'
      joinedAt: string
    }>>(`realtime/channels/${channel}/members`),

  /**
   * Send typing indicator
   */
  sendTyping: (channel: string) =>
    ApiClient.post<void>(`realtime/channels/${channel}/typing`),

  /**
   * Send presence update
   */
  updatePresence: (status: 'online' | 'away' | 'offline', message?: string) =>
    ApiClient.post<void>('realtime/presence', {
      data: { status, message }
    }),

  /**
   * Get message history for a channel
   */
  getMessageHistory: (channel: string, params?: {
    page?: number
    limit?: number
    before?: string
    after?: string
  }) =>
    ApiClient.get<{
      messages: RealtimeMessage[]
      totalCount: number
      hasMore: boolean
    }>(`realtime/channels/${channel}/history`, {
      queryParams: params
    }),

  /**
   * Create a private channel
   */
  createPrivateChannel: (participants: string[], name?: string) =>
    ApiClient.post<{
      channelId: string
      channelName: string
      participants: string[]
    }>('realtime/channels/private', {
      data: { participants, name }
    }),

  /**
   * Join a channel
   */
  joinChannel: (channel: string) =>
    ApiClient.post<void>(`realtime/channels/${channel}/join`),

  /**
   * Leave a channel
   */
  leaveChannel: (channel: string) =>
    ApiClient.post<void>(`realtime/channels/${channel}/leave`),

  /**
   * Get realtime statistics
   */
  getStats: () =>
    ApiClient.get<{
      totalConnections: number
      totalChannels: number
      totalMessages: number
      averageLatency: number
      uptimePercentage: number
    }>('realtime/stats'),
}

export default RealtimeApi
