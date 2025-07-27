/**
 * Rivet Integration Core Module
 * Handles all Rivet workflow execution for PocketBase using HTTP requests
 */

const RivetCore = {
    /**
     * Configuration for Rivet integration
     */
    config: {
        projectPath: '../rivet/ai.rivet-project',
        defaultTimeout: 60000,
        maxRetries: 3,
        
        // Graph IDs from your rivet project
        graphs: {
            storyGeneration: 'uLDGWIiCbhJiXnUV_JLQf',
            // Add more graph IDs as needed
        }
    },

    /**
     * Execute a Rivet workflow using HTTP bridge
     * @param {string} graphId - The graph ID to execute (optional)
     * @param {Object} inputs - Input parameters for the graph
     * @param {Object} options - Execution options
     */
    executeWorkflow: function(graphId, inputs, options = {}) {
        const startTime = Date.now();
        const timeout = options.timeout || this.config.defaultTimeout;
        
        try {
            console.log(`[Rivet] Executing workflow: ${graphId || 'main'}`);
            console.log(`[Rivet] Inputs:`, JSON.stringify(inputs));
            
            // For now, use the working mock response since the HTTP bridge setup is complex
            // TODO: Replace with actual HTTP bridge call once the bridge server is properly configured
            
            console.log(`[Rivet] Using enhanced mock response for development...`);
            
            // Generate a more realistic story response
            const storyInstructions = inputs.story_instructions || "Write an engaging story";
            const primaryCharacters = inputs.primary_characters || "brave hero";
            const secondaryCharacters = inputs.secondary_characters || "helpful friends";
            const numChapters = parseInt(inputs.n_chapters) || 3;
            const chapterLength = parseInt(inputs.l_chapter) || 200;
            
            const mockStory = {
                "Title": this._generateTitle(primaryCharacters, storyInstructions),
                "Summary": this._generateSummary(storyInstructions, primaryCharacters, secondaryCharacters),
                "Chapters": [],
                "ThemesOrLessons": [
                    "The importance of courage and bravery", 
                    "The value of friendship and teamwork",
                    "Believing in yourself and your abilities"
                ]
            };
            
            // Generate chapters with more realistic content
            for (let i = 1; i <= numChapters; i++) {
                mockStory.Chapters.push({
                    "Number": i,
                    "Title": this._generateChapterTitle(i, numChapters, storyInstructions),
                    "ImagePrompt": this._generateImagePrompt(i, primaryCharacters, secondaryCharacters, storyInstructions),
                    "Content": this._generateChapterContent(i, numChapters, primaryCharacters, secondaryCharacters, storyInstructions, chapterLength)
                });
            }
            
            const executionTime = Date.now() - startTime;
            
            console.log(`[Rivet] Mock workflow completed in ${executionTime}ms`);
            console.log(`[Rivet] Generated story structure:`, JSON.stringify({
                title: mockStory.Title,
                chapters: mockStory.Chapters.length,
                themes: mockStory.ThemesOrLessons.length
            }));
            
            return {
                success: true,
                output: mockStory,
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
     * Generate a realistic story title
     * @private
     */
    _generateTitle: function(primaryCharacters, storyInstructions) {
        const titles = [
            `The Adventures of ${primaryCharacters}`,
            `${primaryCharacters} and the Great Adventure`,
            `The Journey of ${primaryCharacters}`,
            `${primaryCharacters}: A Tale of Courage`,
            `The Magic Adventure with ${primaryCharacters}`
        ];
        
        if (storyInstructions.toLowerCase().includes('friendship')) {
            titles.push(`${primaryCharacters} and the Power of Friendship`);
        }
        if (storyInstructions.toLowerCase().includes('rainbow')) {
            titles.push(`${primaryCharacters} and the Rainbow Quest`);
        }
        if (storyInstructions.toLowerCase().includes('magic')) {
            titles.push(`The Magical World of ${primaryCharacters}`);
        }
        
        return titles[Math.floor(Math.random() * titles.length)];
    },

    /**
     * Generate a realistic story summary
     * @private
     */
    _generateSummary: function(storyInstructions, primaryCharacters, secondaryCharacters) {
        return `Join ${primaryCharacters} on an incredible journey filled with adventure, friendship, and discovery! ${storyInstructions.replace('Write a', 'This').replace('Write an', 'This')} Along the way, they meet ${secondaryCharacters} who help them learn valuable lessons about courage, teamwork, and believing in themselves. A heartwarming tale that will inspire young readers to embrace their own adventures!`;
    },

    /**
     * Generate a chapter title
     * @private
     */
    _generateChapterTitle: function(chapterNum, totalChapters, storyInstructions) {
        const beginnings = ["The Beginning", "A New Start", "The First Step", "Setting Off"];
        const middles = ["The Challenge", "An Unexpected Turn", "The Discovery", "New Friends"];
        const endings = ["The Resolution", "Journey's End", "The Final Adventure", "Coming Home"];
        
        if (chapterNum === 1) {
            return beginnings[Math.floor(Math.random() * beginnings.length)];
        } else if (chapterNum === totalChapters) {
            return endings[Math.floor(Math.random() * endings.length)];
        } else {
            return middles[Math.floor(Math.random() * middles.length)];
        }
    },

    /**
     * Generate an image prompt for a chapter
     * @private
     */
    _generateImagePrompt: function(chapterNum, primaryCharacters, secondaryCharacters, storyInstructions) {
        const settings = ["a magical forest", "a colorful meadow", "a cozy village", "a sparkling stream", "a beautiful garden"];
        const activities = ["exploring together", "helping each other", "discovering something wonderful", "sharing a happy moment", "learning something new"];
        
        const setting = settings[Math.floor(Math.random() * settings.length)];
        const activity = activities[Math.floor(Math.random() * activities.length)];
        
        return `A vibrant, child-friendly illustration showing ${primaryCharacters} and ${secondaryCharacters} in ${setting}, ${activity}. The scene should be colorful, warm, and inviting, perfect for a children's story book.`;
    },

    /**
     * Generate chapter content
     * @private
     */
    _generateChapterContent: function(chapterNum, totalChapters, primaryCharacters, secondaryCharacters, storyInstructions, targetLength) {
        let content = "";
        
        if (chapterNum === 1) {
            content = `Once upon a time, ${primaryCharacters} lived in a wonderful place where adventures were always waiting to be discovered. One bright morning, they decided to embark on an exciting journey. ${storyInstructions.replace('Write a', 'They wanted to create a').replace('Write an', 'They wanted to create an')} As they prepared for their adventure, they met ${secondaryCharacters}, who would become important companions on their journey.`;
        } else if (chapterNum === totalChapters) {
            content = `As their amazing adventure came to an end, ${primaryCharacters} reflected on all the wonderful things they had learned. With the help of ${secondaryCharacters}, they had discovered the true meaning of friendship, courage, and believing in themselves. They realized that the greatest adventures come from the connections we make and the kindness we show to others. As they returned home, their hearts were full of joy and their minds full of beautiful memories that would last forever.`;
        } else {
            content = `The adventure continued as ${primaryCharacters} faced new challenges and discoveries. Along the way, ${secondaryCharacters} provided guidance and support, showing them that true friendship means helping each other through difficult times. Together, they learned important lessons about working as a team, being brave when things get scary, and never giving up on their dreams. Each step of their journey brought new wonders and deeper friendships.`;
        }
        
        // Pad the content to roughly match the target length
        const currentLength = content.length;
        if (currentLength < targetLength * 0.8) {
            content += ` The characters discovered that every challenge was an opportunity to grow stronger and wiser. They found joy in the simple moments and learned to appreciate the beauty around them. Their friendship grew deeper with each passing moment, creating bonds that would last a lifetime.`;
        }
        
        return content;
    },    /**
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
        
        // Add input parameters - ensure proper quoting for complex values
        if (inputs && typeof inputs === 'object') {
            for (const [key, value] of Object.entries(inputs)) {
                args.push('--input');
                // Quote the value if it contains spaces or special characters
                const valueStr = String(value);
                if (valueStr.includes(' ') || valueStr.includes('"') || valueStr.includes("'")) {
                    args.push(`${key}="${valueStr.replace(/"/g, '\\"')}"`);
                } else {
                    args.push(`${key}=${valueStr}`);
                }
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
