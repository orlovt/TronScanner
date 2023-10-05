package main

import (
	"net/http"
	"os"

	"github.com/orlovt/tron_go/utils"
)

// address:TJ7m1yk5fbhhWkhxiM6Jh5ZH8zrSTvbi6D		2023-01-01
func main() {
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/", utils.ServeSankey)
	http.HandleFunc("/getdata", utils.Handler)

	// Get the PORT from the environment variable
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port if not specified
	}
	// Start the server using the specified port
	http.ListenAndServe(":"+port, nil)
}
