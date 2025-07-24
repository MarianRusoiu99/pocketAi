/**
 * API Routes Module
 * Centralized route definitions and handlers
 */

const ApiRoutes = {
    /**
     * Register all API routes
     */
    register: function() {
        // Load required modules
        const RivetCore = require(`${__hooks}/lib/rivet-core.js`);
        const ResponseHelpers = require(`${__hooks}/lib/response-helpers.js`);
        
        // Story generation routes
        this.registerStoryRoutes(RivetCore, ResponseHelpers);
        
        // Health check routes
        this.registerHealthRoutes(RivetCore, ResponseHelpers);
        
        // Development and testing routes
        this.registerDevRoutes(RivetCore, ResponseHelpers);
        
        console.log('[API] All routes registered successfully');
    },

    /**
     * Register story-related routes
     */
    registerStoryRoutes: function(RivetCore, ResponseHelpers) {
        // Main story generation endpoint
        routerAdd("POST", "/api/stories/generate", (e) => {
            try {
                const body = e.requestInfo().body || {};
                
                console.log('[API] Story generation request received:', JSON.stringify(body));
                
                // Validate request data
                const validation = RivetCore.validateStoryData(body);
                if (!validation.valid) {
                    return ResponseHelpers.validationError(e, validation.errors);
                }
                
                // Execute story generation workflow
                const result = RivetCore.generateStory(body);
                
                if (result.success) {
                    return ResponseHelpers.success(e, {
                        message: 'Story generated successfully',
                        story: result.output,
                        metadata: {
                            executionTime: result.executionTime,
                            graphId: result.graphId,
                            timestamp: result.timestamp
                        }
                    });
                } else {
                    return ResponseHelpers.rivetError(e, result.error, {
                        executionTime: result.executionTime,
                        graphId: result.graphId
                    });
                }
                
            } catch (error) {
                console.log('[API] Story generation handler error:', error.toString());
                return ResponseHelpers.internalError(e, 'Story generation failed', error.toString());
            }
        });

        // Batch story generation (for future use)
        routerAdd("POST", "/api/stories/generate/batch", (e) => {
            try {
                const body = e.requestInfo().body || {};
                const stories = body.stories || [];
                
                if (!Array.isArray(stories) || stories.length === 0) {
                    return ResponseHelpers.validationError(e, ['Stories array is required']);
                }
                
                if (stories.length > 10) {
                    return ResponseHelpers.validationError(e, ['Maximum 10 stories allowed in batch']);
                }
                
                const results = [];
                for (let i = 0; i < stories.length; i++) {
                    const storyData = stories[i];
                    const validation = RivetCore.validateStoryData(storyData);
                    
                    if (!validation.valid) {
                        results.push({
                            index: i,
                            success: false,
                            errors: validation.errors
                        });
                        continue;
                    }
                    
                    const result = RivetCore.generateStory(storyData);
                    results.push({
                        index: i,
                        success: result.success,
                        story: result.success ? result.output : null,
                        error: result.success ? null : result.error,
                        executionTime: result.executionTime
                    });
                }
                
                return ResponseHelpers.success(e, {
                    message: 'Batch story generation completed',
                    results: results,
                    summary: {
                        total: stories.length,
                        successful: results.filter(r => r.success).length,
                        failed: results.filter(r => !r.success).length
                    }
                });
                
            } catch (error) {
                console.log('[API] Batch story generation error:', error.toString());
                return ResponseHelpers.internalError(e, 'Batch story generation failed', error.toString());
            }
        });
    },

    /**
     * Register health check routes
     */
    registerHealthRoutes: function(RivetCore, ResponseHelpers) {
        // System health check
        routerAdd("GET", "/api/health", (e) => {
            try {
                const health = RivetCore.healthCheck();
                
                return ResponseHelpers.success(e, {
                    message: 'System health check',
                    system: {
                        status: 'operational',
                        timestamp: new Date().toISOString(),
                        version: 'v1.0.0'
                    },
                    rivet: health
                });
                
            } catch (error) {
                console.log('[API] Health check error:', error.toString());
                return ResponseHelpers.internalError(e, 'Health check failed', error.toString());
            }
        });

        // Rivet-specific health check
        routerAdd("GET", "/api/rivet/health", (e) => {
            try {
                const health = RivetCore.healthCheck();
                return ResponseHelpers.success(e, health);
                
            } catch (error) {
                console.log('[API] Rivet health check error:', error.toString());
                return ResponseHelpers.internalError(e, 'Rivet health check failed', error.toString());
            }
        });
    },

    /**
     * Register development and testing routes
     */
    registerDevRoutes: function(RivetCore, ResponseHelpers) {
        // Test endpoint for basic functionality
        routerAdd("GET", "/api/test", (e) => {
            return ResponseHelpers.success(e, {
                message: 'PocketBase + Rivet integration is working',
                timestamp: new Date().toISOString(),
                endpoints: [
                    'POST /api/stories/generate',
                    'POST /api/stories/generate/batch',
                    'GET /api/health',
                    'GET /api/rivet/health',
                    'GET /api/test',
                    'POST /api/rivet/test'
                ]
            });
        });

        // Rivet workflow test endpoint
        routerAdd("POST", "/api/rivet/test", (e) => {
            try {
                const body = e.requestInfo().body || {};
                const testInput = body.input || 'Hello, Rivet!';
                
                // Execute a simple test workflow
                const result = RivetCore.executeWorkflow(null, { test: testInput });
                
                return ResponseHelpers.success(e, {
                    message: 'Rivet test execution completed',
                    input: testInput,
                    result: result
                });
                
            } catch (error) {
                console.log('[API] Rivet test error:', error.toString());
                return ResponseHelpers.internalError(e, 'Rivet test failed', error.toString());
            }
        });

        // Configuration info endpoint
        routerAdd("GET", "/api/config", (e) => {
            return ResponseHelpers.success(e, {
                message: 'System configuration',
                rivet: {
                    projectPath: RivetCore.config.projectPath,
                    defaultTimeout: RivetCore.config.defaultTimeout,
                    maxRetries: RivetCore.config.maxRetries,
                    availableGraphs: Object.keys(RivetCore.config.graphs)
                },
                pocketbase: {
                    hooksDir: __hooks
                }
            });
        });
    }
};

module.exports = ApiRoutes;
