package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
)

const baseURL = "https://api.trongrid.io"

type ApiResponse struct {
	Data []struct {
		Trc20 []map[string]string `json:"trc20"`
	} `json:"data"`
}

func getBalance(address string) (float64, error) {
	resp, err := http.Get(baseURL + "/v1/accounts/" + address)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return 0, err
	}

	var apiResponse ApiResponse
	err = json.Unmarshal(body, &apiResponse)
	if err != nil {
		return 0, err
	}

	// Iterate through the trc20 array to find the balance for the specified token address
	for _, trc20Map := range apiResponse.Data[0].Trc20 {
		if balanceStr, exists := trc20Map["TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"]; exists {
			balanceInt, err := strconv.ParseInt(balanceStr, 10, 64)
			if err != nil {
				return 0, err
			}
			return float64(balanceInt) / 1e6, nil
		}
	}

	return 0, fmt.Errorf("balance not found for token address")
}

// func main() {
// 	address := "TJ7m1yk5fbhhWkhxiM6Jh5ZH8zrSTvbi6D"
// 	balance, err := getBalance(address)
// 	if err != nil {
// 		fmt.Println("Error:", err)
// 		return
// 	}
// 	fmt.Printf("Balance for token address TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t: %f\n", balance)
// }
