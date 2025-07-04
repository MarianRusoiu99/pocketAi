/// <reference path="../pb_data/types.d.ts" />

// Collection schema migration - Users Posts example
migrate((app) => {
  // Create a "posts" collection
  const posts = app.findCollectionByNameOrId("posts")
  if (!posts) {
    app.save(new Collection({
      name: "posts",
      type: "base",
      schema: [
        // Text field for post content
        {
          name: "content",
          type: "text",
          required: true,
          options: {
            min: 1,
            max: 500
          }
        },
        // User relation field
        {
          name: "author",
          type: "relation",
          required: true,
          options: {
            collectionId: app.findCollectionByNameOrId("users").id,
            cascadeDelete: false,
            minSelect: 1,
            maxSelect: 1
          }
        },
        // File field for images
        {
          name: "images",
          type: "file",
          options: {
            maxSelect: 3,
            maxSize: 5242880, // 5MB
            mimeTypes: ["image/jpeg", "image/png", "image/gif"],
            thumbs: ["100x100", "300x300"]
          }
        },
        // JSON field for metadata
        {
          name: "metadata",
          type: "json"
        },
        // Boolean field
        {
          name: "published",
          type: "bool"
        },
        // Number field for likes
        {
          name: "likes",
          type: "number",
          options: {
            min: 0
          }
        }
      ],
      listRule: "@request.auth.id != '' || published = true", // Auth users see all, others see published only
      viewRule: "@request.auth.id != '' || published = true",
      createRule: "@request.auth.id != '' && @request.auth.id = author", // Only auth users can create, must be author
      updateRule: "@request.auth.id = author", // Only author can update
      deleteRule: "@request.auth.id = author", // Only author can delete
    }))
  }

  // Create a "comments" collection
  const comments = app.findCollectionByNameOrId("comments")
  if (!comments) {
    app.save(new Collection({
      name: "comments",
      type: "base",
      schema: [
        {
          name: "content",
          type: "text",
          required: true,
          options: { max: 200 }
        },
        {
          name: "post",
          type: "relation",
          required: true,
          options: {
            collectionId: app.findCollectionByNameOrId("posts").id,
            cascadeDelete: true // Delete comments when post is deleted
          }
        },
        {
          name: "author",
          type: "relation",
          required: true,
          options: {
            collectionId: app.findCollectionByNameOrId("users").id
          }
        }
      ],
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != '' && @request.auth.id = author",
      updateRule: "@request.auth.id = author",
      deleteRule: "@request.auth.id = author",
    }))
  }
}, (app) => {
  // Rollback - delete collections
  app.findCollectionByNameOrId("comments") && app.delete(app.findCollectionByNameOrId("comments"))
  app.findCollectionByNameOrId("posts") && app.delete(app.findCollectionByNameOrId("posts"))
})
