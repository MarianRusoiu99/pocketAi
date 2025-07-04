// ============================================================================
// POCKETBASE EXTENSION GUIDE
// ============================================================================

/*
This file shows you comprehensive examples of how to extend PocketBase:

1. 📊 SCHEMA & COLLECTIONS
2. 🎯 HOOKS & EVENTS  
3. 🛠️ CUSTOM API ROUTES (Go)
4. 🔐 AUTHENTICATION & AUTHORIZATION
5. 📁 FILE HANDLING
6. 🔄 REAL-TIME FEATURES
7. 📈 ADVANCED PATTERNS

*/

// ============================================================================
// 1. SCHEMA & COLLECTIONS
// ============================================================================

// Collections are like database tables. You can create them via:
// A) Admin UI: http://localhost:8090/_/ 
// B) Migrations (recommended): pb_migrations/

// Field Types Available:
// - text: String fields with validation
// - number: Integer/float fields  
// - bool: Boolean true/false
// - email: Email validation
// - url: URL validation
// - date: Date/time fields
// - select: Dropdown options
// - relation: Foreign key to other collections
// - file: File uploads with image processing
// - json: Flexible JSON data

// Example Migration (see pb_migrations/1672531200_create_posts_schema.js):
/*
migrate((app) => {
  const posts = new Collection({
    name: "posts",
    schema: [
      { name: "title", type: "text", required: true },
      { name: "content", type: "text", required: true },
      { name: "author", type: "relation", options: { collectionId: "users" } },
      { name: "published", type: "bool" },
      { name: "metadata", type: "json" }
    ],
    // Access Rules (PocketBase Filter Language)
    listRule: "@request.auth.id != '' || published = true",
    viewRule: "@request.auth.id != '' || published = true", 
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id = author",
    deleteRule: "@request.auth.id = author"
  })
  app.save(posts)
})
*/

// ============================================================================
// 2. HOOKS & EVENTS (JavaScript)
// ============================================================================

// PocketBase hooks run in a JavaScript VM and allow you to:
// - Validate data before saves
// - Transform data automatically
// - Send notifications
// - Integrate with external APIs
// - Implement complex business logic

// Available Hooks:
// - onRecordCreate/Update/Delete: When records change
// - onModelCreate/Update/Delete: Lower-level model changes
// - onUserAuth/Create/Update: Authentication events
// - onRecordsListRequest: When listing records
// - onRecordViewRequest: When viewing a record
// - onFileDownloadRequest: When downloading files

// Example Hook (see pb_hooks/main.pb.js):
/*
onRecordCreate((e) => {
  // Auto-populate metadata
  e.record.set("metadata", { createdAt: new Date().toISOString() })
  
  // Validation
  if (e.record.get("content").length < 10) {
    throw new BadRequestError("Content too short")
  }
  
  // Send notifications
  sendNotificationToFollowers(e.record.get("author"))
}, "posts")
*/

// ============================================================================
// 3. CUSTOM API ROUTES (Go)
// ============================================================================

// In your main.go, you can add custom routes using the standard Go HTTP handling
// This is perfect for:
// - Complex business logic
// - External API integrations  
// - Custom authentication flows
// - File processing
// - Analytics and reporting

// Example Custom Routes (add to main.go):
/*
app.OnServe().Bind(&hook.Handler[*core.ServeEvent]{
  Func: func(e *core.ServeEvent) error {
    
    // Simple API endpoint
    e.Router.GET("/api/hello/{name}", func(c *core.RequestEvent) error {
      name := c.Request.PathValue("name")
      return c.JSON(200, map[string]interface{}{
        "message": "Hello " + name,
        "timestamp": time.Now(),
      })
    })
    
    // Protected endpoint (requires auth)
    e.Router.POST("/api/posts/{id}/like", func(c *core.RequestEvent) error {
      // Get authenticated user
      user := c.Get(apis.ContextAuthRecordKey)
      if user == nil {
        return c.JSON(401, map[string]string{"error": "Authentication required"})
      }
      
      postId := c.Request.PathValue("id")
      
      // Find the post
      post, err := e.App.FindRecordById("posts", postId)
      if err != nil {
        return c.JSON(404, map[string]string{"error": "Post not found"})
      }
      
      // Increment likes
      likes := post.GetInt("likes")
      post.Set("likes", likes + 1)
      e.App.Save(post)
      
      return c.JSON(200, map[string]interface{}{
        "likes": likes + 1,
        "message": "Post liked!",
      })
    }, requireAuth)
    
    // File upload endpoint
    e.Router.POST("/api/upload", func(c *core.RequestEvent) error {
      file, err := c.Request.FormFile("file")
      if err != nil {
        return c.JSON(400, map[string]string{"error": "No file provided"})
      }
      
      // Process and save file...
      // You can integrate with cloud storage, image processing, etc.
      
      return c.JSON(200, map[string]interface{}{
        "filename": file.Filename,
        "size": file.Size,
      })
    })
    
    return e.Next()
  },
})
*/

// ============================================================================
// 4. AUTHENTICATION & AUTHORIZATION
// ============================================================================

// PocketBase has built-in user authentication with:
// - Email/password signup/login
// - OAuth2 providers (Google, Facebook, etc.)
// - JWT tokens
// - Record-level permissions

// Access Rules Examples:
// - Public read: "" (empty string)
// - Authenticated users only: "@request.auth.id != ''"
// - Owner only: "@request.auth.id = author"  
// - Admin only: "@request.auth.role = 'admin'"
// - Complex rules: "@request.auth.verified = true && published = true"

// Custom Auth Middleware (Go):
/*
func requireAuth(c *core.RequestEvent) error {
  user := c.Get(apis.ContextAuthRecordKey)
  if user == nil {
    return c.JSON(401, map[string]string{"error": "Authentication required"})
  }
  return nil
}

func requireAdmin(c *core.RequestEvent) error {
  user := c.Get(apis.ContextAuthRecordKey).(*core.Record)
  if user == nil || user.Collection().Name != "users" {
    return c.JSON(401, map[string]string{"error": "Admin access required"})
  }
  return nil
}
*/

// ============================================================================
// 5. FILE HANDLING
// ============================================================================

// PocketBase has excellent file handling:
// - Automatic image resizing/thumbnails
// - File validation (type, size)
// - Cloud storage integration
// - Image transformations

// File Field Configuration:
/*
{
  name: "avatar",
  type: "file", 
  options: {
    maxSelect: 1,
    maxSize: 5242880, // 5MB
    mimeTypes: ["image/jpeg", "image/png"],
    thumbs: ["100x100", "300x300"] // Auto-generate thumbnails
  }
}
*/

// Accessing Files:
// - Direct URL: http://localhost:8090/api/files/COLLECTION/RECORD_ID/FILENAME
// - Thumbnail: http://localhost:8090/api/files/COLLECTION/RECORD_ID/FILENAME?thumb=100x100

// ============================================================================
// 6. REAL-TIME FEATURES  
// ============================================================================

// PocketBase supports real-time subscriptions via Server-Sent Events (SSE)
// Perfect for: chat, notifications, live updates, collaborative features

// Frontend (JavaScript):
/*
// Subscribe to record changes
const eventSource = new EventSource('/api/realtime')

eventSource.addEventListener('message', (e) => {
  const data = JSON.parse(e.data)
  console.log('Real-time update:', data)
})

// Or use the PocketBase JS SDK:
pb.collection('messages').subscribe('*', (e) => {
  console.log('Message update:', e.record)
})
*/

// Backend Hook (triggers real-time updates automatically):
/*
onRecordCreate((e) => {
  // This automatically broadcasts to subscribed clients
  console.log("New record created - will broadcast to subscribers")
}, "messages")
*/

// ============================================================================
// 7. ADVANCED PATTERNS
// ============================================================================

// A) Background Jobs (using Go routines):
/*
func startBackgroundJobs(app *pocketbase.PocketBase) {
  go func() {
    ticker := time.NewTicker(1 * time.Hour)
    for {
      select {
      case <-ticker.C:
        cleanupOldData(app)
      }
    }
  }()
}
*/

// B) Email Integration:
/*
onUserCreateRequest((e) => {
  // Send welcome email
  $app.newMailClient().send({
    to: e.record.email(),
    subject: "Welcome!",
    html: "<h1>Welcome to our platform!</h1>"
  })
})
*/

// C) External API Integration:
/*
onRecordCreate((e) => {
  if (e.record.collection().name === "orders") {
    // Call external payment API
    const response = $http.send({
      url: "https://api.stripe.com/v1/charges",
      method: "POST",
      headers: { "Authorization": "Bearer sk_test_..." },
      body: JSON.stringify({
        amount: e.record.get("total"),
        currency: "usd"
      })
    })
    
    e.record.set("paymentId", response.json.id)
  }
}, "orders")
*/

// D) Data Validation & Transformation:
/*
onRecordCreate((e) => {
  // Normalize data
  const email = e.record.get("email").toLowerCase().trim()
  e.record.set("email", email)
  
  // Generate slug from title
  const title = e.record.get("title")
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
  e.record.set("slug", slug)
  
  // Validate business rules
  if (e.record.get("price") < 0) {
    throw new BadRequestError("Price cannot be negative")
  }
}, "products")
*/

// ============================================================================
// 🚀 PRACTICAL WALKTHROUGH: BUILDING A BLOG SYSTEM
// ============================================================================

/*
Let's walk through building a complete blog system step by step:

STEP 1: Schema Design
---------------------
1. Start PocketBase: `go run main.go serve --dev`
2. Visit Admin UI: http://localhost:8090/_/
3. Create collections:
   - posts (title, content, author, published, featured_image)
   - comments (content, post, author, status)
   - post_likes (post, user)
   - categories (name, slug, description)

STEP 2: Access Rules
--------------------
Set up proper permissions for each collection:
- posts: Published posts public, authors can edit own
- comments: Approved comments public, authors can edit own
- post_likes: Public read, authenticated create/delete
- categories: Public read, admin-only write

STEP 3: Migrations (Production Ready)
-------------------------------------
Export your schema to migration files:
- pb_migrations/1672531200_create_posts_schema.js ✅
- pb_migrations/1672531300_create_comments_schema.js ✅

STEP 4: Hooks (Business Logic)
------------------------------
Add automatic behaviors:
- Auto-generate slugs from titles ✅
- Send notifications on new comments ✅
- Update like counts automatically ✅
- Validate content and prevent spam ✅

STEP 5: Custom API Routes
-------------------------
Extend with custom functionality:
- POST /api/posts/{id}/like - Like posts ✅
- GET /api/search?q=query - Search posts ✅
- GET /api/analytics/stats - Get statistics ✅
- POST /api/upload/avatar - File uploads ✅

STEP 6: Frontend Integration
----------------------------
// JavaScript SDK usage examples:

// 1. Authentication
const authData = await pb.collection('users').authWithPassword(email, password)

// 2. Create a post
const postData = {
  title: "My First Post",
  content: "This is the content...",
  author: pb.authStore.model.id,
  published: true
}
const post = await pb.collection('posts').create(postData)

// 3. Real-time subscriptions
pb.collection('posts').subscribe('*', (e) => {
  console.log('Post updated:', e.record)
})

// 4. File uploads
const formData = new FormData()
formData.append('featured_image', file)
formData.append('title', 'My Post')
const post = await pb.collection('posts').create(formData)

// 5. Custom API calls
const response = await pb.send('/api/posts/' + postId + '/like', {
  method: 'POST'
})

STEP 7: Advanced Features
-------------------------
- Real-time comments with live updates
- Image processing and thumbnails
- Email notifications
- Advanced search with filters
- Analytics and reporting
- User roles and permissions
- OAuth social login

*/

// ============================================================================
// 🔧 DEVELOPMENT WORKFLOW
// ============================================================================

/*
DAILY DEVELOPMENT:
1. `go run main.go serve --dev` - Start with auto-reload
2. Visit http://localhost:8090/_/ - Admin dashboard
3. Edit collections, test API rules
4. Write hooks in pb_hooks/*.pb.js
5. Test frontend integration
6. Export schema to migrations before commit

PRODUCTION DEPLOYMENT:
1. Build frontend: `cd client && npm run build`
2. Build Go binary: `go build -o app main.go`
3. Run migrations: `./app migrate`
4. Start production: `./app serve --prod`

BACKUP & RESTORE:
- Database: `./app export backup.zip`
- Restore: `./app import backup.zip`

TESTING:
- Unit tests: Test your custom Go functions
- Integration: Test API endpoints with curl/Postman
- E2E: Test full frontend-backend flows
*/

// ============================================================================
// 📚 LEARNING RESOURCES
// ============================================================================

/*
OFFICIAL DOCS:
- https://pocketbase.io/docs/
- https://pocketbase.io/docs/js-overview/
- https://pocketbase.io/docs/go-overview/

COMMUNITY:
- GitHub: https://github.com/pocketbase/pocketbase
- Discord: https://discord.gg/pocketbase
- Discussions: https://github.com/pocketbase/pocketbase/discussions

EXAMPLES:
- This project: Complete monorepo setup ✅
- Official examples: https://github.com/pocketbase/pocketbase/tree/master/examples
- Community examples: Search GitHub for "pocketbase"

ADVANCED TOPICS:
- Custom auth providers
- Advanced real-time features
- Microservices integration
- Performance optimization
- Security best practices
*/

console.log("📖 PocketBase extension guide loaded!")
console.log("🚀 Ready to build amazing apps!")
