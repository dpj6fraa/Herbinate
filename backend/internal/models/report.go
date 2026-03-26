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

	TargetType TargetType `json:"target_type"    bson:"target_type"`
	TargetID   string     `json:"target_id"      bson:"target_id"`
	TargetName string     `json:"target_name"    bson:"target_name"`

	// ✅ เพิ่ม field นี้ — ใช้เก็บ Post ID เมื่อ target_type = "comment"
	CommunityPostID string `json:"community_post_id" bson:"community_post_id,omitempty"`

	ReporterID   string `json:"reporter_id"    bson:"reporter_id"`
	ReporterName string `json:"reporter_name"  bson:"reporter_name"`

	Reason string `json:"reason"         bson:"reason"`
	Detail string `json:"detail"         bson:"detail"`

	Status    ReportStatus `json:"status"         bson:"status"`
	AdminNote string       `json:"admin_note"     bson:"admin_note"`

	CreatedAt time.Time `json:"created_at"     bson:"created_at"`
	UpdatedAt time.Time `json:"updated_at"     bson:"updated_at"`
}
