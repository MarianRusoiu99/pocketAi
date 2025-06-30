migrate((db) => {
  // Create chat_sessions collection
  const chatSessions = new Collection({
    "name": "chat_sessions",
    "type": "base",
    "system": false,
    "schema": [
      {
        "name": "session_id",
        "type": "text",
        "required": true,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "name": "title",
        "type": "text",
        "required": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_chat_sessions_session_id` ON `chat_sessions` (`session_id`)"
    ]
  })
  
  // Create chat_messages collection
  const chatMessages = new Collection({
    "name": "chat_messages",
    "type": "base",
    "system": false,
    "schema": [
      {
        "name": "session_id",
        "type": "text",
        "required": true,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "name": "message",
        "type": "text",
        "required": true,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "name": "is_user",
        "type": "bool",
        "required": true
      },
      {
        "name": "is_processing",
        "type": "bool",
        "required": false
      }
    ]
  })

  return db.saveCollection(chatSessions) && db.saveCollection(chatMessages)
})
