package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	// uncomment to use js hooks
	// _ "github.com/pocketbase/pocketbase/plugins/jsvm"
)

func main() {
	app, err := newApp()
	if err != nil {
		log.Fatal(err)
	}

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

func newApp() (*pocketbase.PocketBase, error) {
	app := pocketbase.New()

	// add new "test" route
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.AddRoute(echo.Route{
			Method: http.MethodGet,
			Path:   "/api/test",
			Handler: func(c echo.Context) error {
				log.Println("Test endpoint called!")
				return c.String(200, "Test endpoint successful!")
			},
			Middlewares: []echo.MiddlewareFunc{
				apis.RequireAdminAuth(),
			},
		})

		return nil
	})

	return app, nil
}
