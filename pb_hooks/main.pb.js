
// =============================================================================
// Main PocketBase Hooks
// =============================================================================


// Enhanced hello endpoint with validation
routerAdd("GET", "/hello/{name}", (e) => {
    let name = e.request.pathValue("name")
    
    // Basic validation
    if (!name || name.trim() === "") {
        return e.json(400, { "error": "Name parameter is required" })
    }
    
    // Sanitize name (basic XSS protection)
    name = name.replace(/[<>]/g, "")
    
    return e.json(200, { 
        "message": "Hello " + name,
        "timestamp": new Date().toISOString()
    })
})

// CORS middleware for API routes
routerUse((e) => {
    // Only apply CORS to API routes
    if (e.request.url.path.startsWith("/api/")) {
        e.response.header().set("Access-Control-Allow-Origin", "*")
        e.response.header().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        e.response.header().set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        // Handle preflight requests
        if (e.request.method === "OPTIONS") {
            return e.noContent(204)
        }
    }
    
    e.next()
})

// User lifecycle hooks
onRecordAfterCreateSuccess((e) => {
    console.log("✅ New user created:", e.record.get("email"))
    
    // You could send welcome email, create user profile, etc.
    // Example: createUserProfile(e.record)
    
    e.next()
}, "users")

onRecordAfterUpdateSuccess((e) => {
    console.log("📝 User updated:", e.record.get("email"))
    
    // You could log changes, sync with external services, etc.
    
    e.next()
}, "users")

onRecordAfterDeleteSuccess((e) => {
    console.log("🗑️  User deleted:", e.record.get("email"))
    
    // Cleanup related data, notify external services, etc.
    
    e.next()
}, "users")

