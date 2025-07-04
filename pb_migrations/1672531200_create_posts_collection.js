/// <reference path="../pb_data/types.d.ts" />

/**
 * Simple blog schema migration - Posts collection
 * This creates a posts collection with proper field schema
 */
migrate((app) => {
  const collection = new Collection({
    "name": "posts",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "title_field",
        "name": "title",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": 200,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "content_field",
        "name": "content",
        "type": "text", 
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 10,
          "max": 5000,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "published_field",
        "name": "published",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "featured_image_field",
        "name": "featured_image",
        "type": "file",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "maxSize": 5242880,
          "mimeTypes": ["image/jpeg", "image/png", "image/gif"],
          "thumbs": ["100x100", "300x300"],
          "protected": false
        }
      },
      {
        "system": false,
        "id": "tags_field",
        "name": "tags",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 5,
          "values": ["tech", "news", "tutorial", "review", "opinion"]
        }
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": "@request.auth.id != ''", 
    "updateRule": "@request.auth.id != ''",
    "deleteRule": "@request.auth.id != ''",
    "options": {}
  })

  return app.save(collection)

}, (app) => {
  // Rollback - delete the collection
  const collection = app.findCollectionByNameOrId("posts")
  return app.delete(collection)
})
