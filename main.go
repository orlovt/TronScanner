package main

import (
	"net/http"
)

// address:TJ7m1yk5fbhhWkhxiM6Jh5ZH8zrSTvbi6D		2023-01-01
func main() {
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/", serveSankey)
	http.HandleFunc("/getdata", handler)
	http.ListenAndServe(":8080", nil)
}
