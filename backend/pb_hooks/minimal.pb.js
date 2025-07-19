console.log("MINIMAL HOOK: Loading...");

routerAdd("GET", "/api/minimal", function(e) {
    console.log("MINIMAL HOOK: Endpoint called");
    return e.json(200, { 
        message: "Minimal hook working!",
        timestamp: new Date().toISOString()
    });
});

console.log("MINIMAL HOOK: Registered successfully");
