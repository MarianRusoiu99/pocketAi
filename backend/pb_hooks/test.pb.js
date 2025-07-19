/// <reference path="../pb_data/types.d.ts" />

// Immediately Invoked Function Expression wrapper
(function() {
    "use strict";
    
    // Simple test hook
    console.log("TEST: Hook file loading...");

    routerAdd("GET", "/api/test-simple", function(e) {
        console.log("TEST: Simple endpoint called");
        return e.json(200, {
            message: "Hello from PocketBase JavaScript hook!",
            timestamp: new Date().toISOString()
        });
    });

    console.log("TEST: Hook file loaded successfully");
})();
