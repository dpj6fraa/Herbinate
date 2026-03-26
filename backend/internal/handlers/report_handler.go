package handlers

import (
	"context"
	"time"

	"herb-api/internal/database"
	"herb-api/internal/middleware"
	"herb-api/internal/models"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const reportCollection = "reports"

// ---- Validation ----

// ---- Validation อัปเดตใหม่ ----

var validTargetTypes = map[string]bool{
	"herb":      true,
	"article":   true,
	"community": true, // สำหรับ Post
	"comment":   true, // เพิ่มสำหรับ Comment
}

var validReasons = map[string][]string{
	"herb": {
		"ข้อมูลสรรพคุณไม่ถูกต้อง",
		"วิธีใช้หรือขนาดยาผิดพลาด",
		"คำเตือนด้านสุขภาพไม่ครบถ้วน",
		"ข้อมูลซ้ำกับรายการอื่น",
		"เนื้อหาไม่เหมาะสม",
		"อื่นๆ",
	},
	"article": {
		"ข้อมูลทางการแพทย์ไม่ถูกต้อง",
		"เนื้อหาเป็นข้อมูลเท็จหรือเข้าใจผิด",
		"ละเมิดลิขสิทธิ์หรือคัดลอกเนื้อหา",
		"เนื้อหาไม่เหมาะสม",
		"โฆษณาแฝงหรือชักชวนซื้อสินค้า",
		"อื่นๆ",
	},
	"community": { // ใช้สำหรับ Post
		"เนื้อหาก้าวร้าวหรือคุกคาม",
		"ข้อมูลสุขภาพที่เป็นอันตราย",
		"สแปมหรือโฆษณา",
		"เนื้อหาไม่เหมาะสม",
		"อื่นๆ",
	},
	"comment": { // เพิ่มใหม่
		"ใช้ถ้อยคำไม่สุภาพ",
		"สแปมหรือโฆษณา",
		"ข้อมูลเท็จ",
		"คุกคามหรือกลั่นแกล้ง",
		"อื่นๆ",
	},
}

func isValidReason(targetType, reason string) bool {
	reasons, ok := validReasons[targetType]
	if !ok {
		return false
	}
	for _, r := range reasons {
		if r == reason {
			return true
		}
	}
	return false
}

// -------------------------------------------------------
// POST /reports
// Auth required: ต้องมี user ใน context (จาก JWT middleware)
// -------------------------------------------------------
func CreateReport(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// ใช้ GetUserID จาก middleware ซึ่ง set Locals เป็น primitive.ObjectID
	userObjID := middleware.GetUserID(c)
	if userObjID == primitive.NilObjectID {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}
	reporterID := userObjID.Hex()
	reporterName := "" // ไม่มีใน middleware ปัจจุบัน

	// Parse body
	type RequestBody struct {
		TargetType string `json:"target_type"`
		TargetID   string `json:"target_id"`
		TargetName string `json:"target_name"`
		Reason     string `json:"reason"`
		Detail     string `json:"detail"`
	}

	var body RequestBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate target_type
	if !validTargetTypes[body.TargetType] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid target_type: must be herb, article, or community",
		})
	}

	// Validate target_id
	if body.TargetID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "target_id is required",
		})
	}

	// Validate reason
	if !isValidReason(body.TargetType, body.Reason) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid reason for target_type " + body.TargetType,
		})
	}

	// ป้องกัน report ซ้ำ (reporter + target เดิม + reason เดิม ที่ยัง pending อยู่)
	collection := database.GetCollection(reportCollection)
	existingCount, err := collection.CountDocuments(ctx, bson.M{
		"reporter_id": reporterID,
		"target_id":   body.TargetID,
		"target_type": body.TargetType,
		"status":      models.StatusPending,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	if existingCount > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "คุณได้รายงานเนื้อหานี้ไว้แล้ว และยังอยู่ระหว่างการตรวจสอบ",
		})
	}

	now := time.Now()
	report := models.Report{
		ID:           primitive.NewObjectID(),
		TargetType:   models.TargetType(body.TargetType),
		TargetID:     body.TargetID,
		TargetName:   body.TargetName,
		ReporterID:   reporterID,
		ReporterName: reporterName,
		Reason:       body.Reason,
		Detail:       body.Detail,
		Status:       models.StatusPending,
		AdminNote:    "",
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if _, err := collection.InsertOne(ctx, report); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "รายงานของคุณถูกส่งเรียบร้อยแล้ว",
		"id":      report.ID,
	})
}

// -------------------------------------------------------
// GET /admin/reports  (Admin only)
// Query params:
//
//	?status=pending|reviewed|resolved|dismissed
//	?type=herb|article|community
//	?page=1&limit=20
//
// -------------------------------------------------------
func GetReports(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{}

	if status := c.Query("status"); status != "" {
		filter["status"] = status
	}
	if targetType := c.Query("type"); targetType != "" {
		filter["target_type"] = targetType
	}

	collection := database.GetCollection(reportCollection)
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	defer cursor.Close(ctx)

	var reports []models.Report
	if err := cursor.All(ctx, &reports); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(reports)
}

// -------------------------------------------------------
// PATCH /admin/reports/:id  (Admin only)
// Body: { "status": "resolved", "admin_note": "..." }
// -------------------------------------------------------
func UpdateReportStatus(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	type RequestBody struct {
		Status    string `json:"status"`
		AdminNote string `json:"admin_note"`
	}

	var body RequestBody
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate status
	validStatuses := map[string]bool{
		"pending": true, "reviewed": true,
		"resolved": true, "dismissed": true,
	}
	if !validStatuses[body.Status] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid status",
		})
	}

	collection := database.GetCollection(reportCollection)
	result, err := collection.UpdateOne(ctx,
		bson.M{"_id": objID},
		bson.M{"$set": bson.M{
			"status":     body.Status,
			"admin_note": body.AdminNote,
			"updated_at": time.Now(),
		}},
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	if result.MatchedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Report not found",
		})
	}

	return c.JSON(fiber.Map{"message": "Status updated"})
}

// -------------------------------------------------------
// GET /admin/reports/:id  (Admin only)
// -------------------------------------------------------
func GetReportByID(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	collection := database.GetCollection(reportCollection)
	var report models.Report
	if err := collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&report); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Report not found",
		})
	}

	return c.JSON(report)
}
