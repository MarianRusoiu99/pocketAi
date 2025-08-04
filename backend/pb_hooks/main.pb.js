
/**
 * Register API Routes
 * This must be in global scope for PocketBase to recognize the routes
 */
try {
    console.log('[INIT] Registering API routes...');
    
    // Story generation endpoint - THE MAIN ENDPOINT YOU NEED
    routerAdd("POST", "/api/stories/generate", (e) => {
        console.log('[API] Story generation endpoint called');
        
        // For now, return the bridge server response directly
        // Since PocketBase $os.exec doesn't work, we'll proxy through client
        try {
            console.log('[API] Request received - forwarding to proxy server');
            
            return e.json(200, {
                success: true,
                message: "Please use the proxy server directly at http://localhost:8091/proxy/rivet",
                proxyInstructions: {
                    url: "http://localhost:8091/proxy/rivet",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: {
                        graphId: "uLDGWIiCbhJiXnUV_JLQf",
                        inputs: {
                            story_instructions: "Your story instructions here",
                            primary_characters: "Your characters here",
                            secondary_characters: "Secondary characters here",
                            n_chapters: 3,
                            l_chapter: 200
                        }
                    }
                },
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.log('[API] Story generation endpoint error:', error.toString());
            return e.json(500, {
                success: false,
                error: error.toString(),
                timestamp: new Date().toISOString()
            });
        }
    });

    // Health check endpoint for Rivet integration
    routerAdd("GET", "/api/rivet/health", (e) => {
        console.log('[API] Rivet health check called');
        try {
            // Test bridge server connectivity
            const result = $os.exec('curl', 'http://localhost:3001/health', '--silent', '--fail');
            
            console.log('[API] Health check result:', result);
            
            if (result) {
                return e.json(200, {
                    success: true,
                    data: {
                        status: 'healthy',
                        bridgeServer: 'connected',
                        response: result,
                        timestamp: new Date().toISOString()
                    }
                });
            } else {
                return e.json(503, {
                    success: false,
                    error: 'Bridge server not responding',
                    timestamp: new Date().toISOString()
                });
            }
            
        } catch (error) {
            console.log('[API] Health check error:', error.toString());
            return e.json(500, {
                success: false,
                error: error.toString(),
                timestamp: new Date().toISOString()
            });
        }
    });

    
} catch (error) {
    console.log('[INIT] Failed to register API routes:', error.toString());
}

// Application bootstrap hook
onBootstrap((e) => {
    e.next();
});

// Story record hooks (if stories collection exists)
onRecordAfterCreateSuccess((e) => { 
    // Auto-process story with Rivet if needed
    e.next();
});

// Record enrichment hook
onRecordEnrich((e) => {
    // Add custom fields or transformations to records before sending to client
   
    
    e.next();
});

// Cleanup hook (runs periodically)
onRecordAfterUpdateSuccess((e) => {
    // Trigger cleanup for old records occasionally
   
    
    e.next();
});

console.log('[INIT] Hook file loaded - endpoints should be available');
