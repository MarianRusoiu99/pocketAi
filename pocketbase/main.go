package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func main() {
	// Load environment variables from .env.local
	if err := godotenv.Load(".env.local"); err != nil {
		log.Printf("Warning: Could not load .env.local file: %v", err)
	}

	app := pocketbase.New()

	// Register custom routes/endpoints
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// Add custom /test endpoint that logs some test output
		se.Router.GET("/test", func(e *core.RequestEvent) error {
			// Console log some test output
			log.Println("=== Test endpoint called! ===")
			log.Println("Timestamp:", time.Now().Format("2006-01-02 15:04:05"))
			log.Println("Method:", e.Request.Method)
			log.Println("URL:", e.Request.URL.String())
			log.Println("User Agent:", e.Request.Header.Get("User-Agent"))
			log.Println("Remote IP:", e.RemoteIP())
			log.Println("Real IP:", e.RealIP())
			log.Println("Host:", e.Request.Host)
			log.Println("================================")
			
			// Return a simple JSON response
			return e.JSON(http.StatusOK, map[string]interface{}{
				"message": "Test endpoint working!",
				"status":  "success",
				"data": map[string]interface{}{
					"timestamp": time.Now().Format("2006-01-02 15:04:05"),
					"endpoint":  "/test",
					"method":    "GET",
					"server":    "PocketBase Go Extension",
					"version":   "1.0.0",
				},
			})
		})

		// Add story generation endpoint
		se.Router.POST("/generate-story", func(e *core.RequestEvent) error {
			// Parse request body
			var requestData struct {
				NChapters           int    `json:"n_chapters"`
				StoryInstructions   string `json:"story_instructions"`
				PrimaryCharacters   string `json:"primary_characters"`
				SecondaryCharacters string `json:"secondary_characters"`
				LChapter            int    `json:"l_chapter"`
			}

			if err := e.BindBody(&requestData); err != nil {
				log.Printf("Error parsing request body: %v", err)
				return e.JSON(http.StatusBadRequest, map[string]interface{}{
					"error": "Invalid request body",
				})
			}

			// Log the incoming request
			log.Println("=== Story generation request ===")
			log.Printf("N Chapters: %d", requestData.NChapters)
			log.Printf("Story Instructions: %s", requestData.StoryInstructions)
			log.Printf("Primary Characters: %s", requestData.PrimaryCharacters)
			log.Printf("Secondary Characters: %s", requestData.SecondaryCharacters)
			log.Printf("L Chapter: %d", requestData.LChapter)
			log.Println("===============================")

			// Get API URL from environment
			apiURL := os.Getenv("STORY_API_URL")
			if apiURL == "" {
				log.Println("STORY_API_URL not found in environment, using default")
				apiURL = "http://localhost:3000/"
			}

			log.Printf("Loaded API URL from environment: %s", apiURL)

			// Prepare the request payload
			payload := map[string]interface{}{
				"n_chapters":           requestData.NChapters,
				"story_instructions":   requestData.StoryInstructions,
				"primary_characters":   requestData.PrimaryCharacters,
				"secondary_characters": requestData.SecondaryCharacters,
				"l_chapter":            requestData.LChapter,
			}

			// Convert to JSON
			jsonData, err := json.Marshal(payload)
			if err != nil {
				log.Printf("Error marshaling JSON: %v", err)
				return e.JSON(http.StatusInternalServerError, map[string]interface{}{
					"error": "Failed to prepare request",
				})
			}

			// Make the HTTP request
			log.Printf("Making request to: %s", apiURL)
			resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))
			if err != nil {
				log.Printf("Error making HTTP request: %v", err)
				return e.JSON(http.StatusInternalServerError, map[string]interface{}{
					"error": "Failed to make request to story API",
				})
			}
			defer resp.Body.Close()

			// Read the response
			responseBody, err := io.ReadAll(resp.Body)
			if err != nil {
				log.Printf("Error reading response: %v", err)
				return e.JSON(http.StatusInternalServerError, map[string]interface{}{
					"error": "Failed to read response from story API",
				})
			}

			log.Printf("Story API response status: %d", resp.StatusCode)
			log.Printf("Story API response body: %s", string(responseBody))

			// If the target API returned an error, log it and return a descriptive response
			if resp.StatusCode >= 400 {
				log.Printf("Target API returned error status %d: %s", resp.StatusCode, string(responseBody))
				return e.JSON(http.StatusBadGateway, map[string]interface{}{
					"error":   "Target API returned an error",
					"status":  resp.StatusCode,
					"message": string(responseBody),
					"target_url": apiURL,
				})
			}

			// Parse response JSON
			var responseData interface{}
			if err := json.Unmarshal(responseBody, &responseData); err != nil {
				log.Printf("Error parsing response JSON: %v", err)
				// Return raw response if JSON parsing fails
				return e.JSON(resp.StatusCode, map[string]interface{}{
					"message": "Story generation completed",
					"status":  "success",
					"raw_response": string(responseBody),
				})
			}

			// Return the response
			return e.JSON(resp.StatusCode, map[string]interface{}{
				"message": "Story generation completed",
				"status":  "success",
				"data":    responseData,
			})
		})

		// Serve static files from the public directory (if exists)
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))

		return se.Next()
	})

	// Start the application
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
