package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

func preprocessData(data map[string]interface{}) ([]string, []string, []float64, error) {
	fmt.Println("Preprocessing data")
	var sources []string
	var targets []string
	var values []float64

	tronData, ok := data["data"].(map[string]interface{})["tron"].(map[string]interface{})
	if !ok {
		return nil, nil, nil, fmt.Errorf("Failed to extract tron data")
	}

	// Extracting inbound transactions
	inbounds, ok := tronData["inbound"].([]interface{})
	if ok {
		for _, inbound := range inbounds {
			transaction := inbound.(map[string]interface{})
			sources = append(sources, transaction["sender"].(map[string]interface{})["address"].(string))
			targets = append(targets, transaction["receiver"].(map[string]interface{})["address"].(string))
			values = append(values, transaction["amount"].(float64))
		}
	}

	// Extracting outbound transactions
	outbounds, ok := tronData["outbound"].([]interface{})
	if ok {
		for _, outbound := range outbounds {
			transaction := outbound.(map[string]interface{})
			sources = append(sources, transaction["sender"].(map[string]interface{})["address"].(string))
			targets = append(targets, transaction["receiver"].(map[string]interface{})["address"].(string))
			values = append(values, transaction["amount"].(float64))
		}
	}

	fmt.Println("Processed data")

	return sources, targets, values, nil
}

func getVolumesData(inboundDepth, outboundDepth, limit, offset int, address, currency, fromDate, tillDate, dateFormat string) string {
	url := "https://graphql.bitquery.io"
	method := "POST"

	payloadStr := fmt.Sprintf(`{
        "query": "query ($address: String!, $inboundDepth: Int!, $outboundDepth: Int!, $limit: Int!, $currency: String!, $from: ISO8601DateTime, $till: ISO8601DateTime) {\n  tron {\n    inbound: coinpath(\n      initialAddress: {is: $address}\n      currency: {is: $currency}\n      depth: {lteq: $inboundDepth}\n      options: {direction: inbound, asc: \"depth\", desc: \"amount\", limitBy: {each: \"depth\", limit: $limit}}\n      date: {since: $from, till: $till}\n    ) {\n      sender {\n        address\n        annotation\n        smartContract {\n          contractType\n          currency {\n            symbol\n            name\n          }\n        }\n      }\n      receiver {\n        address\n        annotation\n        smartContract {\n          contractType\n          currency {\n            symbol\n            name\n          }\n        }\n      }\n      amount\n      currency {\n        symbol\n      }\n      depth\n      count\n    }\n    outbound: coinpath(\n      initialAddress: {is: $address}\n      currency: {is: $currency}\n      depth: {lteq: $outboundDepth}\n      options: {asc: \"depth\", desc: \"amount\", limitBy: {each: \"depth\", limit: $limit}}\n      date: {since: $from, till: $till}\n    ) {\n      sender {\n        address\n        annotation\n        smartContract {\n          contractType\n          currency {\n            symbol\n            name\n          }\n        }\n      }\n      receiver {\n        address\n        annotation\n        smartContract {\n          contractType\n          currency {\n            symbol\n            name\n          }\n        }\n      }\n      amount\n      currency {\n        symbol\n      }\n      depth\n      count\n    }\n  }\n}\n", 
        "variables": {
            "inboundDepth": %d,
            "outboundDepth": %d,
            "limit": %d,
            "offset": %d,
            "address": "%s",
            "currency": "%s",
            "from": "%s",
            "till": "%s",
            "dateFormat": "%s"
        }
    }`, inboundDepth, outboundDepth, limit, offset, address, currency, fromDate, tillDate, dateFormat)

	payload := strings.NewReader(payloadStr)

	client := &http.Client{}
	req, err := http.NewRequest(method, url, payload)

	if err != nil {
		fmt.Println(err)
		return ""
	}
	apiKey := "BQYdHYhilyWCcxKn29hK6W9ZNPmm7oAC"
	// apiKey := os.Getenv("MY_API_KEY")
	if apiKey == "" {
		log.Fatal("API key not set in MY_API_KEY environment variable")
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("X-API-KEY", apiKey)

	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	return string(body)
}
