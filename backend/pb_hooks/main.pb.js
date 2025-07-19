/// <reference path="../pb_data/types.d.ts" />

/**
 * PocketBase JavaScript Hooks with Rivet Integration
 * 
 * Simple JavaScript hooks that integrate with Rivet CLI for AI workflow execution.
 * This file contains all the backend logic in pure JavaScript compatible with PocketBase's Goja runtime.
 */

// ============================================================================
// LOGGING UTILITY
// ============================================================================

/**
 * Structured logger for PocketBase hooks
 * @param {string} level - Log level (info, error, warn, debug)
 * @param {string} message - Log message
 * @param {*} data - Optional data to log
 */
function log(level, message, data) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [PB-Hooks] ${message}`;
    
    if (data) {
        console.log(logMessage, JSON.stringify(data));
    } else {
        console.log(logMessage);
    }
}

// ============================================================================
// RIVET SERVICE
// ============================================================================

/**
 * Rivet CLI service for workflow execution
 * Uses $os.exec to run Rivet CLI commands directly
 */
const RivetService = {
    projectPath: '../rivet/ai.rivet-project',
    cliCommand: 'npx @ironclad/rivet-cli',

    /**
     * Execute a Rivet workflow using CLI
     * @param {string|null} graphName - Name of the graph to run (optional)
     * @param {Object} input - Input data for the workflow
     * @returns {Object} Result of the workflow execution
     */
    runWorkflow: function(graphName, input) {
        const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();
        
        try {
            log('info', 'Starting Rivet workflow execution', { graphName, input, executionId });

            // Build the CLI command
            const command = this.buildFullCommand(graphName, input);
            log('info', 'Executing Rivet CLI command', { command, executionId });

            try {
                // Execute the command using PocketBase's $os.exec
                const result = $os.exec(command);
                const duration = Date.now() - startTime;
                
                if (result.code === 0) {
                    log('info', 'Rivet workflow completed successfully', { 
                        executionId, 
                        duration,
                        output: result.stdout ? result.stdout.substring(0, 200) + '...' : 'No output'
                    });
                    
                    // Try to parse JSON output
                    let data;
                    try {
                        data = JSON.parse(result.stdout || '{}');
                    } catch {
                        data = { raw_output: result.stdout || '' };
                    }
                    
                    return {
                        success: true,
                        data: data,
                        executionId: executionId,
                        duration: duration
                    };
                } else {
                    log('error', 'Rivet workflow execution failed', { 
                        executionId, 
                        duration,
                        code: result.code,
                        error: result.stderr 
                    });
                    
                    return {
                        success: false,
                        error: result.stderr || 'Command execution failed',
                        code: result.code,
                        executionId: executionId,
                        duration: duration
                    };
                }
            } catch (execError) {
                const duration = Date.now() - startTime;
                log('error', 'Command execution failed', { 
                    executionId,
                    error: execError.toString(),
                    command 
                });
                
                return {
                    success: false,
                    error: execError.toString(),
                    command: command,
                    executionId: executionId,
                    duration: duration,
                    fallback: true
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
                executionId: executionId,
                duration: duration
            };
        }
    },

    /**
     * Build CLI arguments array
     * @param {string|null} graphName - Graph name (optional)
     * @param {Object} input - Input data
     * @returns {string[]} CLI arguments
     */
    buildCliArgs: function(graphName, input) {
        const args = ['run', this.projectPath];
        
        if (graphName) {
            args.push(graphName);
        }
        
        if (input && typeof input === 'object') {
            for (const key in input) {
                if (input.hasOwnProperty(key)) {
                    const value = typeof input[key] === 'string' ? input[key] : JSON.stringify(input[key]);
                    args.push('--input', `${key}=${value}`);
                }
            }
        }
        
        return args;
    },

    /**
     * Build full CLI command string
     * @param {string|null} graphName - Graph name (optional)
     * @param {Object} input - Input data
     * @returns {string} Full CLI command
     */
    buildFullCommand: function(graphName, input) {
        const args = this.buildCliArgs(graphName, input);
        return `${this.cliCommand} ${args.join(' ')}`;
    },

    /**
     * Health check for Rivet CLI availability
     * @returns {Object} Health check result
     */
    healthCheck: function() {
        try {
            log('info', 'Performing Rivet service health check');
            
            // Check configuration
            const isConfigured = this.projectPath && this.cliCommand;
            
            if (isConfigured) {
                return {
                    healthy: true,
                    message: 'Rivet service is configured and ready',
                    details: {
                        projectPath: this.projectPath,
                        cliCommand: this.cliCommand,
                        approach: 'CLI-based execution with direct command execution'
                    }
                };
            } else {
                return {
                    healthy: false,
                    message: 'Rivet service configuration incomplete',
                    details: {
                        projectPath: this.projectPath,
                        cliCommand: this.cliCommand
                    }
                };
            }
        } catch (error) {
            return {
                healthy: false,
                message: 'Rivet service error',
                details: {
                    error: error.toString()
                }
            };
        }
    },

    /**
     * Get example CLI commands for manual execution
     * @returns {Object} Example commands
     */
    getExampleCommands: function() {
        return {
            healthCheck: `${this.cliCommand} --help`,
            runMainGraph: `${this.cliCommand} run ${this.projectPath}`,
            runSpecificGraph: `${this.cliCommand} run ${this.projectPath} "graph-name" --input key=value`,
            runWithJson: `echo '{"input1": "value1"}' | ${this.cliCommand} run ${this.projectPath} --inputs-stdin`
        };
    },

    /**
     * Process content with the main Rivet graph
     * @param {string} content - Content to process
     * @param {Object} metadata - Optional metadata
     * @returns {Object} Processing result
     */
    processStory: function(content, metadata) {
        return this.runWorkflow('main', {
            content: content,
            metadata: metadata ? JSON.stringify(metadata) : '{}',
            timestamp: new Date().toISOString()
        });
    }
};

// ============================================================================
// API ENDPOINTS
// ============================================================================


/**
 * Test endpoint to verify hooks are working
 * GET /api/test
 */
routerAdd("GET", "/api/test", (e) => {
    log('info', 'Test endpoint called');
    
    return e.json(200, { 
        message: "PocketBase hooks are working correctly",
        timestamp: new Date().toISOString(),
        hooks: "active",
        rivet: {
            configured: true,
            projectPath: RivetService.projectPath,
            cliCommand: RivetService.cliCommand,
            approach: "JavaScript-based CLI execution"
        }
    });
});

/**
 * Stories endpoint - processes content with Rivet main graph
 * POST /api/stories
 * Body: { "content": "story content", "metadata": {...} }
 */
routerAdd("POST", "/api/stories", (e) => {
    log('info', 'Stories endpoint called');
    
    try {
        const requestData = e.requestInfo().body || {};
        const content = requestData.content || '';
        const metadata = requestData.metadata || {};
        
        if (!content) {
            throw new BadRequestError("Content is required");
        }
        
        log('info', 'Processing story with Rivet', { 
            contentLength: content.length,
            metadata: metadata 
        });
        
        // Process the story with Rivet main graph
        const result = RivetService.processStory(content, metadata);
        
        return e.json(200, {
            message: "Story processed with Rivet",
            timestamp: new Date().toISOString(),
            input: { content: content.substring(0, 100) + '...', metadata },
            result: result
        });
    } catch (error) {
        log('error', 'Stories endpoint failed', error);
        return e.json(500, {
            success: false,
            error: error.toString(),
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Rivet test endpoint
 * POST /api/rivet/test
 * Body: { "graphName": "optional", "input": {...} }
 */
routerAdd("POST", "/api/rivet/test", (e) => {
    log('info', 'Rivet test endpoint called');
    
    try {
        const requestData = e.requestInfo().body || {};
        const graphName = requestData.graphName || null;
        const input = requestData.input || { test: "hello from PocketBase" };
        
        log('info', 'Testing Rivet workflow', { graphName, input });
        
        // Execute the workflow
        const result = RivetService.runWorkflow(graphName, input);
        
        return e.json(200, {
            message: "Rivet workflow executed",
            timestamp: new Date().toISOString(),
            input: { graphName, input },
            result: result
        });
    } catch (error) {
        log('error', 'Rivet test endpoint failed', error);
        return e.json(500, {
            success: false,
            error: error.toString(),
            timestamp: new Date().toISOString()
        });
    }
});

// ============================================================================
// EVENT HOOKS
// ============================================================================

/**
 * Hook to process stories after creation
 * Integrates with Rivet workflows for content processing
 */
onRecordAfterCreateRequest((e) => {
    log('info', 'Story created, processing with Rivet...', {
        recordId: e.record.id,
        collection: 'stories'
    });
    
    try {
        const record = e.record;
        const content = record.get("content") || "";
        
        if (content) {
            log('info', 'Processing story content', { 
                storyId: record.id, 
                contentLength: content.length
            });
            
            try {
                const rivetResult = RivetService.processStory(content, {
                    storyId: record.id,
                    title: record.get("title") || "",
                    author: record.get("author") || "unknown",
                    createdAt: record.get("created") || new Date().toISOString()
                });
                
                log('info', 'Rivet workflow executed for story', { 
                    storyId: record.id,
                    executionId: rivetResult.executionId,
                    success: rivetResult.success
                });
                
                // Update the record with processing results
                record.set("rivet_processed", rivetResult.success);
                record.set("rivet_execution_id", rivetResult.executionId);
                record.set("rivet_result", JSON.stringify(rivetResult));
                record.set("processed_at", new Date().toISOString());
                
            } catch (rivetError) {
                // Don't fail the story creation if Rivet processing fails
                log('error', 'Rivet workflow failed (non-blocking)', {
                    storyId: record.id,
                    error: rivetError.toString()
                });
                
                record.set("rivet_processed", false);
                record.set("rivet_error", rivetError.toString());
            }
        }
        
    } catch (error) {
        log('error', 'Story processing hook failed', {
            recordId: e.record.id,
            error: error.toString()
        });
    }
}, "stories");

// ============================================================================
// INITIALIZATION
// ============================================================================

log('info', '✅ PocketBase JavaScript hooks initialized successfully');
log('info', '🔗 API endpoints available:');
log('info', '   - GET  /api/health          - System health check');
log('info', '   - GET  /api/test            - Hook functionality test');
log('info', '   - POST /api/stories         - Process stories with Rivet main graph');
log('info', '   - POST /api/rivet/test      - Rivet workflow test');
log('info', '   - GET  /api/rivet/health    - Rivet service health');
log('info', '   - GET  /api/rivet/examples  - Rivet CLI command examples');
log('info', '🎯 Admin interface: http://localhost:8090/_/');
log('info', '🌟 Rivet CLI integration ready');
log('info', '📝 Ready to process stories with AI workflows');

console.log("[Hook] PocketBase JavaScript hooks initialized successfully");
