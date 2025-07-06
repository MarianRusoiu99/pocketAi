/**
 * Rivet Service for workflow integration
 * Handles communication with Rivet and workflow execution using @ironclad/rivet-node
 */

import { Logger } from '../utils/logger';
import { ConfigManager } from '../config/config';
import { runGraph, loadProjectFromFile, type DataValue } from '@ironclad/rivet-node';

export interface RivetWorkflowInput {
  [key: string]: any;
}

export interface RivetWorkflowOutput {
  success: boolean;
  data?: any;
  error?: string;
  executionId?: string;
  duration?: number;
}

export interface RivetWorkflowDefinition {
  id: string;
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
}

export class RivetService {
  private logger: Logger;
  private config: ConfigManager;
  private projectPath: string;
  private cachedProject: any = null;

  constructor() {
    this.logger = new Logger('RivetService');
    this.config = new ConfigManager();
    
    const rivetConfig = this.config.getRivetConfig();
    this.projectPath = rivetConfig.projectPath || './rivet/project.rivet';
  }

  /**
   * Load Rivet project if not already loaded
   */
  private async loadProject() {
    if (!this.cachedProject) {
      try {
        this.logger.info('Loading Rivet project', { projectPath: this.projectPath });
        this.cachedProject = await loadProjectFromFile(this.projectPath);
        this.logger.info('Rivet project loaded successfully');
      } catch (error) {
        this.logger.error('Failed to load Rivet project', error);
        throw new Error(`Failed to load Rivet project: ${error}`);
      }
    }
    return this.cachedProject;
  }

  /**
   * Execute a Rivet workflow/graph
   */
  async runWorkflow(graphId: string, input: RivetWorkflowInput): Promise<RivetWorkflowOutput> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting workflow execution', { graphId, input });

      // Load the project
      const project = await this.loadProject();
      
      // Convert input to Rivet DataValue format
      const rivetInputs: Record<string, DataValue> = {};
      for (const [key, value] of Object.entries(input)) {
        rivetInputs[key] = this.convertToDataValue(value);
      }

      // Execute the graph
      const result = await runGraph(project, {
        graph: graphId,
        inputs: rivetInputs,
        context: {
          executionId: `exec_${Date.now()}`,
          userId: 'pocketbase-user'
        }
      });

      const duration = Date.now() - startTime;

      this.logger.info('Workflow execution completed', {
        graphId,
        duration,
        success: true
      });

      return {
        success: true,
        data: this.convertFromDataValue(result.outputs),
        executionId: `exec_${Date.now()}`,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error('Workflow execution failed', { graphId, error, duration });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionId: `exec_${Date.now()}`,
        duration
      };
    }
  }

  /**
   * Convert JavaScript value to Rivet DataValue
   */
  private convertToDataValue(value: any): DataValue {
    if (typeof value === 'string') {
      return { type: 'string', value };
    } else if (typeof value === 'number') {
      return { type: 'number', value };
    } else if (typeof value === 'boolean') {
      return { type: 'boolean', value };
    } else if (Array.isArray(value)) {
      return { type: 'string[]', value };
    } else if (typeof value === 'object' && value !== null) {
      return { type: 'object', value };
    } else {
      return { type: 'string', value: String(value) };
    }
  }

  /**
   * Convert Rivet DataValue to JavaScript value
   */
  private convertFromDataValue(dataValue: any): any {
    if (!dataValue || typeof dataValue !== 'object') {
      return dataValue;
    }

    if (dataValue.type && dataValue.value !== undefined) {
      return dataValue.value;
    }

    // Handle object with multiple DataValues
    const result: any = {};
    for (const [key, value] of Object.entries(dataValue)) {
      result[key] = this.convertFromDataValue(value);
    }
    return result;
  }

  /**
   * Analyze user data using Rivet workflow
   */
  async analyzeUser(userId: string, userData: any): Promise<RivetWorkflowOutput> {
    return this.runWorkflow('user-analyzer', {
      userId,
      userData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Process content using Rivet workflow
   */
  async processContent(content: string, metadata: any): Promise<RivetWorkflowOutput> {
    return this.runWorkflow('content-processor', {
      content,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Moderate content using Rivet workflow
   */
  async moderateContent(content: string, context: any): Promise<RivetWorkflowOutput> {
    return this.runWorkflow('content-moderator', {
      content,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate content recommendations using Rivet workflow
   */
  async generateRecommendations(userId: string, userProfile: any): Promise<RivetWorkflowOutput> {
    return this.runWorkflow('recommendation-engine', {
      userId,
      userProfile,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get available workflows from the project
   */
  async getAvailableWorkflows(): Promise<RivetWorkflowDefinition[]> {
    try {
      const project = await this.loadProject();
      
      // Extract graph information from the project
      const workflows: RivetWorkflowDefinition[] = [];
      
      if (project.graphs) {
        for (const [graphId, graph] of Object.entries(project.graphs)) {
          workflows.push({
            id: graphId,
            name: (graph as any).metadata?.name || graphId,
            description: (graph as any).metadata?.description || '',
            inputSchema: (graph as any).metadata?.inputSchema || {},
            outputSchema: (graph as any).metadata?.outputSchema || {}
          });
        }
      }
      
      return workflows;
    } catch (error) {
      this.logger.error('Failed to get available workflows', error);
      return [];
    }
  }

  /**
   * Health check for Rivet service
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      await this.loadProject();
      return { healthy: true, message: 'Rivet service is healthy' };
    } catch (error) {
      return { 
        healthy: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
