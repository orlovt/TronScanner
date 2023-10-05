package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

func getIncomingTransfersData(limit int, address, from, till, dateFormat string) string {
	url := "https://graphql.bitquery.io"
	method := "POST"

	payloadStr := fmt.Sprintf(`{
		"query": "query ($address: String!, $limit: Int!, $from: ISO8601DateTime, $till: ISO8601DateTime) {\n  tron {\n    transfers(\n      options: {desc: \"block.timestamp.time\", asc: \"currency.symbol\", limit: $limit, offset: 0}\n      date: {since: $from, till: $till}\n      amount: {gt: 0}\n      receiver: {is: $address}\n    ) {\n      block {\n        timestamp {\n          time(format: \"%%Y-%%m-%%d %%H:%%M:%%S\")\n        }\n      }\n      address: sender {\n        address\n        annotation\n      }\n      currency {\n        symbol\n        tokenType\n      }\n      amount\n      amount_usd: amount(in: USD)\n      txHash\n      receiver {\n        address\n        annotation\n      }\n    }\n  }\n}",
		"variables": {
			"limit": %d,
			"address": "%s",
			"from": "%s",
			"till": "%s"
		}
	}`, limit, address, from, till)

	payload := strings.NewReader(payloadStr)

	client := &http.Client{}
	req, err := http.NewRequest(method, url, payload)

	if err != nil {
		fmt.Println(err)
		return ""
	}
	// apiKey := os.Getenv("MY_API_KEY")
	apiKey := "BQYdHYhilyWCcxKn29hK6W9ZNPmm7oAC"
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
