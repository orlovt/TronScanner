package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

func fetchBitQueryData2(limit int, address, from, till, dateFormat string) string {
	url := "https://graphql.bitquery.io"
	method := "POST"

	// This does not work
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

	// This works
	// payload := strings.NewReader(`{"query":"query ($address: String!, $limit: Int!, $from: ISO8601DateTime, $till: ISO8601DateTime) {\n  tron {\n    transfers(\n      options: {desc: \"block.timestamp.time\", asc: \"currency.symbol\", limit: $limit, offset: 0}\n      date: {since: $from, till: $till}\n      amount: {gt: 0}\n      receiver: {is: $address}\n    ) {\n      block {\n        timestamp {\n          time(format: \"%Y-%m-%d %H:%M:%S\")\n        }\n      }\n      address: sender {\n        address\n        annotation\n      }\n      currency {\n        symbol\n        tokenType\n      }\n      amount\n      amount_usd: amount(in: USD)\n      txHash\n      receiver {\n        address\n        annotation\n      }\n    }\n  }\n}\n","variables":"{\n  \"limit\": 10,\n  \"address\": \"TJ7m1yk5fbhhWkhxiM6Jh5ZH8zrSTvbi6D\",\n  \"from\": \"2023-09-27\",\n  \"till\": \"2023-10-04T23:59:59\",\n  \"dateFormat\": \"%Y-%m-%d\"\n}"}`)
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

// func main() {
// 	response := fetchBitQueryData2(50, "TJ7m1yk5fbhhWkhxiM6Jh5ZH8zrSTvbi6D", "2023-09-27", "2023-10-04", "%Y-%m-%d")
// 	fmt.Println(response)
// }
