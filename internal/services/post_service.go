package services

import (
	"pocket-app/internal/config"
	"pocket-app/pkg/logger"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

// PostService handles post-related business logic
type PostService struct {
	app    *pocketbase.PocketBase
	config *config.Config
}

// NewPostService creates a new post service
func NewPostService(app *pocketbase.PocketBase, cfg *config.Config) *PostService {
	return &PostService{
		app:    app,
		config: cfg,
	}
}

// GetPublishedPosts retrieves published posts with pagination and filtering
func (s *PostService) GetPublishedPosts(page, search, tag string) (map[string]interface{}, error) {
	logger.Debug("Getting published posts", map[string]interface{}{
		"page": page, "search": search, "tag": tag,
	})
	
	// Build filter
	filter := "status = 'published'"
	if search != "" {
		filter += " && (title ~ '" + search + "' || content ~ '" + search + "')"
	}
	if tag != "" {
		filter += " && tags ~ '" + tag + "'"
	}
	
	// Get records with pagination
	records, err := s.app.FindRecordsByFilter(
		"posts",
		filter,
		"-published_at",
		20, // perPage
		0,  // offset - calculate from page
	)
	if err != nil {
		return nil, err
	}
	
	// Transform records to response format
	posts := make([]map[string]interface{}, len(records))
	for i, record := range records {
		posts[i] = map[string]interface{}{
			"id":           record.Id,
			"title":        record.GetString("title"),
			"slug":         record.GetString("slug"),
			"excerpt":      record.GetString("excerpt"),
			"published_at": record.GetDateTime("published_at"),
			"view_count":   record.GetInt("view_count"),
			"tags":         record.Get("tags"),
		}
		
		// Add author info if expanded
		if authorRecord := record.ExpandedOne("author"); authorRecord != nil {
			posts[i]["author"] = map[string]interface{}{
				"id":       authorRecord.Id,
				"username": authorRecord.GetString("username"),
			}
		}
	}
	
	return map[string]interface{}{
		"items":   posts,
		"page":    page,
		"perPage": 20,
		"total":   len(posts),
	}, nil
}

// GetPostBySlug retrieves a single post by slug
func (s *PostService) GetPostBySlug(slug string) (map[string]interface{}, error) {
	logger.Debug("Getting post by slug", map[string]interface{}{"slug": slug})
	
	record, err := s.app.FindFirstRecordByFilter(
		"posts",
		"slug = '"+slug+"' && status = 'published'",
	)
	if err != nil {
		return nil, err
	}
	
	// Increment view count
	currentViews := record.GetInt("view_count")
	record.Set("view_count", currentViews+1)
	if err := s.app.Save(record); err != nil {
		logger.Warn("Failed to update view count", err)
	}
	
	post := map[string]interface{}{
		"id":               record.Id,
		"title":            record.GetString("title"),
		"slug":             record.GetString("slug"),
		"content":          record.GetString("content"),
		"excerpt":          record.GetString("excerpt"),
		"published_at":     record.GetDateTime("published_at"),
		"view_count":       record.GetInt("view_count"),
		"tags":             record.Get("tags"),
		"meta_title":       record.GetString("meta_title"),
		"meta_description": record.GetString("meta_description"),
	}
	
	// Add author info if expanded
	if authorRecord := record.ExpandedOne("author"); authorRecord != nil {
		post["author"] = map[string]interface{}{
			"id":       authorRecord.Id,
			"username": authorRecord.GetString("username"),
		}
	}
	
	return post, nil
}

// CreatePost creates a new post
func (s *PostService) CreatePost(authorId string, data map[string]interface{}) (map[string]interface{}, error) {
	logger.Debug("Creating new post", map[string]interface{}{"authorId": authorId})
	
	collection, err := s.app.FindCollectionByNameOrId("posts")
	if err != nil {
		return nil, err
	}
	
	record := core.NewRecord(collection)
	
	// Set required fields
	record.Set("title", data["title"])
	record.Set("slug", data["slug"])
	record.Set("content", data["content"])
	record.Set("author", authorId)
	record.Set("status", data["status"])
	
	// Set optional fields
	if excerpt, ok := data["excerpt"]; ok {
		record.Set("excerpt", excerpt)
	}
	if tags, ok := data["tags"]; ok {
		record.Set("tags", tags)
	}
	if metaTitle, ok := data["meta_title"]; ok {
		record.Set("meta_title", metaTitle)
	}
	if metaDesc, ok := data["meta_description"]; ok {
		record.Set("meta_description", metaDesc)
	}
	
	// Set published_at if status is published
	if data["status"] == "published" {
		record.Set("published_at", "NOW()")
	}
	
	if err := s.app.Save(record); err != nil {
		return nil, err
	}
	
	return map[string]interface{}{
		"id":      record.Id,
		"title":   record.GetString("title"),
		"slug":    record.GetString("slug"),
		"status":  record.GetString("status"),
		"created": record.GetDateTime("created"),
	}, nil
}

// GetUserPosts retrieves posts by a specific user
func (s *PostService) GetUserPosts(userId, page string) (map[string]interface{}, error) {
	logger.Debug("Getting user posts", map[string]interface{}{"userId": userId, "page": page})
	
	records, err := s.app.FindRecordsByFilter(
		"posts",
		"author = '"+userId+"'",
		"-created",
		20, // perPage
		0,  // offset
	)
	if err != nil {
		return nil, err
	}
	
	posts := make([]map[string]interface{}, len(records))
	for i, record := range records {
		posts[i] = map[string]interface{}{
			"id":           record.Id,
			"title":        record.GetString("title"),
			"slug":         record.GetString("slug"),
			"status":       record.GetString("status"),
			"created":      record.GetDateTime("created"),
			"published_at": record.GetDateTime("published_at"),
			"view_count":   record.GetInt("view_count"),
		}
	}
	
	return map[string]interface{}{
		"items":   posts,
		"page":    page,
		"perPage": 20,
		"total":   len(posts),
	}, nil
}
