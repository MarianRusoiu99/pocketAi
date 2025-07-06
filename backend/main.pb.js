var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/utils/logger.ts
var Logger = class {
  constructor(context, level = 1 /* INFO */) {
    __publicField(this, "context");
    __publicField(this, "currentLevel");
    this.context = context;
    this.currentLevel = level;
  }
  formatMessage(level, message, data) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.context}]`;
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    return `${prefix} ${message}`;
  }
  shouldLog(level) {
    return level >= this.currentLevel;
  }
  debug(message, data) {
    if (this.shouldLog(0 /* DEBUG */)) {
      console.log(this.formatMessage("DEBUG", message, data));
    }
  }
  info(message, data) {
    if (this.shouldLog(1 /* INFO */)) {
      console.log(this.formatMessage("INFO", message, data));
    }
  }
  warn(message, data) {
    if (this.shouldLog(2 /* WARN */)) {
      console.warn(this.formatMessage("WARN", message, data));
    }
  }
  error(message, error) {
    if (this.shouldLog(3 /* ERROR */)) {
      const errorData = error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error;
      console.error(this.formatMessage("ERROR", message, errorData));
    }
  }
  setLevel(level) {
    this.currentLevel = level;
  }
};

// src/config/config.ts
var ConfigManager = class {
  constructor() {
    __publicField(this, "config");
    this.config = this.loadConfig();
  }
  loadConfig() {
    return {
      environment: this.getEnv("APP_ENV", "development"),
      logLevel: this.getEnv("LOG_LEVEL", "info"),
      appName: this.getEnv("APP_NAME", "PocketBase TypeScript App"),
      appVersion: this.getEnv("APP_VERSION", "1.0.0"),
      apiPrefix: this.getEnv("API_PREFIX", "/api/v1"),
      rivet: {
        apiUrl: this.getEnv("RIVET_API_URL", "http://localhost:3000"),
        apiKey: this.getEnv("RIVET_API_KEY", ""),
        projectPath: this.getEnv("RIVET_PROJECT_PATH", "./rivet/project.rivet"),
        timeout: parseInt(this.getEnv("RIVET_TIMEOUT", "30000")),
        retryAttempts: parseInt(this.getEnv("RIVET_RETRY_ATTEMPTS", "3")),
        workflows: {
          contentProcessor: this.getEnv("RIVET_WORKFLOW_CONTENT_PROCESSOR", "content-processor"),
          userAnalytics: this.getEnv("RIVET_WORKFLOW_USER_ANALYTICS", "user-analytics"),
          contentModeration: this.getEnv("RIVET_WORKFLOW_CONTENT_MODERATION", "content-moderation")
        }
      },
      database: {
        enableMigrations: this.getEnvBool("DB_ENABLE_MIGRATIONS", true),
        enableBackups: this.getEnvBool("DB_ENABLE_BACKUPS", true),
        backupInterval: this.getEnv("DB_BACKUP_INTERVAL", "24h"),
        maxBackups: parseInt(this.getEnv("DB_MAX_BACKUPS", "7"))
      },
      features: {
        enableWebhooks: this.getEnvBool("FEATURE_WEBHOOKS", true),
        enableNotifications: this.getEnvBool("FEATURE_NOTIFICATIONS", true),
        enableFileUploads: this.getEnvBool("FEATURE_FILE_UPLOADS", true),
        enableRealtime: this.getEnvBool("FEATURE_REALTIME", true),
        enableAnalytics: this.getEnvBool("FEATURE_ANALYTICS", false),
        enableRivetIntegration: this.getEnvBool("FEATURE_RIVET_INTEGRATION", true)
      }
    };
  }
  getEnv(key, defaultValue) {
    return process.env[key] || defaultValue;
  }
  getEnvBool(key, defaultValue) {
    const value = process.env[key];
    if (value === void 0)
      return defaultValue;
    return value.toLowerCase() === "true";
  }
  get() {
    return this.config;
  }
  isDevelopment() {
    return this.config.environment === "development";
  }
  isProduction() {
    return this.config.environment === "production";
  }
  getRivetConfig() {
    return this.config.rivet;
  }
};

// main-simple.pb.ts
var logger = new Logger("main");
var config = new ConfigManager();
logger.info("\u{1F680} Starting PocketBase with TypeScript hooks");
$app.onBeforeServe().add((e) => {
  e.router.add("GET", "/api/health", async (c) => {
    try {
      const healthStatus = {
        status: "healthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        services: {
          pocketbase: { healthy: true, message: "PocketBase is running" },
          typescript: { healthy: true, message: "TypeScript hooks loaded" }
        },
        version: "1.0.0"
      };
      logger.info("Health check requested", healthStatus);
      return c.json(200, healthStatus);
    } catch (error) {
      logger.error("Health check failed", error);
      return c.json(500, {
        status: "error",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  logger.info("\u{1F517} API route registered: /api/health");
});
$app.onRecordAfterCreateRequest("posts").add(async (e) => {
  try {
    logger.info("New post created", {
      postId: e.record.id,
      title: e.record.getString("title"),
      authorId: e.record.getString("author")
    });
    e.record.set("processed_at", (/* @__PURE__ */ new Date()).toISOString());
    $app.dao().saveRecord(e.record);
    logger.info("Post processed successfully", { postId: e.record.id });
  } catch (error) {
    logger.error("Failed to process post", error);
  }
});
$app.onBeforeServe().add(() => {
  logger.info("\u2705 PocketBase TypeScript hooks initialized successfully");
  logger.info("\u{1F31F} Server ready - Health check available at /api/health");
});
