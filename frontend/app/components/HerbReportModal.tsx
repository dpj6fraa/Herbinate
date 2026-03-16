"use client";

// components/HerbReportModal.tsx
import BaseReportModal from "./BaseReportModal";

const HERB_REASONS = [
  "ข้อมูลสรรพคุณไม่ถูกต้อง",
  "วิธีใช้หรือขนาดยาผิดพลาด",
  "คำเตือนด้านสุขภาพไม่ครบถ้วน",
  "ข้อมูลซ้ำกับรายการอื่น",
  "เนื้อหาไม่เหมาะสม",
  "อื่นๆ",
];

interface HerbReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  herbId: string;
  herbName: string;
}

export default function HerbReportModal({
  isOpen,
  onClose,
  herbId,
  herbName,
}: HerbReportModalProps) {
  return (
    <BaseReportModal
      isOpen={isOpen}
      onClose={onClose}
      targetType="herb"
      targetId={herbId}
      targetName={herbName}
      title="รายงานข้อมูลสมุนไพร"
      reasons={HERB_REASONS}
      detailPlaceholder="เช่น สรรพคุณข้อใดที่ไม่ถูกต้อง หรือวิธีใช้ที่ผิดพลาด..."
    />
  );
}