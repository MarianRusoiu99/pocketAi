onRecordAfterCreateRequest((e) => {
    if (e.collection.name !== "chat_messages") {
        return
    }

    const message = e.record
    
    // Only process user messages
    if (!message.getBool("is_user")) {
        return
    }

    // Process Trump response asynchronously
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
        }
    })
}, "chat_messages")
