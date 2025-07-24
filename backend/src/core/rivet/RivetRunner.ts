import {
  GraphId,
  GraphInputs,
  GraphOutputs,
  coerceType,
  currentDebuggerState,
  loadProjectFromFile,
  runGraph
} from '@ironclad/rivet-node';

import { rivetDebuggerServerState } from './RivetDebuggerRoutes';
import { env } from 'process';

export interface RivetProjectConfig {
  projectPath: string;
  defaultGraphId?: string;
  openAiKey?: string;
}

export interface RivetExecutionResult {
  success: boolean;
  outputs?: GraphOutputs;
  error?: string;
  executionTime: number;
  graphId: string;
}

class RivetRunner {
  private config: RivetProjectConfig;
  private projectCache: any = null;

  constructor(config: RivetProjectConfig) {
    this.config = config;
  }

  /**
   * Run a specific rivet graph with inputs
   */
  async runGraph(graphId: GraphId, inputs?: GraphInputs): Promise<RivetExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Load project (with caching)
      const project = await this.getProject();
      
      const outputs = await runGraph(project, {
        graph: graphId,
        openAiKey: this.config.openAiKey || env.OPENAI_API_KEY as string,
        inputs,
        remoteDebugger: rivetDebuggerServerState.server ?? undefined,
        externalFunctions: this.getExternalFunctions(),
      });

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        outputs,
        executionTime,
        graphId: graphId as string
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
        graphId: graphId as string
      };
    }
  }

  /**
   * Run the main story generation graph
   */
  async runStoryGeneration(inputs: {
    story_instructions?: string;
    primary_characters?: string;
    secondary_characters?: string;
    n_chapters?: number;
    l_chapter?: number;
  }): Promise<RivetExecutionResult> {
    // Convert inputs to the format expected by the rivet graph
    const rivetInputs: GraphInputs = {};
    
    if (inputs.story_instructions) {
      rivetInputs.story_instructions = {
        type: 'string',
        value: inputs.story_instructions
      };
    }
    
    if (inputs.primary_characters) {
      rivetInputs.primary_characters = {
        type: 'string',
        value: inputs.primary_characters
      };
    }
    
    if (inputs.secondary_characters) {
      rivetInputs.secondary_characters = {
        type: 'string',
        value: inputs.secondary_characters
      };
    }
    
    if (inputs.n_chapters) {
      rivetInputs.n_chapters = {
        type: 'number',
        value: inputs.n_chapters
      };
    }
    
    if (inputs.l_chapter) {
      rivetInputs.l_chapter = {
        type: 'number',
        value: inputs.l_chapter
      };
    }

    // Use the main graph ID from your rivet project
    return this.runGraph('uLDGWIiCbhJiXnUV_JLQf' as GraphId, rivetInputs);
  }

  /**
   * Run a message-based chat graph
   */
  async runMessageGraph(messages: { type: 'assistant' | 'user'; message: string }[]): Promise<string> {
    const result = await this.runGraph(this.config.defaultGraphId as GraphId, {
      messages: {
        type: 'object[]',
        value: messages,
      },
    });

    if (!result.success || !result.outputs) {
      throw new Error(result.error || 'Failed to run message graph');
    }

    return coerceType(result.outputs.output, 'string');
  }

  /**
   * Get the loaded project (with caching)
   */
  private async getProject() {
    if (!this.projectCache) {
      this.projectCache = currentDebuggerState.uploadedProject ?? 
        await loadProjectFromFile(this.config.projectPath);
    }
    return this.projectCache;
  }

  /**
   * Define external functions available to rivet graphs
   */
  private getExternalFunctions() {
    return {
      // Add any external functions your rivet graphs need
      // Example calculation function (from rivet-example)
      calculate: async (_context: any, calculationStr: any) => {
        if (typeof calculationStr !== 'string') {
          throw Error('expected a string input for calculation');
        }
        
        // Simple safe calculation
        const isSafeExpression = /^[\d+\-*/\s().]+$/.test(calculationStr);
        if (isSafeExpression) {
          try {
            const value = eval(calculationStr);
            return {
              type: 'number',
              value,
            };
          } catch (error) {
            return {
              type: 'string',
              value: 'Error calculating',
            };
          }
        } else {
          return {
            type: 'string',
            value: 'Unsafe expression detected',
          };
        }
      },
    };
  }

  /**
   * Clear the project cache (useful for development)
   */
  clearCache() {
    this.projectCache = null;
  }
}

// Export a default instance configured for your project
export const defaultRivetRunner = new RivetRunner({
  projectPath: '../rivet/ai.rivet-project',
  defaultGraphId: 'uLDGWIiCbhJiXnUV_JLQf' as GraphId,
});

export default RivetRunner;
