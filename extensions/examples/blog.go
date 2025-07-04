package main

import (
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/router"

	"pocket-app/extensions"
	"pocket-app/extensions/api"
	"pocket-app/extensions/hooks"
	"pocket-app/extensions/middleware"
)

// BlogExtension is a complete example extension
type BlogExtension struct {
	*extensions.BaseExtension
	config *extensions.Config
}

// NewBlogExtension creates a new blog extension
func NewBlogExtension(config *extensions.Config) *BlogExtension {
	return &BlogExtension{
		BaseExtension: extensions.NewBaseExtension("blog", "1.0.0", 100),
		config:        config,
	}
}

// Initialize sets up the blog extension
func (be *BlogExtension) Initialize(app *pocketbase.PocketBase, config *extensions.Config) error {
	// Register routing and middleware
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// Create API group with prefix
		apiGroup := se.Router.Group(be.config.API.Prefix)
		
		// Add middleware
		corsMiddleware := middleware.NewCORSMiddleware()
		corsMiddleware.AllowedOrigins = be.config.CORS.AllowedOrigins
		corsMiddleware.AllowedMethods = be.config.CORS.AllowedMethods
		corsMiddleware.AllowedHeaders = be.config.CORS.AllowedHeaders
		corsMiddleware.AllowCredentials = be.config.CORS.AllowCredentials
		
		if be.config.CORS.Enabled {
			apiGroup.BindFunc(corsMiddleware.Handler())
		}
		
		// Add logging middleware
		loggingMiddleware := middleware.NewLoggingMiddleware("/health")
		apiGroup.BindFunc(loggingMiddleware.Handler())
		
		// Add security middleware
		securityMiddleware := middleware.NewSecurityMiddleware()
		apiGroup.BindFunc(securityMiddleware.Handler())
		
		// Add validation middleware
		validationMiddleware := middleware.NewValidationMiddleware()
		apiGroup.BindFunc(validationMiddleware.Handler())
		
		// Register API handlers
		healthHandler := api.NewHealthHandler()
		healthHandler.RegisterRoutes(apiGroup)
		
		helloHandler := api.NewHelloHandler()
		helloHandler.RegisterRoutes(apiGroup)
		
		// Blog-specific routes
		blogGroup := apiGroup.Group("/blog")
		be.registerBlogRoutes(blogGroup)
		
		return se.Next()
	})
	
	// Register record hooks
	userHooks := hooks.NewUserHooks(app)
	userHooks.RegisterHooks()
	
	return nil
}

// registerBlogRoutes registers blog-specific routes
func (be *BlogExtension) registerBlogRoutes(group *router.RouterGroup) {
	// Blog posts
	group.GET("/posts", be.listPosts)
	group.GET("/posts/{id}", be.getPost)
	group.POST("/posts", be.createPost).Bind(apis.RequireAuth())
	group.PUT("/posts/{id}", be.updatePost).Bind(apis.RequireAuth())
	group.DELETE("/posts/{id}", be.deletePost).Bind(apis.RequireAuth())
	
	// Blog comments
	group.GET("/posts/{id}/comments", be.listComments)
	group.POST("/posts/{id}/comments", be.createComment).Bind(apis.RequireAuth())
}

// Blog route handlers
func (be *BlogExtension) listPosts(e *core.RequestEvent) error {
	// Get query parameters
	page := e.Request.URL.Query().Get("page")
	if page == "" {
		page = "1"
	}
	
	// You would implement actual blog post listing here
	return e.JSON(200, map[string]any{
		"posts":      []map[string]any{},
		"page":       page,
		"message":    "Blog posts would be listed here",
		"extension":  be.Name(),
	})
}

func (be *BlogExtension) getPost(e *core.RequestEvent) error {
	id := e.Request.PathValue("id")
	
	// You would implement actual blog post retrieval here
	return e.JSON(200, map[string]any{
		"post":      map[string]any{"id": id, "title": "Example Post"},
		"message":   "Blog post would be shown here",
		"extension": be.Name(),
	})
}

func (be *BlogExtension) createPost(e *core.RequestEvent) error {
	// Parse request body
	data := struct {
		Title   string `json:"title" form:"title"`
		Content string `json:"content" form:"content"`
		Tags    []string `json:"tags" form:"tags"`
	}{}
	
	if err := e.BindBody(&data); err != nil {
		return e.BadRequestError("Failed to parse request body", err)
	}
	
	// Validation
	if data.Title == "" {
		return e.BadRequestError("Title is required", nil)
	}
	
	if data.Content == "" {
		return e.BadRequestError("Content is required", nil)
	}
	
	// You would implement actual blog post creation here
	return e.JSON(201, map[string]any{
		"message":   "Blog post created successfully",
		"post":      data,
		"extension": be.Name(),
	})
}

func (be *BlogExtension) updatePost(e *core.RequestEvent) error {
	id := e.Request.PathValue("id")
	
	// You would implement actual blog post update here
	return e.JSON(200, map[string]any{
		"message":   "Blog post updated successfully",
		"id":        id,
		"extension": be.Name(),
	})
}

func (be *BlogExtension) deletePost(e *core.RequestEvent) error {
	id := e.Request.PathValue("id")
	
	// You would implement actual blog post deletion here
	return e.JSON(200, map[string]any{
		"message":   "Blog post deleted successfully",
		"id":        id,
		"extension": be.Name(),
	})
}

func (be *BlogExtension) listComments(e *core.RequestEvent) error {
	postId := e.Request.PathValue("id")
	
	// You would implement actual comment listing here
	return e.JSON(200, map[string]any{
		"comments":  []map[string]any{},
		"post_id":   postId,
		"message":   "Comments would be listed here",
		"extension": be.Name(),
	})
}

func (be *BlogExtension) createComment(e *core.RequestEvent) error {
	postId := e.Request.PathValue("id")
	
	// Parse request body
	data := struct {
		Content string `json:"content" form:"content"`
	}{}
	
	if err := e.BindBody(&data); err != nil {
		return e.BadRequestError("Failed to parse request body", err)
	}
	
	if data.Content == "" {
		return e.BadRequestError("Content is required", nil)
	}
	
	// You would implement actual comment creation here
	return e.JSON(201, map[string]any{
		"message":   "Comment created successfully",
		"post_id":   postId,
		"comment":   data,
		"extension": be.Name(),
	})
}
