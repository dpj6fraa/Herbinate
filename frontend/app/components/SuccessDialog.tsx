"use client";

import { useEffect } from "react";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function SuccessDialog({
  isOpen,
  onClose,
  title = "ส่งรายงานเรียบร้อย",
  message = "ทีมงานจะตรวจสอบและดำเนินการโดยเร็วที่สุด ขอบคุณที่ช่วยดูแลชุมชน",
}: SuccessDialogProps) {
  // ปิดอัตโนมัติหลัง 3 วินาที
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xs rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 text-center">

        {/* ไอคอน checkmark */}
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-green-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 active:scale-95 transition-all cursor-pointer"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}