package main

import (
	"log"
	"net/http"

	"myapp/internal/config"
	apphttp "myapp/internal/http"
)

func main() {
	router := apphttp.NewRouter()
	cfg := config.Load()

	log.Println("Server running on :" + cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, router))
}
