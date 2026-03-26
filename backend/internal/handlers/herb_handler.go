package handlers

import (
	"context"
	"encoding/json"
	"os"
	"time"

	"herb-api/internal/database"
	"herb-api/internal/middleware"
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

	// -------- TEXT FIELDS --------
	name := c.FormValue("name")
	scientific := c.FormValue("scientific_name")

	// parse tags (JSON string)
	var tags []string
	if err := json.Unmarshal([]byte(c.FormValue("tags")), &tags); err != nil {
		tags = []string{}
	}

	// parse sections (JSON string)
	var sections []models.HerbSection
	if err := json.Unmarshal([]byte(c.FormValue("sections")), &sections); err != nil {
		sections = []models.HerbSection{}
	}

	// -------- FILE UPLOAD --------
	var imageURL string

	file, err := c.FormFile("image")
	if err == nil {
		// สร้างโฟลเดอร์ถ้ายังไม่มี
		os.MkdirAll("./uploads/herbs", os.ModePerm)

		filename := primitive.NewObjectID().Hex() + "_" + file.Filename
		path := "./uploads/herbs/" + filename

		if err := c.SaveFile(file, path); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to save image"})
		}

		imageURL = "/uploads/herbs/" + filename
	}

	now := time.Now()

	// ใน CreateHerb หลัง parse sections เพิ่ม:
	description := c.FormValue("description")

	// และใน struct herb:
	herb := models.Herb{
		ID:          primitive.NewObjectID(),
		Name:        name,
		Scientific:  scientific,
		Tags:        tags,
		Sections:    sections,
		Description: description, // ✅ เพิ่มตรงนี้
		ImageURL:    imageURL,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	collection := database.GetCollection(collectionName)

	_, err = collection.InsertOne(ctx, herb)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(herb)
}

// UpdateHerb updates an existing herb
func UpdateHerb(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	idParam := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	var updateData models.Herb
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	update := bson.M{
		"$set": bson.M{
			"name":            updateData.Name,
			"scientific_name": updateData.Scientific,
			"tags":            updateData.Tags,
			"sections":        updateData.Sections,
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

	return c.JSON(fiber.Map{"message": "Updated successfully"})
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

func SearchByTag(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	tag := c.Query("tag")

	collection := database.GetCollection(collectionName)
	cursor, err := collection.Find(ctx, bson.M{
		"tags": bson.M{"$in": []string{tag}},
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	defer cursor.Close(ctx)

	var herbs []models.Herb
	cursor.All(ctx, &herbs)

	return c.JSON(herbs)
}

const herbBookmarkCollection = "herb_bookmarks"

// ToggleBookmarkHerb สลับสถานะการบุ๊กมาร์กสมุนไพร
func ToggleBookmarkHerb(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userID := middleware.GetUserID(c)
	if userID == primitive.NilObjectID {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	herbID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid herb ID"})
	}

	collection := database.GetCollection(herbBookmarkCollection)

	// Check if bookmark exists
	filter := bson.M{"herb_id": herbID, "user_id": userID}
	var existing models.HerbBookmark
	err = collection.FindOne(ctx, filter).Decode(&existing)

	if err == nil {
		// Bookmark exists, so we toggle its status
		newStatus := !existing.Status
		update := bson.M{"$set": bson.M{"status": newStatus}}
		_, err := collection.UpdateOne(ctx, filter, update)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update bookmark"})
		}

		statusMsg := "Bookmark removed"
		if newStatus {
			statusMsg = "Bookmark added"
		}
		return c.JSON(fiber.Map{"message": statusMsg, "bookmarked": newStatus})
	}

	// Bookmark doesn't exist, so we create it
	newBookmark := models.HerbBookmark{
		ID:        primitive.NewObjectID(),
		HerbID:    herbID,
		UserID:    userID,
		Status:    true,
		CreatedAt: time.Now(),
	}

	_, err = collection.InsertOne(ctx, newBookmark)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add bookmark"})
	}

	return c.JSON(fiber.Map{"message": "Bookmark added", "bookmarked": true})
}

// GetHerbBookmarkStatus ดึงสถานะการบุ๊กมาร์กของสมุนไพรแต่ละตัว
func GetHerbBookmarkStatus(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userID := middleware.GetUserID(c)
	if userID == primitive.NilObjectID {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	herbID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid herb ID"})
	}

	collection := database.GetCollection(herbBookmarkCollection)

	filter := bson.M{"herb_id": herbID, "user_id": userID}
	var existing models.HerbBookmark
	err = collection.FindOne(ctx, filter).Decode(&existing)

	if err != nil {
		// Not found means not bookmarked
		return c.JSON(fiber.Map{"bookmarked": false})
	}

	return c.JSON(fiber.Map{"bookmarked": existing.Status})
}

// GetAllBookmarkedHerbs ดึงข้อมูลสมุนไพรทั้งหมดที่ผู้ใช้บุ๊กมาร์กไว้
func GetAllBookmarkedHerbs(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userID := middleware.GetUserID(c)
	if userID == primitive.NilObjectID {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	collection := database.GetCollection(herbBookmarkCollection)

	cursor, err := collection.Find(ctx, bson.M{"user_id": userID, "status": true})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	defer cursor.Close(ctx)

	var bookmarks []models.HerbBookmark
	if err := cursor.All(ctx, &bookmarks); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	if len(bookmarks) == 0 {
		return c.JSON([]models.Herb{})
	}

	var herbIDs []primitive.ObjectID
	for _, b := range bookmarks {
		herbIDs = append(herbIDs, b.HerbID)
	}

	// ใช้ collectionName ("herbs") ที่มีอยู่แล้วในไฟล์นี้
	herbColl := database.GetCollection(collectionName)
	herbCursor, err := herbColl.Find(ctx, bson.M{"_id": bson.M{"$in": herbIDs}})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	defer herbCursor.Close(ctx)

	var herbs []models.Herb
	if err := herbCursor.All(ctx, &herbs); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(herbs)
}
