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
		

		// Add story generation endpoint
		se.Router.POST("/api/generate-story", func(e *core.RequestEvent) error {
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
				apiURL = "http://localhost:3000"
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

			log.Printf("Request payload JSON: %s", string(jsonData))

			// Retry logic for control-flow-excluded responses
			maxRetries := 3
			var lastResponse map[string]interface{}
			var lastResponseBody string
			
			for attempt := 1; attempt <= maxRetries; attempt++ {
				log.Printf("Attempt %d/%d: Making request to: %s", attempt, maxRetries, apiURL)
				
				// Make the HTTP request
				resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))
				if err != nil {
					log.Printf("Attempt %d: Error making HTTP request: %v", attempt, err)
					if attempt == maxRetries {
						return e.JSON(http.StatusInternalServerError, map[string]interface{}{
							"error": "Failed to make request to story API after all retries",
							"attempts": attempt,
						})
					}
					time.Sleep(time.Second * 2) // Wait 2 seconds before retry
					continue
				}
				defer resp.Body.Close()

				// Read the response
				responseBody, err := io.ReadAll(resp.Body)
				if err != nil {
					log.Printf("Attempt %d: Error reading response: %v", attempt, err)
					if attempt == maxRetries {
						return e.JSON(http.StatusInternalServerError, map[string]interface{}{
							"error": "Failed to read response from story API after all retries",
							"attempts": attempt,
						})
					}
					time.Sleep(time.Second * 2)
					continue
				}

				lastResponseBody = string(responseBody)
				log.Printf("Attempt %d: Story API response status: %d", attempt, resp.StatusCode)
				log.Printf("Attempt %d: Story API response headers: %+v", attempt, resp.Header)
				log.Printf("Attempt %d: Story API response body: %s", attempt, lastResponseBody)

				// If the target API returned an error, log it and return a descriptive response
				if resp.StatusCode >= 400 {
					log.Printf("Attempt %d: Target API returned error status %d: %s", attempt, resp.StatusCode, lastResponseBody)
					if attempt == maxRetries {
						return e.JSON(http.StatusBadGateway, map[string]interface{}{
							"error":   "Target API returned an error after all retries",
							"status":  resp.StatusCode,
							"message": lastResponseBody,
							"target_url": apiURL,
							"attempts": attempt,
						})
					}
					time.Sleep(time.Second * 2)
					continue
				}

				// Parse response JSON
				var responseData map[string]interface{}
				if err := json.Unmarshal(responseBody, &responseData); err != nil {
					log.Printf("Attempt %d: Error parsing response JSON: %v", attempt, err)
					if attempt == maxRetries {
						return e.JSON(resp.StatusCode, map[string]interface{}{
							"message": "Story generation completed but response parsing failed",
							"status":  "success",
							"raw_response": lastResponseBody,
							"parse_error": err.Error(),
							"attempts": attempt,
						})
					}
					time.Sleep(time.Second * 2)
					continue
				}

				lastResponse = responseData

				// Check if we got a control-flow-excluded response
				if output, exists := responseData["output"]; exists {
					if outputMap, ok := output.(map[string]interface{}); ok {
						if outputType, typeExists := outputMap["type"]; typeExists {
							if outputType == "control-flow-excluded" {
								log.Printf("Attempt %d: Received control-flow-excluded, retrying...", attempt)
								if attempt == maxRetries {
									log.Printf("Max retries reached, returning control-flow-excluded response")
									return e.JSON(http.StatusOK, map[string]interface{}{
										"message": "Story generation completed but returned control-flow-excluded after all retries",
										"status":  "control_flow_excluded",
										"data":    responseData,
										"attempts": attempt,
										"info": "The Rivet flow returned control-flow-excluded. This might indicate a configuration issue with the flow.",
									})
								}
								time.Sleep(time.Second * 2) // Wait before retry
								continue
							}
						}
					}
				}

				// Success! Parse the nested JSON if it exists
				log.Printf("Attempt %d: Success! Parsing and returning response", attempt)
				
				// Check if we have a nested JSON string in output.value
				if output, exists := responseData["output"]; exists {
					if outputMap, ok := output.(map[string]interface{}); ok {
						if outputType, typeExists := outputMap["type"]; typeExists && outputType == "string" {
							if outputValue, valueExists := outputMap["value"]; valueExists {
								if valueString, isString := outputValue.(string); isString {
									// Try to parse the nested JSON
									var parsedStory interface{}
									if err := json.Unmarshal([]byte(valueString), &parsedStory); err == nil {
										log.Printf("Attempt %d: Successfully parsed nested JSON story content", attempt)
										return e.JSON(resp.StatusCode, map[string]interface{}{
											"message": "Story generation completed successfully",
											"status":  "success",
											"story":   parsedStory, // Parsed story content
											"raw_data": responseData, // Original response for debugging
											"attempts": attempt,
										})
									} else {
										log.Printf("Attempt %d: Failed to parse nested JSON, returning as string: %v", attempt, err)
										return e.JSON(resp.StatusCode, map[string]interface{}{
											"message": "Story generation completed successfully",
											"status":  "success",
											"story_text": valueString, // Raw string content
											"data":    responseData,
											"attempts": attempt,
											"parse_note": "Story content returned as raw text (JSON parse failed)",
										})
									}
								}
							}
						}
					}
				}
				
				// Fallback: return the original response
				return e.JSON(resp.StatusCode, map[string]interface{}{
					"message": "Story generation completed successfully",
					"status":  "success",
					"data":    responseData,
					"attempts": attempt,
				})
			}

			// This should never be reached, but just in case
			return e.JSON(http.StatusOK, map[string]interface{}{
				"message": "Story generation completed after retries",
				"status":  "completed_with_retries",
				"data":    lastResponse,
				"attempts": maxRetries,
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
