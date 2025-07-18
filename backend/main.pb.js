/**
 * PocketBase Hooks for Rivet Integration
 * 
 * Simple JavaScript hooks that work with PocketBase's Goja runtime.
 * - No external dependencies to avoid Goja compatibility issues
 * - Simple HTTP requests using built-in APIs
 * - Basic error handling and logging
 */

/**
 * Health check endpoint for debugging
 */
routerAdd("GET", "/api/health", (e) => {
    console.log("[Hook] Health check requested");
    
    return e.json(200, { 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        service: "PocketBase with Rivet Integration"
    });
});

/**
 * Test endpoint to verify hooks are working
 */
routerAdd("GET", "/api/test", (e) => {
    console.log("[Hook] Test endpoint called");
    
    return e.json(200, { 
        message: "PocketBase hooks are working correctly",
        timestamp: new Date().toISOString()
    });
});

/**
 * Hook to process posts after creation
 * This is where we'll integrate with Rivet workflows
 */
onRecordAfterCreateRequest((e) => {
    console.log("[Hook] Post created, processing with Rivet...");
    
    try {
        const record = e.record;
        const title = record.get("title") || "";
        const content = record.get("content") || "";
        
        console.log(`[Hook] Processing post: ${title}`);
        
        // Simple HTTP request to Rivet server (using built-in $http)
        // Note: Using synchronous approach due to Goja limitations
        const rivetUrl = "http://localhost:3002";
        
        try {
            const response = $http.send({
                url: rivetUrl,
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    content: content,
                    timestamp: new Date().toISOString()
                }),
                timeout: 10 // 10 seconds timeout
            });
            
            if (response.statusCode >= 200 && response.statusCode < 300) {
                console.log("[Hook] Rivet processing successful");
                
                // Optionally update the record with Rivet results
                // const result = JSON.parse(response.raw);
                // record.set("rivet_processed", true);
                // $app.dao().saveRecord(record);
            } else {
                console.error(`[Hook] Rivet request failed with status: ${response.statusCode}`);
            }
        } catch (httpError) {
            console.error("[Hook] Failed to call Rivet server:", httpError.toString());
        }
        
    } catch (error) {
        console.error("[Hook] Error processing post:", error.toString());
    }
}, "posts");

console.log("[Hook] PocketBase hooks initialized successfully");
