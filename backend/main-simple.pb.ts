/// <reference path="../pb_data/types.d.ts" />
/// <reference path="./src/types/pocketbase.d.ts" />

import { Logger } from './src/utils/logger';
import { ConfigManager } from './src/config/config';

/**
 * PocketBase TypeScript Hooks - Simplified Entry Point
 * Main entry point for testing basic functionality
 */

// Initialize logger
const logger = new Logger('main');

// Initialize configuration
const config = new ConfigManager();

logger.info('🚀 Starting PocketBase with TypeScript hooks');

// Health check endpoint
$app.onBeforeServe().add((e) => {
  e.router.add("GET", "/api/health", async (c) => {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          pocketbase: { healthy: true, message: 'PocketBase is running' },
          typescript: { healthy: true, message: 'TypeScript hooks loaded' }
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
  });

  logger.info('🔗 API route registered: /api/health');
});

// Simple event hook for testing
$app.onRecordAfterCreateRequest('posts').add(async (e) => {
  try {
    logger.info('New post created', { 
      postId: e.record.id, 
      title: e.record.getString('title'),
      authorId: e.record.getString('author')
    });
    
    // Simple enhancement - add timestamp
    e.record.set('processed_at', new Date().toISOString());
    $app.dao().saveRecord(e.record);
    
    logger.info('Post processed successfully', { postId: e.record.id });
  } catch (error) {
    logger.error('Failed to process post', error);
  }
});

$app.onBeforeServe().add(() => {
  logger.info('✅ PocketBase TypeScript hooks initialized successfully');
  logger.info('🌟 Server ready - Health check available at /api/health');
});
