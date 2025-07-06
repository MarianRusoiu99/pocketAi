/// <reference path="../pb_data/types.d.ts" />
/// <reference path="./src/types/pocketbase.d.ts" />

import { Logger } from './src/utils/logger';
import { ConfigManager } from './src/config/config';
import { UserService } from './src/services/user-service';
import { PostService } from './src/services/post-service';
import { RivetService } from './src/services/rivet-service';
import { setupHooks } from './src/hooks/setup';

/**
 * PocketBase TypeScript Hooks with Rivet Integration
 * Main entry point for the application backend
 */

// Initialize logger
const logger = new Logger('main');

// Initialize configuration
const config = new ConfigManager();

// Initialize services
const userService = new UserService();
const postService = new PostService();
const rivetService = new RivetService();

logger.info('🚀 Starting PocketBase with TypeScript hooks and Rivet integration');
logger.info('🔧 Initializing services...');

// Setup event hooks and routes
setupHooks($app, {
  userService,
  postService,
  rivetService,
  config,
  logger
});

logger.info('✅ PocketBase hooks initialized successfully');

// Health check endpoint
$app.onBeforeServe().add(() => {
  logger.info('🌟 PocketBase server starting with TypeScript hooks');
  logger.info('🤖 Rivet integration enabled for workflow management');
});
