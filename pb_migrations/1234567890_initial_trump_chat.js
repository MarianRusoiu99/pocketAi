migrate((db) => {
  // Create chat_sessions collection
  const chatSessions = new Collection({
    "id": "chat_sessions",
    "name": "chat_sessions",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "session_id",
        "name": "session_id",
        "type": "text",
        "system": false,
        "required": true,
        "unique": true
      },
      {
        "id": "title",
        "name": "title",
        "type": "text",
        "system": false,
        "required": false
      }
    ]
  })
  
  // Create chat_messages collection
  const chatMessages = new Collection({
    "id": "chat_messages",
    "name": "chat_messages",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "session_id",
        "name": "session_id",
        "type": "text",
        "system": false,
        "required": true
      },
      {
        "id": "message",
        "name": "message",
        "type": "text",
        "system": false,
        "required": true
      },
      {
        "id": "is_user",
        "name": "is_user",
        "type": "bool",
        "system": false,
        "required": true
      },
      {
        "id": "is_processing",
        "name": "is_processing",
        "type": "bool",
        "system": false,
        "required": false
      }
    ]
  })

  return Dao(db).saveCollection(chatSessions) && Dao(db).saveCollection(chatMessages)
})
