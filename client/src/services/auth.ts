import { pb, withErrorHandling } from './base'
import { createLogger } from './logger'
import type { User, AuthResponse } from './types'

const logger = createLogger('auth')

export class AuthService {
  async login(email: string, password: string): Promise<any> {
    return withErrorHandling(async () => {
      const authData = await pb.collection('users').authWithPassword(email, password)
      logger.info('User logged in', { email })
      return authData
    }, 'AuthService.login')
  }

  async register(
    email: string, 
    password: string, 
    passwordConfirm: string, 
    name: string
  ): Promise<any> {
    return withErrorHandling(async () => {
      const userData = {
        email,
        password,
        passwordConfirm,
        name,
        emailVisibility: true,
      }
      
      const user = await pb.collection('users').create(userData)
      await pb.collection('users').requestVerification(email)
      
      logger.info('User registered', { email })
      return user
    }, 'AuthService.register')
  }

  logout(): void {
    const email = pb.authStore.model?.email
    pb.authStore.clear()
    logger.info('User logged out', { email })
  }

  isAuthenticated(): boolean {
    return pb.authStore.isValid
  }

  getCurrentUser(): any {
    return pb.authStore.model
  }

  async requestPasswordReset(email: string): Promise<void> {
    return withErrorHandling(async () => {
      await pb.collection('users').requestPasswordReset(email)
      logger.info('Password reset requested', { email })
    }, 'AuthService.requestPasswordReset')
  }
}
