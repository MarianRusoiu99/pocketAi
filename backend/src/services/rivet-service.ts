/**
 * Rivet Service for workflow integration
 * Handles workflow execution using Rivet HTTP server - simple, reliable, and follows REST API patterns
 * 
 * Architecture:
 * - Rivet CLI runs as a separate HTTP server (rivet serve)
 * - This service makes HTTP calls to execute workflows
 * - Each workflow runs independently with proper isolation
 * - Easy to test, debug, and monitor
 */

import { Logger } from '../utils/logger';
import { ConfigManager } from '../config/config';
import axios, { AxiosResponse } from 'axios';

// Simple interfaces for workflow execution
export interface RivetWorkflowInput {
  [key: string]: any;
}

export interface RivetWorkflowOutput {
  success: boolean;
  data?: any;
  error?: string;
  executionId?: string;
  duration?: number;
  cost?: number;
}

// Rivet server configuration
interface RivetServerConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
}

export class RivetService {
  private logger: Logger;
  private config: ConfigManager;
  private serverConfig: RivetServerConfig;

  constructor() {
    this.logger = new Logger('RivetService');
    this.config = new ConfigManager();
    
    const rivetConfig = this.config.getRivetConfig();
    this.serverConfig = {
      baseUrl: rivetConfig.serverUrl || 'http://localhost:3001',
      timeout: rivetConfig.timeout || 30100,
      maxRetries: rivetConfig.retryAttempts || 3
    };
    
    this.logger.info('RivetService initialized', { 
      serverUrl: this.serverConfig.baseUrl,
      timeout: this.serverConfig.timeout
    });
  }

  /**
   * Execute a Rivet workflow/graph using HTTP API
   * Makes a POST request to the Rivet server to execute a specific graph
   * 
   * @param graphName - Name of the graph to execute (optional, uses main graph if not specified)
   * @param input - Input data for the workflow
   * @returns Promise with workflow execution results
   */
  async runWorkflow(graphName: string | null, input: RivetWorkflowInput): Promise<RivetWorkflowOutput> {
    const startTime = Date.now();
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      this.logger.info('Starting workflow execution via HTTP', { 
        graphName, 
        input, 
        executionId,
        serverUrl: this.serverConfig.baseUrl 
      });

      // Prepare the request URL
      const url = graphName 
        ? `${this.serverConfig.baseUrl}/${encodeURIComponent(graphName)}`
        : this.serverConfig.baseUrl;

      // Convert simple inputs to Rivet DataValue format when needed
      const rivetInputs = this.convertToRivetInputFormat(input);

      this.logger.debug('Making HTTP request to Rivet server', { url, inputs: rivetInputs });

      // Make HTTP request to Rivet server
      const response: AxiosResponse = await axios.post(url, rivetInputs, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: this.serverConfig.timeout,
      });
      
      const duration = Date.now() - startTime;

      // Extract cost information if available
      const cost = response.data.cost || 0;

      // Convert Rivet DataValue format to simple values
      const simplifiedData = this.convertRivetOutputToSimpleData(response.data);

      this.logger.info('Workflow execution completed successfully', {
        graphName,
        duration,
        executionId,
        cost,
        outputKeys: Object.keys(simplifiedData)
      });

      return {
        success: true,
        data: simplifiedData,
        executionId,
        duration,
        cost
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(error)) {
        errorMessage = `HTTP ${error.response?.status}: ${error.response?.statusText || error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      this.logger.error('Workflow execution failed', { 
        graphName, 
        error: errorMessage, 
        duration,
        executionId 
      });
      
      return {
        success: false,
        error: errorMessage,
        executionId,
        duration
      };
    }
  }

  /**
   * Convert simple input values to Rivet DataValue format when necessary
   * Rivet expects: { "input1": "simple value" } or { "input1": { "type": "string", "value": "complex value" } }
   */
  private convertToRivetInputFormat(input: RivetWorkflowInput): any {
    const result: any = {};
    
    for (const [key, value] of Object.entries(input)) {
      // For simple types, Rivet server accepts them directly
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        result[key] = value;
      } else {
        // For complex objects, wrap in DataValue format
        result[key] = {
          type: 'object',
          value: value
        };
      }
    }
    
    return result;
  }

  /**
   * Convert Rivet's DataValue format to simple JavaScript values
   * Rivet server outputs in format: { "output1": { "type": "string", "value": "hello" } }
   */
  private convertRivetOutputToSimpleData(rivetOutput: any): any {
    const result: any = {};
    
    for (const [key, dataValue] of Object.entries(rivetOutput)) {
      // Skip metadata keys like 'cost'
      if (key === 'cost') continue;
      
      if (dataValue && typeof dataValue === 'object' && 'type' in dataValue && 'value' in dataValue) {
        // This is a Rivet DataValue - extract the actual value
        result[key] = (dataValue as any).value;
      } else {
        // This is already a simple value
        result[key] = dataValue;
      }
    }
    
    return result;
  }

  /**
   * Pre-defined workflow methods for common use cases
   * These provide a clean API for the most common workflow patterns
   */

  /**
   * Analyze user data using the 'user-analyzer' graph
   */
  async analyzeUser(userId: string, userData: any): Promise<RivetWorkflowOutput> {
    return this.runWorkflow('user-analyzer', {
      userId,
      userData: JSON.stringify(userData),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Process content using the 'content-processor' graph
   */
  async processContent(content: string, metadata: any = {}): Promise<RivetWorkflowOutput> {
    return this.runWorkflow('content-processor', {
      content,
      metadata: JSON.stringify(metadata),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Moderate content using the 'content-moderator' graph
   */
  async moderateContent(content: string, context: any = {}): Promise<RivetWorkflowOutput> {
    return this.runWorkflow('content-moderator', {
      content,
      context: JSON.stringify(context),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate content recommendations using the 'recommendation-engine' graph
   */
  async generateRecommendations(userId: string, userProfile: any): Promise<RivetWorkflowOutput> {
    return this.runWorkflow('recommendation-engine', {
      userId,
      userProfile: JSON.stringify(userProfile),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Health check for Rivet service
   * Tests that the Rivet server is running and accessible
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string; details?: any }> {
    try {
      this.logger.debug('Performing health check on Rivet server');
      
      // Make a simple request to check if server is alive
      const response = await axios.get(`${this.serverConfig.baseUrl}`, {
        timeout: 5000, // Shorter timeout for health checks
        validateStatus: (status) => status < 500 // Accept 4xx but not 5xx
      });
      
      return {
        healthy: true,
        message: 'Rivet server is accessible',
        details: {
          serverUrl: this.serverConfig.baseUrl,
          status: response.status,
          accessible: true
        }
      };
      
    } catch (error) {
      let errorMessage = 'Rivet server health check failed';
      let details: any = { serverUrl: this.serverConfig.baseUrl };
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Rivet server is not running or not accessible';
          details.issue = 'connection_refused';
        } else {
          errorMessage = `Rivet server error: ${error.message}`;
          details.issue = 'server_error';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
        details.issue = 'unknown_error';
      }
      
      return {
        healthy: false,
        message: errorMessage,
        details
      };
    }
  }
}

// Export the service
export default RivetService;
