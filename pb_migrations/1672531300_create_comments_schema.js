/// <reference path="../pb_data/types.d.ts" />

// Collection schema migration - Comments for Posts example
migrate((app) => {
  // Create a "comments" collection
  const comments = app.findCollectionByNameOrId("comments")
  if (!comments) {
    app.save(new Collection({
      name: "comments",
      type: "base",
      schema: [
        // Comment content
        {
          name: "content",
          type: "text",
          required: true,
          options: {
            min: 1,
            max: 1000
          }
        },
        // Reference to the post
        {
          name: "post",
          type: "relation",
          required: true,
          options: {
            collectionId: app.findCollectionByNameOrId("posts").id,
            cascadeDelete: true, // Delete comments when post is deleted
            minSelect: 1,
            maxSelect: 1,
            displayFields: ["content"]
          }
        },
        // Comment author
        {
          name: "author",
          type: "relation",
          required: true,
          options: {
            collectionId: app.findCollectionByNameOrId("users").id,
            cascadeDelete: false,
            minSelect: 1,
            maxSelect: 1,
            displayFields: ["name", "email"]
          }
        },
        // Parent comment for nested replies
        {
          name: "parent",
          type: "relation",
          required: false,
          options: {
            collectionId: "comments", // Self-reference
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: ["content"]
          }
        },
        // Comment status
        {
          name: "status",
          type: "select",
          required: true,
          options: {
            maxSelect: 1,
            values: ["pending", "approved", "rejected", "spam"]
          }
        },
        // Like count
        {
          name: "likes",
          type: "number",
          required: false,
          options: {
            min: 0,
            max: null
          }
        },
        // Flag for inappropriate content
        {
          name: "flagged",
          type: "bool",
          required: false
        },
        // Metadata for additional info
        {
          name: "metadata",
          type: "json",
          required: false
        }
      ],
      // Database indexes for performance
      indexes: [
        "CREATE INDEX idx_comments_post ON comments (post)",
        "CREATE INDEX idx_comments_author ON comments (author)",
        "CREATE INDEX idx_comments_status ON comments (status)",
        "CREATE INDEX idx_comments_parent ON comments (parent)",
        "CREATE INDEX idx_comments_created ON comments (created)"
      ],
      // API access rules
      listRule: "status = 'approved' || (@request.auth.id != \"\" && @request.auth.id = author)",
      viewRule: "status = 'approved' || (@request.auth.id != \"\" && @request.auth.id = author)",
      createRule: "@request.auth.id != \"\" && @request.auth.verified = true",
      updateRule: "@request.auth.id = author && status != 'approved'", // Can't edit approved comments
      deleteRule: "@request.auth.id = author || @request.auth.role = 'admin'"
    }))
  }

  // Create a "post_likes" collection for tracking likes
  const postLikes = app.findCollectionByNameOrId("post_likes")
  if (!postLikes) {
    app.save(new Collection({
      name: "post_likes",
      type: "base",
      schema: [
        // Reference to the post
        {
          name: "post",
          type: "relation",
          required: true,
          options: {
            collectionId: app.findCollectionByNameOrId("posts").id,
            cascadeDelete: true,
            minSelect: 1,
            maxSelect: 1
          }
        },
        // User who liked
        {
          name: "user",
          type: "relation",
          required: true,
          options: {
            collectionId: app.findCollectionByNameOrId("users").id,
            cascadeDelete: true,
            minSelect: 1,
            maxSelect: 1
          }
        }
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_post_likes_unique ON post_likes (post, user)",
        "CREATE INDEX idx_post_likes_post ON post_likes (post)",
        "CREATE INDEX idx_post_likes_user ON post_likes (user)"
      ],
      // Anyone can see likes, only authenticated users can create/delete
      listRule: "",
      viewRule: "",
      createRule: "@request.auth.id != \"\" && @request.auth.id = user",
      updateRule: "", // No updates allowed
      deleteRule: "@request.auth.id = user"
    }))
  }

  // Create a "categories" collection
  const categories = app.findCollectionByNameOrId("categories")
  if (!categories) {
    app.save(new Collection({
      name: "categories",
      type: "base",
      schema: [
        // Category name
        {
          name: "name",
          type: "text",
          required: true,
          options: {
            min: 1,
            max: 100
          }
        },
        // URL-friendly slug
        {
          name: "slug",
          type: "text",
          required: true,
          options: {
            min: 1,
            max: 100,
            pattern: "^[a-z0-9-]+$"
          }
        },
        // Category description
        {
          name: "description",
          type: "text",
          required: false,
          options: {
            max: 500
          }
        },
        // Category color for UI
        {
          name: "color",
          type: "text",
          required: false,
          options: {
            pattern: "^#[0-9A-Fa-f]{6}$" // Hex color validation
          }
        },
        // Category icon
        {
          name: "icon",
          type: "file",
          required: false,
          options: {
            maxSelect: 1,
            maxSize: 1048576, // 1MB
            mimeTypes: ["image/svg+xml", "image/png", "image/jpeg"],
            thumbs: ["32x32", "64x64"]
          }
        },
        // Post count (calculated)
        {
          name: "post_count",
          type: "number",
          required: false,
          options: {
            min: 0
          }
        }
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_categories_slug ON categories (slug)",
        "CREATE INDEX idx_categories_name ON categories (name)"
      ],
      // Public read, admin-only write
      listRule: "",
      viewRule: "",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'"
    }))
  }
})
