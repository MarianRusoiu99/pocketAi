/**
 * User Service - TypeScript implementation
 * Migrated from Go service with enhanced Rivet integration
 */

/// <reference path="../../../pb_data/types.d.ts" />

import { Logger } from '../utils/logger';

export class UserService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('UserService');
  }

  /**
   * Get user profile with extended information
   */
  async getUserProfile(userID: string): Promise<models.Record | null> {
    try {
      // Get user record
      const user = $app.dao().findRecordById('_pb_users_auth_', userID);
      if (!user) {
        this.logger.error('User not found', { userID });
        return null;
      }

      // Try to get extended profile
      try {
        const profile = $app.dao().findFirstRecordByFilter(
          'user_profiles',
          'user = {:id}',
          { id: userID }
        );
        
        this.logger.debug('Extended profile found', { userID });
        return profile;
      } catch (error) {
        this.logger.debug('No extended profile found, returning basic user', { userID });
        return user;
      }
    } catch (error) {
      this.logger.error('Failed to get user profile', error);
      return null;
    }
  }

  /**
   * Create extended user profile
   */
  async createUserProfile(userID: string, data: Record<string, any>): Promise<models.Record | null> {
    try {
      const collection = $app.dao().findCollectionByNameOrId('user_profiles');
      if (!collection) {
        throw new Error('user_profiles collection not found');
      }

      const profile = new Record(collection);
      profile.set('user', userID);
      
      // Set profile data
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'user') { // Prevent overriding user field
          profile.set(key, value);
        }
      }

      $app.dao().saveRecord(profile);
      this.logger.info('User profile created', { userID, profileId: profile.id });
      
      return profile;
    } catch (error) {
      this.logger.error('Failed to create user profile', error);
      return null;
    }
  }

  /**
   * Update existing user profile
   */
  async updateUserProfile(userID: string, data: Record<string, any>): Promise<models.Record | null> {
    try {
      const profile = $app.dao().findFirstRecordByFilter(
        'user_profiles',
        'user = {:id}',
        { id: userID }
      );

      if (!profile) {
        this.logger.error('User profile not found', { userID });
        return null;
      }

      // Update profile data
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'user') { // Prevent overriding user field
          profile.set(key, value);
        }
      }

      $app.dao().saveRecord(profile);
      this.logger.info('User profile updated', { userID, profileId: profile.id });
      
      return profile;
    } catch (error) {
      this.logger.error('Failed to update user profile', error);
      return null;
    }
  }

  /**
   * Get public user profiles with pagination
   */
  async getPublicProfiles(page: number = 1, perPage: number = 20, search: string = ''): Promise<models.Record[]> {
    try {
      let filter = 'is_public = true';
      const params: Record<string, any> = {};
      
      if (search) {
        filter += ' && (display_name ~ {:search} || user.username ~ {:search})';
        params.search = search;
      }

      const records = $app.dao().findRecordsByFilter(
        'user_profiles',
        filter,
        '-created',
        perPage,
        (page - 1) * perPage,
        params
      );

      this.logger.debug('Public profiles retrieved', { count: records.length, page, search });
      return records;
    } catch (error) {
      this.logger.error('Failed to get public profiles', error);
      return [];
    }
  }

  /**
   * Validate user permissions for operation
   */
  validateUserPermissions(userId: string, operation: string, resourceId?: string): boolean {
    try {
      // Basic permission logic - can be enhanced based on your needs
      const user = $app.dao().findRecordById('_pb_users_auth_', userId);
      if (!user) return false;

      // Add your permission logic here
      // For example, check user roles, ownership, etc.
      
      this.logger.debug('User permissions validated', { userId, operation, resourceId });
      return true;
    } catch (error) {
      this.logger.error('Failed to validate user permissions', error);
      return false;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<Record<string, any> | null> {
    try {
      const user = $app.dao().findRecordById('_pb_users_auth_', userId);
      if (!user) return null;

      // Count user's posts
      const postsCount = $app.dao().findRecordsByFilter(
        'posts',
        'author = {:userId}',
        '',
        1,
        0,
        { userId }
      ).length;

      // Count user's comments
      const commentsCount = $app.dao().findRecordsByFilter(
        'comments',
        'author = {:userId}',
        '',
        1,
        0,
        { userId }
      ).length;

      const stats = {
        postsCount,
        commentsCount,
        joinedAt: user.created,
        lastActive: user.updated
      };

      this.logger.debug('User stats retrieved', { userId, stats });
      return stats;
    } catch (error) {
      this.logger.error('Failed to get user stats', error);
      return null;
    }
  }
}
