/**
 * Configuration manager for PocketBase TypeScript hooks
 * Handles environment variables and application settings
 */

export interface AppConfig {
  environment: string;
  logLevel: string;
  appName: string;
  appVersion: string;
  apiPrefix: string;
  rivet: RivetConfig;
  database: DatabaseConfig;
  features: Features;
}

export interface RivetConfig {
  serverUrl: string;
  timeout: number;
  retryAttempts: number;
  // Common workflow names for easy reference
  workflows: {
    contentProcessor: string;
    userAnalytics: string;
    contentModeration: string;
  };
}

export interface DatabaseConfig {
  enableMigrations: boolean;
  enableBackups: boolean;
  backupInterval: string;
  maxBackups: number;
}

export interface Features {
  enableWebhooks: boolean;
  enableNotifications: boolean;
  enableFileUploads: boolean;
  enableRealtime: boolean;
  enableAnalytics: boolean;
  enableRivetIntegration: boolean;
}

export class ConfigManager {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    return {
      environment: this.getEnv('APP_ENV', 'development'),
      logLevel: this.getEnv('LOG_LEVEL', 'info'),
      appName: this.getEnv('APP_NAME', 'PocketBase TypeScript App'),
      appVersion: this.getEnv('APP_VERSION', '1.0.0'),
      apiPrefix: this.getEnv('API_PREFIX', '/api/v1'),
      rivet: {
        serverUrl: process.env.RIVET_SERVER_URL || 'http://localhost:3002',
        timeout: parseInt(this.getEnv('RIVET_TIMEOUT', '30100')),
        retryAttempts: parseInt(this.getEnv('RIVET_RETRY_ATTEMPTS', '3')),
        workflows: {
          contentProcessor: this.getEnv('RIVET_WORKFLOW_CONTENT_PROCESSOR', 'content-processor'),
          userAnalytics: this.getEnv('RIVET_WORKFLOW_USER_ANALYTICS', 'user-analytics'),
          contentModeration: this.getEnv('RIVET_WORKFLOW_CONTENT_MODERATION', 'content-moderation')
        }
      },
      database: {
        enableMigrations: this.getEnvBool('DB_ENABLE_MIGRATIONS', true),
        enableBackups: this.getEnvBool('DB_ENABLE_BACKUPS', true),
        backupInterval: this.getEnv('DB_BACKUP_INTERVAL', '24h'),
        maxBackups: parseInt(this.getEnv('DB_MAX_BACKUPS', '7'))
      },
      features: {
        enableWebhooks: this.getEnvBool('FEATURE_WEBHOOKS', true),
        enableNotifications: this.getEnvBool('FEATURE_NOTIFICATIONS', true),
        enableFileUploads: this.getEnvBool('FEATURE_FILE_UPLOADS', true),
        enableRealtime: this.getEnvBool('FEATURE_REALTIME', true),
        enableAnalytics: this.getEnvBool('FEATURE_ANALYTICS', false),
        enableRivetIntegration: this.getEnvBool('FEATURE_RIVET_INTEGRATION', true)
      }
    };
  }

  private getEnv(key: string, defaultValue: string): string {
    // Try to load from process.env first, then fallback to default
    return process.env[key] || defaultValue;
  }

  private getEnvBool(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  get(): AppConfig {
    return this.config;
  }

  isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  isProduction(): boolean {
    return this.config.environment === 'production';
  }

  getRivetConfig(): RivetConfig {
    return this.config.rivet;
  }
}
