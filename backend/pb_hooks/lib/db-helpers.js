/**
 * Database Helpers Module
 * Utilities for PocketBase database operations
 */

const DbHelpers = {
    /**
     * Story collection management
     */
    stories: {
        /**
         * Create a new story record
         * @param {Object} storyData - Story data
         * @param {Object} rivetResult - Rivet execution result
         */
        create: function(storyData, rivetResult) {
            try {
                const collection = $app.findCollectionByNameOrId('stories');
                if (!collection) {
                    console.log('[DB] Stories collection not found - skipping database save');
                    return null;
                }

                const record = new Record(collection, {
                    // Input data
                    story_instructions: storyData.story_instructions || '',
                    primary_characters: storyData.primary_characters || '',
                    secondary_characters: storyData.secondary_characters || '',
                    n_chapters: storyData.n_chapters || 1,
                    l_chapter: storyData.l_chapter || 500,

                    // Rivet execution results
                    rivet_processed: rivetResult.success,
                    rivet_execution_id: this._generateExecutionId(),
                    rivet_result: rivetResult.success ? rivetResult.output : null,
                    rivet_error: rivetResult.success ? null : rivetResult.error,
                    execution_time: rivetResult.executionTime,
                    processed_at: new Date().toISOString(),

                    // Story status
                    status: rivetResult.success ? 'completed' : 'failed'
                });

                $app.save(record);
                
                console.log('[DB] Story record created:', record.id);
                return record;

            } catch (error) {
                console.log('[DB] Failed to create story record:', error.toString());
                return null;
            }
        },

        /**
         * Find stories by status
         * @param {string} status - Story status
         * @param {number} limit - Result limit
         */
        findByStatus: function(status, limit = 20) {
            try {
                const collection = $app.findCollectionByNameOrId('stories');
                if (!collection) {
                    return [];
                }

                return $app.findRecordsByFilter(
                    'stories', 
                    `status = '${status}'`, 
                    '-created', 
                    limit, 
                    0
                );
            } catch (error) {
                console.log('[DB] Failed to find stories by status:', error.toString());
                return [];
            }
        },

        /**
         * Get story statistics
         */
        getStats: function() {
            try {
                const collection = $app.findCollectionByNameOrId('stories');
                if (!collection) {
                    return { total: 0, completed: 0, failed: 0, pending: 0 };
                }

                const total = $app.countRecords('stories', '');
                const completed = $app.countRecords('stories', "status = 'completed'");
                const failed = $app.countRecords('stories', "status = 'failed'");
                const pending = $app.countRecords('stories', "status = 'pending'");

                return { total, completed, failed, pending };
            } catch (error) {
                console.log('[DB] Failed to get story stats:', error.toString());
                return { total: 0, completed: 0, failed: 0, pending: 0 };
            }
        },

        /**
         * Generate a unique execution ID
         * @private
         */
        _generateExecutionId: function() {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 8);
            return `exec_${timestamp}_${random}`;
        }
    },

    /**
     * Generic database utilities
     */
    utils: {
        /**
         * Check if a collection exists
         * @param {string} name - Collection name
         */
        collectionExists: function(name) {
            try {
                const collection = $app.findCollectionByNameOrId(name);
                return collection !== null;
            } catch (error) {
                return false;
            }
        },

        /**
         * Create stories collection if it doesn't exist
         */
        ensureStoriesCollection: function() {
            if (this.collectionExists('stories')) {
                console.log('[DB] Stories collection already exists');
                return true;
            }

            try {
                console.log('[DB] Creating stories collection...');
                
                // This is a basic example - in practice, you'd create the collection
                // through the PocketBase admin interface or migrations
                console.log('[DB] Please create the "stories" collection through the admin interface');
                console.log('[DB] Required fields:');
                console.log('  - story_instructions (text)');
                console.log('  - primary_characters (text)');
                console.log('  - secondary_characters (text)');
                console.log('  - n_chapters (number)');
                console.log('  - l_chapter (number)');
                console.log('  - rivet_processed (bool)');
                console.log('  - rivet_execution_id (text)');
                console.log('  - rivet_result (json)');
                console.log('  - rivet_error (text)');
                console.log('  - execution_time (number)');
                console.log('  - processed_at (date)');
                console.log('  - status (select: pending, completed, failed)');
                
                return false;
            } catch (error) {
                console.log('[DB] Failed to ensure stories collection:', error.toString());
                return false;
            }
        },

        /**
         * Clean up old records
         * @param {string} collection - Collection name
         * @param {number} daysOld - Days old to consider for cleanup
         */
        cleanupOldRecords: function(collection, daysOld = 30) {
            try {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - daysOld);
                
                const filter = `created < '${cutoffDate.toISOString()}'`;
                const records = $app.findRecordsByFilter(collection, filter, '', 100, 0);
                
                let deletedCount = 0;
                for (const record of records) {
                    try {
                        $app.delete(record);
                        deletedCount++;
                    } catch (deleteError) {
                        console.log(`[DB] Failed to delete record ${record.id}:`, deleteError.toString());
                    }
                }
                
                console.log(`[DB] Cleaned up ${deletedCount} old records from ${collection}`);
                return deletedCount;
                
            } catch (error) {
                console.log(`[DB] Failed to cleanup old records from ${collection}:`, error.toString());
                return 0;
            }
        }
    }
};

module.exports = DbHelpers;
