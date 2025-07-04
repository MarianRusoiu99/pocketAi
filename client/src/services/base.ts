import PocketBase from 'pocketbase'
import { API_CONFIG } from './config'

// Singleton PocketBase instance
export const pb = new PocketBase(API_CONFIG.baseUrl)

// Generic error handling wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`[${context}] Operation failed:`, error)
    throw error
  }
}

// Generic form data builder for file uploads
export function buildFormData(data: Record<string, any>): FormData {
  const formData = new FormData()
  
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue
    
    if (Array.isArray(value)) {
      value.forEach(item => formData.append(key, item))
    } else if (value instanceof File) {
      formData.append(key, value)
    } else {
      formData.append(key, String(value))
    }
  }
  
  return formData
}

// Get current user helper
export function getCurrentUser() {
  return pb.authStore.model
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return pb.authStore.isValid
}
