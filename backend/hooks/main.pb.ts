/// <reference path="../pb_data/types.d.ts" />
/// <reference path="../src/types/pocketbase.d.ts" />

// Load environment variables from centralized .env.local file
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Logger } from '../src/utils/logger';
import { ConfigManager } from '../src/config/config';

/**
 * PocketBase TypeScript Hooks - Main Entry Point
 * This file gets compiled to main.pb.js which is loaded by PocketBase
 */

// Initialize logger and config
const logger = new Logger('main');
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
          typescript: { healthy: true, message: 'TypeScript hooks loaded' },
          rivet: { healthy: config.get().features.enableRivetIntegration, message: 'Rivet integration available' }
        },
        version: config.get().appVersion,
        environment: config.get().environment
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

// Example event hook for posts
$app.onRecordAfterCreateRequest('posts').add(async (e) => {
  try {
    logger.info('New post created', {
      postId: e.record.id,
      title: e.record.getString('title'),
      authorId: e.record.getString('author')
    });

    // Add processing timestamp
    e.record.set('processed_at', new Date().toISOString());
    $app.dao().saveRecord(e.record);

    logger.info('Post processed successfully', { postId: e.record.id });
  } catch (error) {
    logger.error('Failed to process post', error);
  }
});

// Server ready notification
$app.onBeforeServe().add(() => {
  logger.info('✅ PocketBase TypeScript hooks initialized successfully');
  logger.info('🌟 Server ready - Health check available at /api/health');
  logger.info('🎯 Admin interface: http://localhost:8090/_/');
});
