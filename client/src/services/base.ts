import PocketBase from 'pocketbase'
import { API_CONFIG } from './config'

// Singleton PocketBase instance
export const pb = new PocketBase(API_CONFIG.baseUrl)

// Generic error handling wrapper
export async function withErrorHandling<T>(operation: () => Promise<T>, context: string): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`[${context}] Operation failed:`, error)
    throw error
  }
}
