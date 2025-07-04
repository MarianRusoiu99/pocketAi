import { ApiClient } from '../ApiClient'
import ApiRoutes from '../ApiRoutes'

// Types for Auth API
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
  expiresAt: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  confirmPassword: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'user' | 'admin' | 'moderator'
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * Authentication API slice
 * Handles all authentication-related API calls
 */
const AuthApi = {
  /**
   * Login user
   */
  login: (data: LoginRequest) =>
    ApiClient.post<LoginResponse>(ApiRoutes.auth.login, { data }),

  /**
   * Register new user
   */
  register: (data: RegisterRequest) =>
    ApiClient.post<LoginResponse>(ApiRoutes.auth.register, { data }),

  /**
   * Logout user
   */
  logout: () =>
    ApiClient.post<void>(ApiRoutes.auth.logout),

  /**
   * Refresh access token
   */
  refreshToken: (data: RefreshTokenRequest) =>
    ApiClient.post<LoginResponse>(ApiRoutes.auth.refresh, { data }),

  /**
   * Get current authenticated user
   */
  getCurrentUser: () =>
    ApiClient.get<User>(ApiRoutes.auth.user),

  /**
   * Request password reset
   */
  forgotPassword: (data: ForgotPasswordRequest) =>
    ApiClient.post<{ message: string }>(ApiRoutes.auth.forgotPassword, { data }),

  /**
   * Reset password with token
   */
  resetPassword: (data: ResetPasswordRequest) =>
    ApiClient.post<{ message: string }>(ApiRoutes.auth.resetPassword, { data }),

  /**
   * Verify email address
   */
  verifyEmail: (token: string) =>
    ApiClient.post<{ message: string }>('auth/verify-email', { data: { token } }),

  /**
   * Resend email verification
   */
  resendVerification: (email: string) =>
    ApiClient.post<{ message: string }>('auth/resend-verification', { data: { email } }),

  /**
   * Change password (authenticated)
   */
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    ApiClient.post<{ message: string }>('auth/change-password', { data }),

  /**
   * Update user profile
   */
  updateProfile: (data: Partial<Pick<User, 'name' | 'email'>>) =>
    ApiClient.put<User>('auth/profile', { data }),
}

export default AuthApi
