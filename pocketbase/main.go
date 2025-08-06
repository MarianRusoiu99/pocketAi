package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func main() {
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

		// Serve static files from the public directory (if exists)
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))

		return se.Next()
	})

	// Start the application
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
