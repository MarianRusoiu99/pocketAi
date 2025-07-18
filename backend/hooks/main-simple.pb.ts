/// <reference path="../pb_data/types.d.ts" />

/**
 * Simple PocketBase TypeScript Hooks - Compatible with Goja runtime
 * This version doesn't use external modules to be compatible with PocketBase's JavaScript environment
 */

// Simple logger that works with PocketBase
function log(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  console.log(data ? `${logMessage} ${JSON.stringify(data)}` : logMessage);
}

// Simplified Rivet service that makes HTTP calls without external dependencies
class SimpleRivetService {
  private serverUrl: string;

  constructor() {
    // Use environment variable or default
    this.serverUrl = process.env.RIVET_SERVER_URL || 'http://localhost:3002';
    log('info', 'SimpleRivetService initialized', { serverUrl: this.serverUrl });
  }

  async makeHttpRequest(url: string, method: string, body?: any): Promise<any> {
    // Use PocketBase's built-in HTTP client or fetch
    try {
      const response = await $http.send({
        url: url,
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined,
        timeout: 30100
      });
      
      return {
        success: true,
        data: response.json,
        status: response.statusCode
      };
    } catch (error) {
      log('error', 'HTTP request failed', { url, error: error.toString() });
      return {
        success: false,
        error: error.toString()
      };
    }
  }

  async runWorkflow(graphName: string | null, input: any): Promise<any> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    try {
      log('info', 'Starting workflow execution', { graphName, input, executionId });

      // Prepare the request URL
      const url = graphName 
        ? `${this.serverUrl}/${encodeURIComponent(graphName)}`
        : this.serverUrl;

      // Make HTTP request to Rivet server
      const result = await this.makeHttpRequest(url, 'POST', input);
      
      const duration = Date.now() - startTime;

      if (result.success) {
        log('info', 'Workflow execution completed', { 
          graphName, 
          duration, 
          executionId,
          status: result.status 
        });

        return {
          success: true,
          data: result.data,
          executionId,
          duration
        };
      } else {
        return {
          success: false,
          error: result.error,
          executionId,
          duration
        };
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      log('error', 'Workflow execution failed', { 
        graphName, 
        error: error.toString(), 
        duration,
        executionId 
      });
      
      return {
        success: false,
        error: error.toString(),
        executionId,
        duration
      };
    }
  }

  async healthCheck(): Promise<any> {
    try {
      const result = await this.makeHttpRequest(this.serverUrl, 'GET');
      
      if (result.success || result.status < 500) {
        return {
          healthy: true,
          message: 'Rivet server is accessible',
          details: {
            serverUrl: this.serverUrl,
            status: result.status
          }
        };
      } else {
        return {
          healthy: false,
          message: 'Rivet server health check failed',
          details: {
            serverUrl: this.serverUrl,
            error: result.error
          }
        };
      }
    } catch (error) {
      return {
        healthy: false,
        message: 'Rivet server not accessible',
        details: {
          serverUrl: this.serverUrl,
          error: error.toString()
        }
      };
    }
  }
}

// Initialize the simple Rivet service
const rivetService = new SimpleRivetService();

log('info', '🚀 Starting PocketBase with simplified TypeScript hooks');

// Health check endpoint  
$app.onBeforeServe().add((e) => {
  e.router.add("GET", "/api/health", (c) => {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        pocketbase: { healthy: true, message: 'PocketBase is running' },
        typescript: { healthy: true, message: 'TypeScript hooks loaded' }
      },
      version: '1.0.0',
      environment: 'development'
    };

    log('info', 'Health check requested');
    return c.json(200, healthStatus);
  });

  // Simple Rivet workflow demo endpoint
  e.router.add("POST", "/api/rivet/demo", async (c) => {
    try {
      log('info', 'Running simple Rivet demo workflow');
      
      // Run the main graph with simple test input
      const result = await rivetService.runWorkflow(null, { 
        test_input: "Hello from PocketBase!"
      });
      
      return c.json(200, {
        message: "Rivet demo completed",
        timestamp: new Date().toISOString(),
        result
      });
    } catch (error) {
      log('error', 'Rivet demo failed', error);
      return c.json(500, {
        success: false,
        error: error.toString()
      });
    }
  });

  // Test Rivet workflow endpoint
  e.router.add("POST", "/api/rivet/test", async (c) => {
    try {
      const body = c.request.json();
      const { graphName, input } = body;
      
      log('info', 'Testing Rivet workflow', { graphName, input });
      
      // Run the workflow with provided input
      const result = await rivetService.runWorkflow(graphName || null, input || { test: "hello" });
      
      return c.json(200, result);
    } catch (error) {
      log('error', 'Rivet workflow test failed', error);
      return c.json(500, {
        success: false,
        error: error.toString()
      });
    }
  });

  log('info', '🔗 API routes registered: /api/health, /api/rivet/test, /api/rivet/demo');
});

// Example event hook for posts - shows Rivet integration
$app.onRecordAfterCreateRequest('posts').add(async (e) => {
  try {
    log('info', 'New post created', {
      postId: e.record.id,
      title: e.record.getString('title'),
      authorId: e.record.getString('author')
    });

    // Add processing timestamp
    e.record.set('processed_at', new Date().toISOString());
    
    // Example: Process content with Rivet workflow (if enabled)
    const content = e.record.getString('content');
    if (content) {
      try {
        log('info', 'Processing post content with Rivet', { postId: e.record.id });
        
        // Run content processing workflow
        const rivetResult = await rivetService.runWorkflow('content-processor', {
          content: content,
          metadata: JSON.stringify({
            postId: e.record.id,
            author: e.record.getString('author'),
            title: e.record.getString('title')
          }),
          timestamp: new Date().toISOString()
        });
        
        if (rivetResult.success && rivetResult.data) {
          // Store Rivet processing results in a metadata field
          e.record.set('rivet_analysis', JSON.stringify(rivetResult.data));
          log('info', 'Rivet content processing completed', { 
            postId: e.record.id, 
            duration: rivetResult.duration 
          });
        } else {
          log('warn', 'Rivet content processing failed', { 
            postId: e.record.id, 
            error: rivetResult.error 
          });
        }
      } catch (rivetError) {
        // Don't fail the post creation if Rivet processing fails
        log('error', 'Rivet workflow error (non-blocking)', rivetError);
      }
    }
    
    $app.dao().saveRecord(e.record);
    log('info', 'Post processed successfully', { postId: e.record.id });
  } catch (error) {
    log('error', 'Failed to process post', error);
  }
});

// Server ready notification
$app.onBeforeServe().add(() => {
  log('info', '✅ PocketBase TypeScript hooks initialized successfully');
  log('info', '🌟 Server ready - Health check available at /api/health');
  log('info', '🎯 Admin interface: http://localhost:8090/_/');
});
