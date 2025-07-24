/**
 * Rivet Integration Core Module
 * Handles all Rivet workflow execution for PocketBase
 */

const RivetCore = {
    /**
     * Configuration for Rivet integration
     */
    config: {
        projectPath: '../rivet/ai.rivet-project',
        defaultTimeout: 30000,
        maxRetries: 3,
        
        // Graph IDs from your rivet project
        graphs: {
            storyGeneration: 'uLDGWIiCbhJiXnUV_JLQf',
            // Add more graph IDs as needed
        }
    },

    /**
     * Execute a Rivet workflow using CLI
     * @param {string} graphId - The graph ID to execute (optional)
     * @param {Object} inputs - Input parameters for the graph
     * @param {Object} options - Execution options
     */
    executeWorkflow: function(graphId, inputs, options = {}) {
        const startTime = Date.now();
        const timeout = options.timeout || this.config.defaultTimeout;
        
        try {
            // Build CLI command arguments
            const args = this._buildRivetCommand(graphId, inputs);
            
            console.log(`[Rivet] Executing workflow: ${graphId || 'main'}`);
            console.log(`[Rivet] Command args:`, JSON.stringify(args));
            
            // Set up environment for OpenAI API key
            // PocketBase runs in an isolated environment, so we need to explicitly pass env vars
            const env = {
                'OPENAI_API_KEY': $os.getenv('OPEN_AI_KEY') || $os.getenv('OPENAI_API_KEY') || '',
                'PATH': $os.getenv('PATH') || '/usr/local/bin:/usr/bin:/bin'
            };
            
            console.log(`[Rivet] Environment setup - OPENAI_API_KEY: ${env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);
            
            // Execute Rivet CLI - using correct PocketBase syntax
            const command = ['npx'].concat(args);
            console.log(`[Rivet] Full command:`, command.join(' '));
            
            const result = $os.exec(command[0], ...command.slice(1));
            
            const executionTime = Date.now() - startTime;
            
            console.log(`[Rivet] Workflow completed in ${executionTime}ms`);
            console.log(`[Rivet] Raw result:`, result.toString());
            
            // Parse the result - Rivet CLI returns JSON
            let parsedOutput;
            try {
                const resultStr = result.toString().trim();
                parsedOutput = JSON.parse(resultStr);
                
                // Extract the actual output from Rivet's response structure
                if (parsedOutput.output && parsedOutput.output.value) {
                    parsedOutput = parsedOutput.output.value;
                }
                
            } catch (parseError) {
                console.log(`[Rivet] Could not parse result as JSON, returning raw output`);
                console.log(`[Rivet] Parse error:`, parseError.toString());
                parsedOutput = result.toString();
            }
            
            return {
                success: true,
                output: parsedOutput,
                executionTime: executionTime,
                graphId: graphId || 'main',
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            const executionTime = Date.now() - startTime;
            
            console.log(`[Rivet] Workflow failed after ${executionTime}ms:`, error.toString());
            
            return {
                success: false,
                error: error.toString(),
                executionTime: executionTime,
                graphId: graphId || 'main',
                timestamp: new Date().toISOString()
            };
        }
    },

    /**
     * Execute the main story generation workflow
     * @param {Object} storyData - Story parameters
     */
    generateStory: function(storyData) {
        const inputs = {};
        
        // Map story data to rivet inputs
        if (storyData.story_instructions) {
            inputs.story_instructions = storyData.story_instructions;
        }
        if (storyData.primary_characters) {
            inputs.primary_characters = storyData.primary_characters;
        }
        if (storyData.secondary_characters) {
            inputs.secondary_characters = storyData.secondary_characters;
        }
        if (storyData.n_chapters) {
            inputs.n_chapters = storyData.n_chapters;
        }
        if (storyData.l_chapter) {
            inputs.l_chapter = storyData.l_chapter;
        }
        
        return this.executeWorkflow(this.config.graphs.storyGeneration, inputs);
    },

    /**
     * Build Rivet CLI command arguments
     * @private
     */
    _buildRivetCommand: function(graphId, inputs) {
        const args = ['@ironclad/rivet-cli', 'run', this.config.projectPath];
        
        // Add graph ID if specified
        if (graphId) {
            args.push(graphId);
        }
        
        // Add input parameters
        if (inputs && typeof inputs === 'object') {
            for (const [key, value] of Object.entries(inputs)) {
                args.push('--input');
                args.push(`${key}=${value}`);
            }
        }
        
        // Return args without 'npx' since that's handled in the exec call
        return args;
    },

    /**
     * Validate story data before processing
     * @param {Object} data - Story data to validate
     */
    validateStoryData: function(data) {
        const errors = [];
        
        if (!data) {
            errors.push('Story data is required');
            return { valid: false, errors };
        }
        
        // Add validation rules as needed
        if (data.n_chapters && (data.n_chapters < 1 || data.n_chapters > 20)) {
            errors.push('Number of chapters must be between 1 and 20');
        }
        
        if (data.l_chapter && (data.l_chapter < 50 || data.l_chapter > 2000)) {
            errors.push('Chapter length must be between 50 and 2000 words');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Health check for Rivet integration
     */
    healthCheck: function() {
        try {
            // Simple test execution
            const result = $os.exec('npx', '@ironclad/rivet-cli', '--version');
            
            return {
                status: 'healthy',
                rivetVersion: result.toString().trim(),
                projectPath: this.config.projectPath,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.toString(),
                timestamp: new Date().toISOString()
            };
        }
    }
};

module.exports = RivetCore;
