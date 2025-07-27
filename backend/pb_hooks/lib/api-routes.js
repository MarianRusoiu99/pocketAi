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
             // Debug endpoint to test command execution
        routerAdd("GET", "/api/debug/exec", (e) => {
            try {
                console.log('[DEBUG] Testing basic command execution...');
                
                // Test 1: Simple command
                let result1;
                try {
                    result1 = $os.exec('echo', 'Hello World');
                    console.log('[DEBUG] Echo test result:', result1.toString());
                } catch (error) {
                    console.log('[DEBUG] Echo test failed:', error.toString());
                    result1 = 'ERROR: ' + error.toString();
                }
                
                // Test 2: npx version check
                let result2;
                try {
                    result2 = $os.exec('bash', '-c', 'npx @ironclad/rivet-cli --version');
                    console.log('[DEBUG] Rivet version test result:', result2.toString());
                } catch (error) {
                    console.log('[DEBUG] Rivet version test failed:', error.toString());
                    result2 = 'ERROR: ' + error.toString();
                }
                
                // Test 3: Environment variable test
                let result3;
                try {
                    result3 = $os.exec('bash', '-c', 'echo $OPENAI_API_KEY');
                    console.log('[DEBUG] Env var test result:', result3.toString());
                } catch (error) {
                    console.log('[DEBUG] Env var test failed:', error.toString());
                    result3 = 'ERROR: ' + error.toString();
                }
                
                return ResponseHelpers.success(e, {
                    message: 'Command execution tests completed',
                    tests: {
                        echo: result1.toString(),
                        rivetVersion: result2.toString(),
                        envVar: result3.toString()
                    },
                    pocketbaseExecType: typeof $os.exec,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.log('[DEBUG] Debug endpoint error:', error.toString());
                return ResponseHelpers.internalError(e, 'Debug test failed', error.toString());
            }
        }); const RivetCore = require(`${__hooks}/lib/rivet-core.js`);
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
                console.log('[API] Calling RivetCore.generateStory...');
                const result = RivetCore.generateStory(body);
                
                console.log('[API] RivetCore.generateStory result:', JSON.stringify(result, null, 2));
                
                if (result.success) {
                    // Validate that we have a proper story object
                    if (typeof result.output === 'string' && result.output.includes('npx @ironclad/rivet-cli')) {
                        console.log('[API] ERROR: Received command string instead of story output');
                        return ResponseHelpers.internalError(e, 'Workflow execution failed - received command instead of output', result.output);
                    }
                    
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
                    'GET /api/rivet/health',
                    'GET /api/test',
                    'POST /api/rivet/test'
                ]
            });
        });

        // Rivet workflow test endpoint
        routerAdd("POST", "/api/rivet/test", (e) => {
            try {
                console.log('[DEBUG] Testing Rivet workflow execution...');
                
                const testData = {
                    story_instructions: "Write a very short story about a cat",
                    primary_characters: "Felix the cat",
                    secondary_characters: "Spot the dog", 
                    n_chapters: 1,
                    l_chapter: 50
                };
                
                console.log('[DEBUG] Test data:', JSON.stringify(testData));
                
                const result = RivetCore.generateStory(testData);
                
                console.log('[DEBUG] Rivet test result:', JSON.stringify(result, null, 2));
                
                return ResponseHelpers.success(e, {
                    message: 'Rivet workflow test completed',
                    result: result,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.log('[DEBUG] Rivet workflow test error:', error.toString());
                return ResponseHelpers.internalError(e, 'Rivet workflow test failed', error.toString());
            }
        });
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

        // Debug endpoint to test command execution
        routerAdd("GET", "/api/debug/exec", (e) => {
            try {
                console.log('[DEBUG] Testing command execution...');
                
                // Test basic command execution
                const testResult = $os.exec('echo', 'Hello from PocketBase');
                console.log('[DEBUG] Echo test result:', testResult.toString());
                
                // Test npm/npx availability
                let npmTest;
                try {
                    npmTest = $os.exec('npx', '--version');
                    console.log('[DEBUG] NPX version test result:', npmTest.toString());
                } catch (npxError) {
                    console.log('[DEBUG] NPX test failed:', npxError.toString());
                    npmTest = `NPX Error: ${npxError.toString()}`;
                }
                
                // Test environment variables
                const envTest = {
                    OPENAI_API_KEY: $os.getenv('OPENAI_API_KEY') ? 'SET' : 'NOT SET',
                    OPEN_AI_KEY: $os.getenv('OPEN_AI_KEY') ? 'SET' : 'NOT SET',
                    PATH: $os.getenv('PATH') || 'NOT SET'
                };
                
                return ResponseHelpers.success(e, {
                    message: 'Debug execution test',
                    tests: {
                        echo: testResult.toString(),
                        npx: npmTest.toString(),
                        environment: envTest
                    }
                });
                
            } catch (error) {
                console.log('[DEBUG] Debug execution test error:', error.toString());
                return ResponseHelpers.internalError(e, 'Debug test failed', error.toString());
            }
        });

        // Debug endpoint specifically for Rivet CLI testing
        routerAdd("POST", "/api/debug/rivet", (e) => {
            try {
                console.log('[DEBUG] Testing Rivet CLI execution...');
                
                const body = e.requestInfo().body || {};
                const testData = {
                    story_instructions: body.story_instructions || 'Write a short test story about a cat.',
                    primary_characters: body.primary_characters || 'Whiskers the cat',
                    secondary_characters: body.secondary_characters || 'Mouse the mouse',
                    n_chapters: body.n_chapters || 1,
                    l_chapter: body.l_chapter || 100
                };
                
                console.log('[DEBUG] Test data:', JSON.stringify(testData));
                
                // Test the execution
                const result = RivetCore.generateStory(testData);
                
                console.log('[DEBUG] Rivet execution result:', JSON.stringify(result, null, 2));
                
                return ResponseHelpers.success(e, {
                    message: 'Rivet CLI debug test completed',
                    testData: testData,
                    result: result,
                    success: result.success,
                    outputType: typeof result.output,
                    isCommandString: typeof result.output === 'string' && result.output.includes('npx @ironclad/rivet-cli')
                });
                
            } catch (error) {
                console.log('[DEBUG] Rivet CLI debug test error:', error.toString());
                return ResponseHelpers.internalError(e, 'Rivet CLI debug test failed', error.toString());
            }
        });
    }
};

module.exports = ApiRoutes;
