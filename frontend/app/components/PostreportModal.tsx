"use client";

import BaseReportModal from "./BaseReportModal";

const POST_REASONS = [
  "เนื้อหาก้าวร้าวหรือคุกคาม",
  "ข้อมูลสุขภาพที่เป็นอันตราย",
  "สแปมหรือโฆษณา",
  "เนื้อหาไม่เหมาะสม",
  "อื่นๆ",
];

interface PostReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string; // หรือใช้เนื้อหาบางส่วนของโพสต์
}

export default function PostReportModal({
  isOpen,
  onClose,
  postId,
  postTitle,
}: PostReportModalProps) {
  return (
    <BaseReportModal
      isOpen={isOpen}
      onClose={onClose}
      targetType="community" // ตรงกับ validation ใน backend
      targetId={postId}
      targetName={postTitle}
      title="รายงานโพสต์"
      reasons={POST_REASONS}
      detailPlaceholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับโพสต์นี้..."
    />
  );
}