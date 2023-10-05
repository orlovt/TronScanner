package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handler has received request for /getdata")

	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	fmt.Println("Processing POST request...")

	// Parse the incoming JSON data from request body
	var requestData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Safely extract values with type assertions
	nboundDepth, ok := requestData["nboundDepth"].(float64)
	if !ok {
		http.Error(w, "Invalid or missing nboundDepth", http.StatusBadRequest)
		return
	}
	outboundDepth, ok := requestData["outboundDepth"].(float64)
	if !ok {
		http.Error(w, "Invalid or missing outboundDepth", http.StatusBadRequest)
		return
	}
	limit, ok := requestData["limit"].(float64)
	if !ok {
		http.Error(w, "Invalid or missing limit", http.StatusBadRequest)
		return
	}

	address, ok := requestData["address"].(string)
	if !ok {
		http.Error(w, "Invalid or missing address", http.StatusBadRequest)
		return
	}

	fromDate, ok := requestData["fromDate"].(string)
	if !ok {
		http.Error(w, "Invalid or missing fromDate", http.StatusBadRequest)
		return
	}
	tillDate, ok := requestData["tillDate"].(string)
	if !ok {
		http.Error(w, "Invalid or missing tillDate", http.StatusBadRequest)
		return
	}

	// Always call fetchBitQueryData2 first
	transactionsData := getIncomingTransfersData(50, address, fromDate, tillDate, "%Y-%m-%d")

	var transactions map[string]interface{}
	if err := json.Unmarshal([]byte(transactionsData), &transactions); err != nil {
		http.Error(w, "Failed to unmarshal transactions JSON data", http.StatusInternalServerError)
		return
	}

	// Then call fetchBitQueryData
	jsonData := getVolumesData(int(nboundDepth), int(outboundDepth), int(limit), 0, address, "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", fromDate, tillDate, "%Y-%m-%d")

	var data map[string]interface{}
	if err := json.Unmarshal([]byte(jsonData), &data); err != nil {
		http.Error(w, "Failed to unmarshal JSON data", http.StatusInternalServerError)
		return
	}

	sources, targets, values, err := preprocessData(data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Combine the results from both functions into one response
	response := map[string]interface{}{
		"transactions": transactions,
		"sources":      sources,
		"targets":      targets,
		"values":       values,
	}

	responseJSON, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Failed to marshal response to JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	w.Write(responseJSON)
	fmt.Println("Wrote JSON")
	// fmt.Println(string(responseJSON))
}

func serveSankey(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "sankey.html")
}
