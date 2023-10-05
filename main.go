package main

import (
	"net/http"
	"os"
)

// address:TJ7m1yk5fbhhWkhxiM6Jh5ZH8zrSTvbi6D		2023-01-01

func main() {
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/", serveSankey)
	http.HandleFunc("/getdata", handler)

	// Get the PORT from the environment variable
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port if not specified
	}
	// Start the server using the specified port
	http.ListenAndServe(":"+port, nil)
}
