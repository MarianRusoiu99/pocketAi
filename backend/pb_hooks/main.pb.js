/// <reference path="../pb_data/types.d.ts" />

/**
 * PocketBase + Rivet Integration
 * Simple JavaScript-only implementation
 */

console.log('[INIT] Loading PocketBase + Rivet integration...');

console.log('[INIT] PocketBase hooks loaded successfully');

/**
 * Register API Routes
 * This must be in global scope for PocketBase to recognize the routes
 */
try {
    console.log('[INIT] Registering API routes...');
    
    // Story generation endpoint - THE MAIN ENDPOINT YOU NEED
    routerAdd("POST", "/api/stories/generate", (e) => {
        console.log('[API] Story generation endpoint called');
        
        try {
            // Load required modules inside the handler (PocketBase requirement)
            const RivetCore = require(`${__hooks}/lib/rivet-core.js`);
            
            // Get request data
            const requestData = e.requestInfo().body || {};
            console.log('[API] Request data:', JSON.stringify(requestData, null, 2));

            // Extract story parameters with defaults
            const storyData = {
                story_instructions: requestData.story_instructions || 'Create a fun adventure story for children.',
                primary_characters: requestData.primary_characters || 'A brave young explorer named Alex',
                secondary_characters: requestData.secondary_characters || 'A friendly talking animal companion',
                n_chapters: requestData.n_chapters || 3,
                l_chapter: requestData.l_chapter || 500
            };

            console.log('[API] Processing story with data:', JSON.stringify(storyData, null, 2));

            // Execute Rivet workflow
            const result = RivetCore.generateStory(storyData);
            
            if (result.success) {
                console.log('[API] Story generation successful');
                return e.json(200, {
                    success: true,
                    story: result.output,
                    executionTime: result.executionTime,
                    timestamp: new Date().toISOString()
                });
            } else {
                console.log('[API] Story generation failed:', result.error);
                return e.json(500, {
                    success: false,
                    error: result.error,
                    executionTime: result.executionTime,
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            console.log('[API] Story generation endpoint error:', error.toString());
            return e.json(500, {
                success: false,
                error: error.toString(),
                timestamp: new Date().toISOString()
            });
        }
    });

    // Test endpoint
    routerAdd("GET", "/api/test", (e) => {
        return e.json(200, {
            message: "PocketBase hooks are working!",
            timestamp: new Date().toISOString()
        });
    });

    // Rivet health check endpoint
    routerAdd("GET", "/api/rivet/health", (e) => {
        try {
            const RivetCore = require(`${__hooks}/lib/rivet-core.js`);
            const healthStatus = RivetCore.healthCheck();
            
            return e.json(200, {
                rivet: healthStatus,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            return e.json(500, {
                rivet: {
                    status: "error",
                    error: error.toString()
                },
                timestamp: new Date().toISOString()
            });
        }
    });

    console.log('[INIT] API routes registered successfully');
    
} catch (error) {
    console.log('[INIT] Failed to register API routes:', error.toString());
}

/**
 * Initialize the application
 */
function initializeApp() {
    try {
        // Load database helpers
        const DbHelpers = require(`${__hooks}/lib/db-helpers.js`);
        
        console.log('[INIT] Core modules loaded successfully');
        
        // Ensure required collections exist
        DbHelpers.utils.ensureStoriesCollection();
        
    } catch (error) {
        console.log('[INIT] Failed to initialize application:', error.toString());
        throw error;
    }
}

// Application bootstrap hook
onBootstrap((e) => {
    console.log('[HOOK] Bootstrap event triggered');
    console.log('[HOOK] Application bootstrap completed - skipping database setup during bootstrap');
    e.next();
});

// Story record hooks (if stories collection exists)
onRecordAfterCreateSuccess((e) => {
    console.log('[HOOK] New story record created:', e.record.id);
    
    // Auto-process story with Rivet if needed
    try {
        const RivetCore = require(`${__hooks}/lib/rivet-core.js`);
        const DbHelpers = require(`${__hooks}/lib/db-helpers.js`);
        
        // Check if story needs Rivet processing
        const needsProcessing = !e.record.get('rivet_processed');
        
        if (needsProcessing) {
            console.log('[HOOK] Auto-processing story with Rivet...');
            
            const storyData = {
                story_instructions: e.record.get('story_instructions') || '',
                primary_characters: e.record.get('primary_characters') || '',
                secondary_characters: e.record.get('secondary_characters') || '',
                n_chapters: e.record.get('n_chapters') || 1,
                l_chapter: e.record.get('l_chapter') || 500
            };
            
            // Execute Rivet workflow
            const result = RivetCore.generateStory(storyData);
            
            // Update record with results
            e.record.set('rivet_processed', result.success);
            e.record.set('rivet_result', result.success ? result.output : null);
            e.record.set('rivet_error', result.success ? null : result.error);
            e.record.set('execution_time', result.executionTime);
            e.record.set('processed_at', new Date().toISOString());
            e.record.set('status', result.success ? 'completed' : 'failed');
            
            // Save updated record
            $app.save(e.record);
            
            console.log('[HOOK] Story auto-processing completed:', result.success ? 'success' : 'failed');
        }
        
    } catch (error) {
        console.log('[HOOK] Story auto-processing failed:', error.toString());
    }
    
    e.next();
}, 'stories');

// Record enrichment hook
onRecordEnrich((e) => {
    // Add custom fields or transformations to records before sending to client
    if (e.record.collection().name === 'stories') {
        // Add computed fields
        const createdAt = new Date(e.record.get('created'));
        const now = new Date();
        const ageInHours = Math.floor((now - createdAt) / (1000 * 60 * 60));
        
        e.record.set('age_hours', ageInHours);
        
        // Parse Rivet result if it's JSON
        const rivetResult = e.record.get('rivet_result');
        if (rivetResult && typeof rivetResult === 'string') {
            try {
                const parsed = JSON.parse(rivetResult);
                e.record.set('parsed_story', parsed);
            } catch (parseError) {
                // Leave as string if not valid JSON
            }
        }
    }
    
    e.next();
});

// Cleanup hook (runs periodically)
onRecordAfterUpdateSuccess((e) => {
    // Trigger cleanup for old records occasionally
    if (Math.random() < 0.01) { // 1% chance
        console.log('[HOOK] Triggering periodic cleanup...');
        
        try {
            const DbHelpers = require(`${__hooks}/lib/db-helpers.js`);
            DbHelpers.utils.cleanupOldRecords('stories', 30);
        } catch (error) {
            console.log('[HOOK] Cleanup failed:', error.toString());
        }
    }
    
    e.next();
});

console.log('[INIT] Hook file loaded - endpoints should be available');
