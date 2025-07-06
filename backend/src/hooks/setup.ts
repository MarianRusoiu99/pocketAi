/**
 * Hooks and Routes setup for PocketBase TypeScript implementation
 * Defines event handlers, API routes, and business logic
 */

/// <reference path="../../../pb_data/types.d.ts" />

import { Logger } from '../utils/logger';
import { UserService } from '../services/user-service';
import { PostService } from '../services/post-service';
import { RivetService } from '../services/rivet-service';
import { ConfigManager } from '../config/config';

export interface Services {
  userService: UserService;
  postService: PostService;
  rivetService: RivetService;
  config: ConfigManager;
  logger: Logger;
}

export function setupHooks(app: PocketBase, services: Services): void {
  const { userService, postService, rivetService, config, logger } = services;

  logger.info('Setting up hooks and API routes');

  // Setup API routes
  setupApiRoutes(app, services);
  
  // Setup event hooks
  setupEventHooks(app, services);

  logger.info('✅ Hooks and routes setup completed');
}

/**
 * Setup custom API routes
 */
function setupApiRoutes(app: PocketBase, services: Services): void {
  const { rivetService, logger } = services;

  // Health check endpoint
  app.onBeforeServe().add((e) => {
    e.router.add("GET", "/api/health", async (c) => {
      try {
        // Check services health
        const rivetHealth = await rivetService.healthCheck();
        
        const healthStatus = {
          status: rivetHealth.healthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          services: {
            rivet: rivetHealth,
            pocketbase: { healthy: true, message: 'PocketBase is running' }
          },
          version: '1.0.0'
        };

        logger.info('Health check requested', healthStatus);

        return c.json(200, healthStatus);
      } catch (error) {
        logger.error('Health check failed', error);
        return c.json(500, {
          status: 'error',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, /* middlewares */);

    // Rivet workflows status endpoint
    e.router.add("GET", "/api/rivet/workflows", async (c) => {
      try {
        const workflows = await rivetService.getAvailableWorkflows();
        
        logger.info('Workflows list requested', { count: workflows.length });

        return c.json(200, {
          status: 'success',
          data: workflows,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Failed to get workflows', error);
        return c.json(500, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }, /* middlewares */);

    logger.info('🔗 API routes registered: /api/health, /api/rivet/workflows');
  });
}

/**
 * Setup PocketBase event hooks
 */
function setupEventHooks(app: PocketBase, services: Services): void {
  const { userService, postService, rivetService, config, logger } = services;

  // User registration hooks
  app.onRecordAfterCreateRequest('_pb_users_auth_').add(async (e) => {
    try {
      logger.info('New user registered', { userId: e.record.id });
      
      // Create extended user profile
      const profileData = {
        display_name: e.record.getString('name') || e.record.getString('username'),
        is_public: false,
        public_stats: false,
        created_at: new Date().toISOString()
      };

      await userService.createUserProfile(e.record.id, profileData);
      
      // Analyze user with Rivet if enabled
      if (config.get().features.enableRivetIntegration) {
        try {
          const userAnalysis = await rivetService.analyzeUser(e.record.id, {
            username: e.record.getString('username'),
            email: e.record.getString('email'),
            registrationDate: e.record.getDateTime('created')
          });
          
          if (userAnalysis.success && userAnalysis.data) {
            // Store analysis results
            await userService.updateUserProfile(e.record.id, {
              rivet_analysis: userAnalysis.data,
              analysis_date: new Date().toISOString()
            });
          }
        } catch (rivetError) {
          logger.warn('User analysis failed', rivetError);
        }
      }
    } catch (error) {
      logger.error('Failed to process new user registration', error);
    }
  });

  // Post creation hooks
  app.onRecordAfterCreateRequest('posts').add(async (e) => {
    try {
      logger.info('New post created', { postId: e.record.id, authorId: e.record.getString('author') });
      
      // Only process published posts
      if (e.record.getString('status') === 'published') {
        // Process content with Rivet
        if (config.get().features.enableRivetIntegration) {
          try {
            const contentResult = await rivetService.processContent(
              e.record.getString('content'),
              {
                title: e.record.getString('title'),
                authorId: e.record.getString('author'),
                postId: e.record.id,
                tags: e.record.get('tags') || []
              }
            );
            
            if (contentResult.success && contentResult.data) {
              // Update post with processed content
              const updates: Record<string, any> = {};
              
              if (contentResult.data.processedContent) {
                updates.processed_content = contentResult.data.processedContent;
              }
              if (contentResult.data.summary) {
                updates.summary = contentResult.data.summary;
              }
              if (contentResult.data.suggestedTags) {
                updates.suggested_tags = contentResult.data.suggestedTags;
              }
              if (contentResult.data.seoTitle) {
                updates.meta_title = contentResult.data.seoTitle;
              }
              if (contentResult.data.seoDescription) {
                updates.meta_description = contentResult.data.seoDescription;
              }
              
              // Update the record
              for (const [key, value] of Object.entries(updates)) {
                e.record.set(key, value);
              }
              
              app.dao().saveRecord(e.record);
              logger.info('Post processed with Rivet', { postId: e.record.id });
            }
          } catch (rivetError) {
            logger.warn('Content processing failed', rivetError);
          }
        }
        
        // Moderate content
        try {
          const moderationResult = await postService.moderatePost(e.record.id);
          logger.info('Post moderated', { 
            postId: e.record.id, 
            approved: moderationResult.approved,
            reasons: moderationResult.reasons 
          });
        } catch (moderationError) {
          logger.warn('Content moderation failed', moderationError);
        }
      }
    } catch (error) {
      logger.error('Failed to process new post', error);
    }
  });

  // Post update hooks
  app.onRecordAfterUpdateRequest('posts').add(async (e) => {
    try {
      logger.info('Post updated', { postId: e.record.id });
      
      // Check if post was just published
      if (e.record.getString('status') === 'published' && e.record.originalCopy().getString('status') !== 'published') {
        logger.info('Post published', { postId: e.record.id });
        
        // Process newly published content
        if (config.get().features.enableRivetIntegration) {
          try {
            const contentResult = await rivetService.processContent(
              e.record.getString('content'),
              {
                title: e.record.getString('title'),
                authorId: e.record.getString('author'),
                postId: e.record.id,
                publishedAt: new Date().toISOString()
              }
            );
            
            if (contentResult.success && contentResult.data) {
              // Update with processing results
              if (contentResult.data.processedContent) {
                e.record.set('processed_content', contentResult.data.processedContent);
              }
              if (contentResult.data.summary) {
                e.record.set('summary', contentResult.data.summary);
              }
              
              app.dao().saveRecord(e.record);
            }
          } catch (rivetError) {
            logger.warn('Content processing on publish failed', rivetError);
          }
        }
      }
    } catch (error) {
      logger.error('Failed to process post update', error);
    }
  });

  // User profile update hooks
  app.onRecordAfterUpdateRequest('user_profiles').add(async (e) => {
    try {
      logger.info('User profile updated', { profileId: e.record.id, userId: e.record.getString('user') });
      
      // Re-analyze user if significant changes occurred
      if (config.get().features.enableRivetIntegration) {
        const significantFields = ['display_name', 'bio', 'interests', 'location'];
        const hasSignificantChanges = significantFields.some(field => 
          e.record.getString(field) !== e.record.originalCopy().getString(field)
        );
        
        if (hasSignificantChanges) {
          try {
            const userAnalysis = await rivetService.analyzeUser(e.record.getString('user'), {
              profile: e.record.exportPlain(),
              updateDate: new Date().toISOString()
            });
            
            if (userAnalysis.success && userAnalysis.data) {
              e.record.set('rivet_analysis', userAnalysis.data);
              e.record.set('analysis_date', new Date().toISOString());
              app.dao().saveRecord(e.record);
            }
          } catch (rivetError) {
            logger.warn('User profile analysis failed', rivetError);
          }
        }
      }
    } catch (error) {
      logger.error('Failed to process user profile update', error);
    }
  });

  // Auth hooks
  app.onRecordAuthRequest('_pb_users_auth_').add(async (e) => {
    try {
      logger.info('User authenticated', { userId: e.record.id });
      
      // Update last login time
      try {
        const profile = await userService.getUserProfile(e.record.id);
        if (profile) {
          profile.set('last_login', new Date().toISOString());
          app.dao().saveRecord(profile);
        }
      } catch (profileError) {
        logger.warn('Failed to update last login', profileError);
      }
    } catch (error) {
      logger.error('Failed to process auth request', error);
    }
  });

  // Validation hooks
  app.onRecordBeforeCreateRequest('posts').add((e) => {
    try {
      // Validate post data
      const title = e.record.getString('title');
      const content = e.record.getString('content');
      
      if (!title || title.length < 3) {
        throw new Error('Title must be at least 3 characters long');
      }
      
      if (!content || content.length < 10) {
        throw new Error('Content must be at least 10 characters long');
      }
      
      // Generate slug if not provided
      if (!e.record.getString('slug')) {
        const slug = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        e.record.set('slug', slug);
      }
      
      // Set default values
      if (!e.record.get('view_count')) {
        e.record.set('view_count', 0);
      }
      
      if (!e.record.getString('status')) {
        e.record.set('status', 'draft');
      }
      
      logger.debug('Post validation completed', { title, slug: e.record.getString('slug') });
    } catch (error) {
      logger.error('Post validation failed', error);
      throw error;
    }
  });

  logger.info('Event hooks setup completed');
}
