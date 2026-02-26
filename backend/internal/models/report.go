package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TargetType กำหนดว่า report มาจากส่วนไหนของระบบ
type TargetType string

const (
	TargetHerb      TargetType = "herb"
	TargetArticle   TargetType = "article"
	TargetCommunity TargetType = "community"
)

// ReportStatus สถานะการจัดการโดย Admin
type ReportStatus string

const (
	StatusPending   ReportStatus = "pending"   // รอ Admin ตรวจสอบ
	StatusReviewed  ReportStatus = "reviewed"  // Admin ดูแล้ว
	StatusResolved  ReportStatus = "resolved"  // แก้ไขแล้ว
	StatusDismissed ReportStatus = "dismissed" // ยกเลิก (ไม่ใช่ปัญหา)
)

type Report struct {
	ID primitive.ObjectID `json:"id,omitempty"   bson:"_id,omitempty"`

	// ---- ข้อมูล target ที่ถูก report ----
	TargetType TargetType `json:"target_type"    bson:"target_type"` // herb | article | community
	TargetID   string     `json:"target_id"      bson:"target_id"`   // ObjectID ของ herb/article/post
	TargetName string     `json:"target_name"    bson:"target_name"` // ชื่อ/หัวข้อ เพื่อให้ Admin อ่านง่าย

	// ---- ข้อมูลผู้ report ----
	ReporterID   string `json:"reporter_id"    bson:"reporter_id"` // user ID จาก JWT
	ReporterName string `json:"reporter_name"  bson:"reporter_name"`

	// ---- เนื้อหา report ----
	Reason string `json:"reason"         bson:"reason"` // เหตุผลที่เลือก
	Detail string `json:"detail"         bson:"detail"` // รายละเอียดเพิ่มเติม (optional)

	// ---- สถานะ ----
	Status    ReportStatus `json:"status"         bson:"status"`     // pending | reviewed | resolved | dismissed
	AdminNote string       `json:"admin_note"     bson:"admin_note"` // note จาก Admin

	CreatedAt time.Time `json:"created_at"     bson:"created_at"`
	UpdatedAt time.Time `json:"updated_at"     bson:"updated_at"`
}
