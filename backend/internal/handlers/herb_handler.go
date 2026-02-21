package handlers

import (
	"context"
	"time"

	"herb-api/internal/database"
	"herb-api/internal/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const collectionName = "herbs"

// GetAllHerbs retrieves all herbs from the database
func GetAllHerbs(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := database.GetCollection(collectionName)
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	defer cursor.Close(ctx)

	var herbs []models.Herb
	if err = cursor.All(ctx, &herbs); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(herbs)
}

// GetHerbByID retrieves a single herb by its ID
func GetHerbByID(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	idParam := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	collection := database.GetCollection(collectionName)
	var herb models.Herb
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&herb)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Herb not found"})
	}

	return c.JSON(herb)
}

// CreateHerb adds a new herb to the database
func CreateHerb(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var herb models.Herb
	if err := c.BodyParser(&herb); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	herb.CreatedAt = time.Now()
	herb.UpdatedAt = herb.CreatedAt

	collection := database.GetCollection(collectionName)
	result, err := collection.InsertOne(ctx, herb)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	herb.ID = result.InsertedID.(primitive.ObjectID)
	return c.Status(fiber.StatusCreated).JSON(herb)
}

// UpdateHerb updates an existing herb
func UpdateHerb(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	idParam := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	var updateData models.Herb
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	update := bson.M{
		"$set": bson.M{
			"name":            updateData.Name,
			"scientific_name": updateData.Scientific,
			"properties":      updateData.Properties,
			"description":     updateData.Description,
			"image_url":       updateData.ImageURL,
			"updated_at":      time.Now(),
		},
	}

	collection := database.GetCollection(collectionName)
	result, err := collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	if result.MatchedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Herb not found"})
	}

	return c.JSON(fiber.Map{"message": "Herb updated successfully"})
}

// DeleteHerb removes a herb from the database
func DeleteHerb(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	idParam := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	collection := database.GetCollection(collectionName)
	result, err := collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	if result.DeletedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Herb not found"})
	}

	return c.JSON(fiber.Map{"message": "Herb deleted successfully"})
}
