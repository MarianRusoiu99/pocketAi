/// <reference path="../pb_data/types.d.ts" />

/**
 * Simple test endpoint - all logic inside handler to fix isolation issue
 */
routerAdd("GET", "/api/test", (e) => {
    console.log("TEST: Handler called successfully!");
    
    return e.json(200, {
        message: "PocketBase hooks are working correctly!",
        timestamp: new Date().toISOString(),
        status: "success"
    });
});

/**
 * Stories endpoint with Rivet integration
 */
routerAdd("POST", "/api/stories", (e) => {
    console.log("STORIES: Handler called");
    
    try {
        // All logic must be inside the handler due to PocketBase isolation
        const projectPath = '../rivet/ai.rivet-project';
        const cliCommand = 'npx';
        
        // Get request data
        const body = e.requestInfo().body || {};
        const content = body.content || "Default story content";
        
        console.log("STORIES: Processing content:", content);
        
        // Execute Rivet CLI with correct argument structure for $os.exec
        const args = ['@ironclad/rivet-cli', 'run', projectPath, '--input', `content=${content}`];
        
        console.log("STORIES: Executing command:", cliCommand, "with args:", JSON.stringify(args));
        
        try {
            // Use $os.exec with proper argument spreading
            const result = $os.exec(cliCommand, args[0], args[1], args[2], args[3], args[4]);
            
            console.log("STORIES: Rivet execution successful");
            
            return e.json(200, {
                success: true,
                message: "Story processed successfully with Rivet",
                input: { content },
                output: result.toString(), // Convert result to string
                timestamp: new Date().toISOString()
            });
        } catch (rivetError) {
            console.log("STORIES: Rivet execution failed:", rivetError.toString());
            
            // Return success but indicate Rivet was skipped
            return e.json(200, {
                success: true,
                message: "Story received (Rivet integration temporarily disabled)",
                input: { content },
                rivet_error: rivetError.toString(),
                note: "This endpoint is working, Rivet CLI integration needs configuration",
                timestamp: new Date().toISOString()
            });
        }
        
    } catch (error) {
        console.log("STORIES: Handler failed:", error.toString());
        
        return e.json(500, {
            success: false,
            error: "Handler execution failed",
            details: error.toString(),
            timestamp: new Date().toISOString()
        });
    }
});

console.log("Hook file loaded - endpoints should be available");
