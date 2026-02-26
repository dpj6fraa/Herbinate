"use client";

// components/ArticleReportModal.tsx
import BaseReportModal from "./BaseReportModal";

const ARTICLE_REASONS = [
  "ข้อมูลทางการแพทย์ไม่ถูกต้อง",
  "เนื้อหาเป็นข้อมูลเท็จหรือเข้าใจผิด",
  "ละเมิดลิขสิทธิ์หรือคัดลอกเนื้อหา",
  "เนื้อหาไม่เหมาะสม",
  "โฆษณาแฝงหรือชักชวนซื้อสินค้า",
  "อื่นๆ",
];

interface ArticleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  articleTitle: string;
}

export default function ArticleReportModal({
  isOpen,
  onClose,
  articleId,
  articleTitle,
}: ArticleReportModalProps) {
  return (
    <BaseReportModal
      isOpen={isOpen}
      onClose={onClose}
      targetType="article"
      targetId={articleId}
      targetName={articleTitle}
      title="รายงานบทความ"
      reasons={ARTICLE_REASONS}
      detailPlaceholder="เช่น ระบุย่อหน้าหรือข้อมูลที่ไม่ถูกต้อง..."
    />
  );
}