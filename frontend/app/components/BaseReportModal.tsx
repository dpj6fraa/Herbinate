"use client";

// components/BaseReportModal.tsx
// Component กลางที่ทั้ง 3 modal ใช้ร่วมกัน
// ไม่ export ออกไปใช้ตรงๆ — ใช้ผ่าน HerbReportModal / ArticleReportModal / CommunityReportModal

import { useState } from "react";
import { X } from "lucide-react";
import { useReport, TargetType, ReportPayload } from "./hooks/useReport";
import SuccessDialog from "../components/SuccessDialog";

interface BaseReportModalProps {
  isOpen: boolean;
  onClose: () => void;

  // ข้อมูล target
  targetType: TargetType;
  targetId: string;
  targetName: string;

  // UI
  title: string;          // หัวข้อ modal เช่น "รายงานข้อมูลสมุนไพร"
  reasons: string[];       // เหตุผลที่แสดงใน modal (แต่ละ type ต่างกัน)
  detailPlaceholder?: string;
}

export default function BaseReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  title,
  reasons,
  detailPlaceholder = "อธิบายปัญหาที่พบเพิ่มเติม...",
}: BaseReportModalProps) {
  const { submitReport } = useReport();

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen && !showSuccess) return null;

  const canSubmit = !!selectedReason && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError("");
    setLoading(true);

    const payload: ReportPayload = {
      target_type: targetType,
      target_id: targetId,
      target_name: targetName,
      reason: selectedReason!,
      detail,
    };

    const result = await submitReport(payload);
    setLoading(false);

    if (result.ok) {
      setShowSuccess(true);
    } else {
      setError(result.message);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDetail("");
    setError("");
    setLoading(false);
    setShowSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-red-50 px-6 py-4 flex justify-between items-center border-b border-red-100">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h13l-4 4 4 4H3" />
            </svg>
            <h2 className="text-base font-bold text-red-500">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* ชื่อ target — read-only */}
          {targetName && (
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <p className="text-[10px] text-gray-400 font-semibold mb-0.5">เนื้อหาที่รายงาน</p>
              <p className="text-sm text-gray-700 font-medium line-clamp-2">{targetName}</p>
            </div>
          )}

          {/* เหตุผล */}
          <div>
            <label className="text-[11px] text-gray-500 font-semibold block mb-2">
              เหตุผลที่รายงาน <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {reasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full py-2.5 px-4 border-2 rounded-xl text-xs font-semibold text-start transition-all cursor-pointer
                    ${selectedReason === reason
                      ? "bg-red-500 border-red-500 text-white"
                      : "bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50"
                    }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* รายละเอียดเพิ่มเติม */}
          <div>
            <label className="text-[11px] text-gray-500 font-semibold block mb-1.5">
              รายละเอียดเพิ่มเติม{" "}
              <span className="text-gray-300 font-normal">(ถ้ามี)</span>
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={detailPlaceholder}
              rows={3}
              className="w-full bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 resize-none outline-none placeholder:text-gray-300 focus:border-red-200 transition-colors"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 py-2.5 bg-red-500 rounded-xl text-xs font-bold text-white
                hover:bg-red-600 active:scale-95 transition-all cursor-pointer
                disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? "กำลังส่ง..." : "ส่งรายงาน"}
            </button>
          </div>
        </div>
      </div>

      <SuccessDialog isOpen={showSuccess} onClose={handleClose} />
    </div>
  );
}