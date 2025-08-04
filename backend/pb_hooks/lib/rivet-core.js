/**
 * Rivet Integration Core Module
 * Handles all Rivet workflow execution for PocketBase
 */

const RivetCore = {
    /**
     * Configuration for Rivet integration
     */
    config: {
        projectPath: '../../../rivet/ai.rivet-project',
        defaultTimeout: 60000,
        maxRetries: 3,
        
        // Graph IDs from your rivet project
        graphs: {
            storyGeneration: 'uLDGWIiCbhJiXnUV_JLQf',
            // Add more graph IDs as needed
        }
    },

    /**
     * Execute a Rivet workflow
     * @param {string} graphId - The graph ID to execute
     * @param {Object} inputs - Input parameters for the graph
     * @param {Object} options - Execution options
     */
    executeWorkflow: function(graphId, inputs, options = {}) {
        const startTime = Date.now();
        const timeout = options.timeout || this.config.defaultTimeout;
        
        try {
            console.log(`[Rivet] Executing workflow: ${graphId || 'main'}`);
            console.log(`[Rivet] Inputs:`, JSON.stringify(inputs));
            
            // Try to execute using Node.js rivet-node module
            const result = this._executeRivetGraph(graphId, inputs);
            
            const executionTime = Date.now() - startTime;
            console.log(`[Rivet] Workflow completed in ${executionTime}ms`);
            
            return {
                success: true,
                output: result,
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
     * Try to execute Rivet graph using Node.js
     * @private
     */
    _executeRivetGraph: function(graphId, inputs) {
        console.log('[Rivet] Attempting to execute real Rivet graph...');
        
        // Method 1: Try bridge server (most reliable)
        try {
            console.log('[Rivet] Trying bridge server...');
            const bridgeUrl = 'http://localhost:3001/execute';
            const payload = JSON.stringify({
                graphId: graphId,
                inputs: inputs
            });
            
            console.log('[Rivet] Sending to bridge:', payload);
            
            const result = $os.exec('curl', '-X', 'POST', 
                '-H', 'Content-Type: application/json',
                '-d', payload,
                bridgeUrl,
                '--connect-timeout', '10',
                '--max-time', '60',
                '--silent',
                '--show-error'
            );
            
            console.log('[Rivet] Bridge response:', result);
            
            if (result && result.trim().length > 0) {
                try {
                    const response = JSON.parse(result.trim());
                    if (response.success) {
                        console.log('[Rivet] Bridge execution successful');
                        return response.output;
                    } else {
                        console.log('[Rivet] Bridge returned error:', response.error);
                        throw new Error(`Bridge error: ${response.error}`);
                    }
                } catch (parseError) {
                    console.log('[Rivet] Failed to parse bridge response:', parseError.toString());
                    console.log('[Rivet] Raw response:', result);
                    throw new Error(`Invalid JSON response from bridge: ${parseError.message}`);
                }
            } else {
                throw new Error('Empty response from bridge server');
            }
            
        } catch (bridgeError) {
            console.log('[Rivet] Bridge execution failed:', bridgeError.toString());
            
            // Method 2: Try CLI as fallback
            console.log('[Rivet] Falling back to CLI execution...');
            try {
                const cliArgs = this._buildRivetCommand(graphId, inputs);
                console.log('[Rivet] CLI command:', 'npx', cliArgs.join(' '));
                
                const cliResult = $os.exec('npx', ...cliArgs.slice(1));
                console.log('[Rivet] CLI result:', cliResult);
                
                if (cliResult && cliResult.trim().length > 0) {
                    try {
                        return JSON.parse(cliResult.trim());
                    } catch (parseError) {
                        console.log('[Rivet] Failed to parse CLI result:', parseError.toString());
                        throw new Error('Failed to parse Rivet CLI output');
                    }
                } else {
                    throw new Error('Empty result from CLI');
                }
                
            } catch (cliError) {
                console.log('[Rivet] CLI execution also failed:', cliError.toString());
                throw new Error(`All execution methods failed. Bridge: ${bridgeError.message}, CLI: ${cliError.message}`);
            }
        }
    },

    /**
     * Generate a mock story for development/fallback
     * @private
     */
    _generateMockStory: function(inputs) {
        const titles = [
            "The Enchanted Forest",
            "Mystery of the Lost Kingdom",
            "Adventures in Wonderland",
            "The Secret Garden Chronicles",
            "Journey to the Magical Realm"
        ];
        
        const summaries = [
            "A captivating tale of discovery and friendship in a world where magic meets reality.",
            "An epic adventure following brave heroes as they uncover ancient secrets.",
            "A heartwarming story about finding courage in the most unexpected places.",
            "An enchanting journey through mysterious lands filled with wonder and danger.",
            "A thrilling quest that tests the bonds of friendship and the power of hope."
        ];
        
        const nChapters = inputs.n_chapters || 3;
        const chapterLength = inputs.l_chapter || 500;
        
        const chapters = [];
        for (let i = 1; i <= nChapters; i++) {
            chapters.push({
                chapterNumber: i,
                title: `Chapter ${i}: ${this._getRandomElement(['The Beginning', 'A New Discovery', 'The Challenge', 'Unexpected Allies', 'The Resolution'])}`,
                content: this._generateChapterContent(chapterLength, inputs.story_instructions),
                wordCount: chapterLength
            });
        }
        
        const themes = [
            "Friendship conquers all obstacles",
            "Courage can be found in the smallest acts",
            "Every ending is a new beginning",
            "The power of believing in yourself",
            "Hope illuminates the darkest paths"
        ];
        
        return {
            title: this._getRandomElement(titles),
            summary: this._getRandomElement(summaries),
            chapters: chapters,
            themesOrLessons: themes.slice(0, 3),
            imagePrompts: [
                "A mystical forest with glowing fireflies and ancient trees",
                "Heroes standing at the edge of a cliff overlooking a vast magical kingdom",
                "A cozy cottage with warm light spilling from its windows at twilight"
            ],
            metadata: {
                totalChapters: nChapters,
                estimatedReadingTime: `${Math.ceil(nChapters * chapterLength / 200)} minutes`,
                genre: "Fantasy Adventure",
                targetAudience: "Young Adult"
            }
        };
    },

    /**
     * Generate chapter content
     * @private
     */
    _generateChapterContent: function(length, instructions) {
        const baseContent = instructions ? 
            `Following the theme of "${instructions}", this chapter unfolds with rich detail and engaging narrative.` :
            "This chapter begins with our protagonist facing a new challenge.";
            
        // Generate content to approximately match the requested length
        const words = baseContent.split(' ');
        while (words.length < length) {
            words.push(...[
                "The story continues to develop with fascinating twists and turns.",
                "Characters grow and learn from their experiences.",
                "New discoveries await around every corner.",
                "The adventure deepens with each passing moment."
            ]);
        }
        
        return words.slice(0, length).join(' ') + '.';
    },

    /**
     * Get random element from array
     * @private
     */
    _getRandomElement: function(array) {
        return array[Math.floor(Math.random() * array.length)];
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
                args.push(`${key}=${String(value)}`);
            }
        }
        
        console.log(`[Rivet] Built command args:`, args);
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
