/// <reference path="../pb_data/types.d.ts" />

/**
 * PocketBase + Rivet Integration
 * Modular JavaScript-only implementation
 * 
 * This is the main entry point for PocketBase hooks and routes.
 * All business logic is modularized in the lib/ directory.
 */

console.log('[INIT] Loading PocketBase + Rivet integration...');

/**
 * Initialize the application
 */
function initializeApp() {
    try {
        // Load core modules
        const ApiRoutes = require(`${__hooks}/lib/api-routes.js`);
        const DbHelpers = require(`${__hooks}/lib/db-helpers.js`);
        
        console.log('[INIT] Core modules loaded successfully');
        
        // Register all API routes
        ApiRoutes.register();
        
        // Ensure required collections exist
        DbHelpers.utils.ensureStoriesCollection();

        
    } catch (error) {
        console.log('[INIT] Failed to initialize application:', error.toString());
        throw error;
    }
}

/**
 * PocketBase Event Hooks
 * These hooks are triggered by PocketBase events
 */

// Application bootstrap hook
onBootstrap((e) => {
    console.log('[HOOK] Bootstrap event triggered');
    
    try {
        initializeApp();
        console.log('[HOOK] Application bootstrap completed');
    } catch (error) {
        console.log('[HOOK] Bootstrap failed:', error.toString());
    }
    
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
