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
            
            // Execute Rivet CLI
            const result = $os.exec('npx', ...args);
            const executionTime = Date.now() - startTime;
            
            console.log(`[Rivet] Workflow completed in ${executionTime}ms`);
            
            return {
                success: true,
                output: result.toString(),
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
