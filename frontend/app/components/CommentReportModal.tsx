"use client";

import BaseReportModal from "./BaseReportModal";

const COMMENT_REASONS = [
  "ใช้ถ้อยคำไม่สุภาพ",
  "สแปมหรือโฆษณา",
  "ข้อมูลเท็จ",
  "คุกคามหรือกลั่นแกล้ง",
  "อื่นๆ",
];

interface CommentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  commentId: string;
  commentContent: string;
}

export default function CommentReportModal({
  isOpen,
  onClose,
  commentId,
  commentContent,
}: CommentReportModalProps) {
  return (
    <BaseReportModal
      isOpen={isOpen}
      onClose={onClose}
      targetType="comment"
      targetId={commentId}
      targetName={commentContent.substring(0, 50) + "..."} // ตัดข้อความมาแสดงสั้นๆ
      title="รายงานความคิดเห็น"
      reasons={COMMENT_REASONS}
      detailPlaceholder="เหตุผลที่รายงานความคิดเห็นนี้..."
    />
  );
}