/**
 * Post Service - TypeScript implementation
 * Migrated from Go service with enhanced Rivet integration
 */

/// <reference path="../../../pb_data/types.d.ts" />

import { Logger } from '../utils/logger';
import { RivetService } from './rivet-service';

export interface PostData {
  title: string;
  content: string;
  excerpt?: string;
  published?: boolean;
  tags?: string[];
  category?: string;
  featured_image?: string;
}

export class PostService {
  private logger: Logger;
  private rivetService: RivetService;

  constructor() {
    this.logger = new Logger('PostService');
    this.rivetService = new RivetService();
  }

  /**
   * Get published posts with pagination and filtering
   */
  async getPublishedPosts(page: number = 1, perPage: number = 20, search?: string, tag?: string): Promise<any> {
    try {
      this.logger.debug('Getting published posts', { page, search, tag });
      
      // Build filter
      let filter = "status = 'published'";
      const params: Record<string, any> = {};

      if (search) {
        filter += " && (title ~ {:search} || content ~ {:search})";
        params.search = search;
      }
      
      if (tag) {
        filter += " && tags ~ {:tag}";
        params.tag = tag;
      }
      
      // Get records with pagination
      const records = $app.dao().findRecordsByFilter(
        'posts',
        filter,
        '-published_at',
        perPage,
        (page - 1) * perPage,
        params
      );
      
      // Transform records to response format
      const posts = records.map(record => ({
        id: record.id,
        title: record.getString('title'),
        slug: record.getString('slug'),
        content: record.getString('content'),
        excerpt: record.getString('excerpt'),
        published_at: record.getDateTime('published_at'),
        view_count: record.getInt('view_count'),
        tags: record.get('tags'),
        meta_title: record.getString('meta_title'),
        meta_description: record.getString('meta_description'),
        author: record.expandedOne('author')
      }));
      
      return {
        items: posts,
        page,
        perPage,
        total: posts.length
      };
    } catch (error) {
      this.logger.error('Failed to get published posts', error);
      throw error;
    }
  }

  /**
   * Get post by slug
   */
  async getPostBySlug(slug: string): Promise<any> {
    try {
      this.logger.debug('Getting post by slug', { slug });
      
      const record = $app.dao().findFirstRecordByFilter(
        'posts',
        "slug = {:slug} && status = 'published'",
        { slug }
      );

      if (!record) {
        throw new Error('Post not found');
      }
      
      // Increment view count
      const currentViews = record.getInt('view_count');
      record.set('view_count', currentViews + 1);
      $app.dao().saveRecord(record);
      
      const post = {
        id: record.id,
        title: record.getString('title'),
        slug: record.getString('slug'),
        content: record.getString('content'),
        excerpt: record.getString('excerpt'),
        published_at: record.getDateTime('published_at'),
        view_count: record.getInt('view_count'),
        tags: record.get('tags'),
        meta_title: record.getString('meta_title'),
        meta_description: record.getString('meta_description'),
        author: record.expandedOne('author')
      };
      
      return post;
    } catch (error) {
      this.logger.error('Failed to get post by slug', error);
      throw error;
    }
  }

  /**
   * Create new post with Rivet processing
   */
  async createPost(authorId: string, data: PostData): Promise<any> {
    try {
      this.logger.debug('Creating new post', { authorId, title: data.title });
      
      const collection = $app.dao().findCollectionByNameOrId('posts');
      if (!collection) {
        throw new Error('Posts collection not found');
      }

      const record = new Record(collection);
      
      // Set required fields
      record.set('title', data.title);
      record.set('slug', this.generateSlug(data.title));
      record.set('content', data.content);
      record.set('author', authorId);
      record.set('status', data.published ? 'published' : 'draft');
      
      // Set optional fields
      if (data.excerpt) record.set('excerpt', data.excerpt);
      if (data.tags) record.set('tags', data.tags);
      if (data.category) record.set('category', data.category);
      if (data.featured_image) record.set('featured_image', data.featured_image);
      
      // Set published_at if status is published
      if (data.published) {
        record.set('published_at', new Date().toISOString());
      }
      
      // Save the record first
      $app.dao().saveRecord(record);
      
      // Process with Rivet if published
      if (data.published) {
        try {
          const rivetResult = await this.rivetService.processContent(data.content, {
            title: data.title,
            authorId,
            postId: record.id
          });
          
          if (rivetResult.success && rivetResult.data) {
            // Update record with Rivet processing results
            if (rivetResult.data.processedContent) {
              record.set('processed_content', rivetResult.data.processedContent);
            }
            if (rivetResult.data.summary) {
              record.set('summary', rivetResult.data.summary);
            }
            if (rivetResult.data.suggestedTags) {
              record.set('suggested_tags', rivetResult.data.suggestedTags);
            }
            
            $app.dao().saveRecord(record);
            this.logger.info('Post processed with Rivet', { postId: record.id });
          }
        } catch (rivetError) {
          this.logger.warn('Rivet processing failed, post saved without processing', rivetError);
        }
      }
      
      return {
        id: record.id,
        title: record.getString('title'),
        slug: record.getString('slug'),
        status: record.getString('status'),
        created: record.getDateTime('created')
      };
    } catch (error) {
      this.logger.error('Failed to create post', error);
      throw error;
    }
  }

  /**
   * Get posts by user
   */
  async getUserPosts(userId: string, page: number = 1, perPage: number = 20): Promise<any> {
    try {
      this.logger.debug('Getting user posts', { userId, page });
      
      const records = $app.dao().findRecordsByFilter(
        'posts',
        'author = {:userId}',
        '-created',
        perPage,
        (page - 1) * perPage,
        { userId }
      );
      
      const posts = records.map(record => ({
        id: record.id,
        title: record.getString('title'),
        slug: record.getString('slug'),
        content: record.getString('content'),
        status: record.getString('status'),
        created: record.getDateTime('created'),
        published_at: record.getDateTime('published_at')
      }));
      
      return {
        items: posts,
        page,
        perPage,
        total: posts.length
      };
    } catch (error) {
      this.logger.error('Failed to get user posts', error);
      throw error;
    }
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }

  /**
   * Moderate post content using Rivet
   */
  async moderatePost(postId: string): Promise<{ approved: boolean; reasons?: string[] }> {
    try {
      const record = $app.dao().findRecordById('posts', postId);
      if (!record) {
        throw new Error('Post not found');
      }

      const moderationResult = await this.rivetService.moderateContent(
        record.getString('content'),
        record.getString('author')
      );

      if (moderationResult.success && moderationResult.data) {
        const approved = moderationResult.data.approved || false;
        const reasons = moderationResult.data.reasons || [];

        // Update post status based on moderation
        record.set('moderation_status', approved ? 'approved' : 'rejected');
        if (!approved) {
          record.set('moderation_reasons', reasons);
        }
        
        $app.dao().saveRecord(record);
        
        this.logger.info('Post moderated', { postId, approved, reasons });
        return { approved, reasons };
      }

      // Default to manual review if Rivet fails
      record.set('moderation_status', 'pending');
      $app.dao().saveRecord(record);
      
      return { approved: false, reasons: ['Requires manual review'] };
    } catch (error) {
      this.logger.error('Failed to moderate post', error);
      return { approved: false, reasons: ['Moderation error'] };
    }
  }
}
