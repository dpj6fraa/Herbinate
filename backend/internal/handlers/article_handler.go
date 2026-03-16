package handlers

import (
	"context"
	"encoding/json"
	"os"
	"time"

	"herb-api/internal/database"
	"herb-api/internal/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const articleCollection = "articles"

func GetAllArticles(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := database.GetCollection(articleCollection)
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	defer cursor.Close(ctx)

	var articles []models.Article
	if err = cursor.All(ctx, &articles); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(articles)
}

func GetArticleByID(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	collection := database.GetCollection(articleCollection)
	var article models.Article
	if err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&article); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Article not found"})
	}

	return c.JSON(article)
}

func CreateArticle(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	title := c.FormValue("title")
	description := c.FormValue("description")

	var tags []string
	if err := json.Unmarshal([]byte(c.FormValue("tags")), &tags); err != nil {
		tags = []string{}
	}

	var sections []models.HerbSection
	if err := json.Unmarshal([]byte(c.FormValue("sections")), &sections); err != nil {
		sections = []models.HerbSection{}
	}

	var imageURL string
	if file, err := c.FormFile("image"); err == nil {
		os.MkdirAll("./uploads/articles", os.ModePerm)
		filename := primitive.NewObjectID().Hex() + "_" + file.Filename
		path := "./uploads/articles/" + filename
		if err := c.SaveFile(file, path); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to save image"})
		}
		imageURL = "/uploads/articles/" + filename
	}

	now := time.Now()
	article := models.Article{
		ID:          primitive.NewObjectID(),
		Title:       title,
		Description: description,
		Tags:        tags,
		Sections:    sections,
		ImageURL:    imageURL,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	collection := database.GetCollection(articleCollection)
	if _, err := collection.InsertOne(ctx, article); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(article)
}

func UpdateArticle(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	// รองรับทั้ง JSON body และ multipart form
	title := c.FormValue("title")
	description := c.FormValue("description")

	var tags []string
	if err := json.Unmarshal([]byte(c.FormValue("tags")), &tags); err != nil {
		tags = []string{}
	}

	var sections []models.HerbSection
	if err := json.Unmarshal([]byte(c.FormValue("sections")), &sections); err != nil {
		sections = []models.HerbSection{}
	}

	// โหลด article เดิมก่อน เพื่อเก็บ image_url เดิมถ้าไม่ได้อัปโหลดใหม่
	collection := database.GetCollection(articleCollection)
	var existing models.Article
	if err := collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&existing); err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Article not found"})
	}

	imageURL := existing.ImageURL
	if file, err := c.FormFile("image"); err == nil {
		os.MkdirAll("./uploads/articles", os.ModePerm)
		filename := primitive.NewObjectID().Hex() + "_" + file.Filename
		path := "./uploads/articles/" + filename
		if err := c.SaveFile(file, path); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to save image"})
		}
		imageURL = "/uploads/articles/" + filename
	}

	update := bson.M{
		"$set": bson.M{
			"title":       title,
			"description": description,
			"tags":        tags,
			"sections":    sections,
			"image_url":   imageURL,
			"updated_at":  time.Now(),
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	if result.MatchedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Article not found"})
	}

	return c.JSON(fiber.Map{"message": "Updated successfully"})
}

func DeleteArticle(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	collection := database.GetCollection(articleCollection)
	result, err := collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	if result.DeletedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Article not found"})
	}

	return c.JSON(fiber.Map{"message": "Article deleted successfully"})
}

func SearchArticleByTag(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	tag := c.Query("tag")
	collection := database.GetCollection(articleCollection)
	cursor, err := collection.Find(ctx, bson.M{
		"tags": bson.M{"$in": []string{tag}},
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	defer cursor.Close(ctx)

	var articles []models.Article
	cursor.All(ctx, &articles)

	return c.JSON(articles)
}
