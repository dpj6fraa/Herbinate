package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port string
}

func Load() *Config {
	// Load environment variables
	err := godotenv.Load("./.env")
	if err != nil {
		log.Println("Warning: Error loading .env file, using system environment variables")
	}

	return &Config{
		Port: getEnv("PORT", "8081"),
	}
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
