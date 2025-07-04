/// <reference path="../pb_data/types.d.ts" />

/**
 * Comments collection migration - Related to posts
 */
migrate((app) => {
  // Find the posts collection to get its ID for the relation
  const postsCollection = app.findCollectionByNameOrId("posts")
  
  const collection = new Collection({
    "name": "comments", 
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "content_field",
        "name": "content",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": 1000,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "post_field",
        "name": "post",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": postsCollection.id,
          "cascadeDelete": true,
          "minSelect": 1,
          "maxSelect": 1,
          "displayFields": []
        }
      },
      {
        "system": false,
        "id": "approved_field",
        "name": "approved",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
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
  const collection = app.findCollectionByNameOrId("comments")
  return app.delete(collection)
})
