// =============================================================================
// Trump Chat Feature Hooks
// =============================================================================

onRecordAfterCreateRequest((e) => {
    if (e.collection.name !== "chat_messages") {
        return
    }

    const message = e.record
    
    // Only process user messages
    if (!message.getBool("is_user")) {
        return
    }

    console.log("🤖 Processing user message for Trump chat:", message.getString("message"))
    
    // Process Trump response asynchronously
    try {
        $http.send({
            url: "http://localhost:3000/api/trump-response",
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            data: {
                message: message.getString("message"),
                sessionId: message.getString("session_id"),
                messageId: message.getId()
            },
            timeout: 30 // 30 second timeout
        })
    } catch (error) {
        console.error("❌ Failed to send Trump response request:", error)
        
        // Create error response message
        const collection = $app.dao().findCollectionByNameOrId("chat_messages")
        const errorRecord = new Record(collection, {
            session_id: message.getString("session_id"),
            message: "Sorry, I'm having trouble responding right now. Please try again.",
            is_user: false,
            is_processing: false
        })
        
        $app.dao().saveRecord(errorRecord)
    }
}, "chat_messages")

// Clean up old chat sessions (optional maintenance hook)
onBeforeServe((e) => {
    // Run cleanup every hour (3600000 ms)
    const cleanupInterval = 3600000
    
    // This is a simple way to schedule cleanup - for production, consider using a proper cron job
    setTimeout(() => {
        try {
            // Delete chat sessions older than 30 days
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            
            $app.dao().db()
                .newQuery("DELETE FROM chat_sessions WHERE created < {:date}")
                .bind({ date: thirtyDaysAgo.toISOString() })
                .execute()
                
            console.log("🧹 Cleaned up old chat sessions")
        } catch (error) {
            console.error("❌ Chat cleanup failed:", error)
        }
    }, cleanupInterval)
    
    e.next()
})
