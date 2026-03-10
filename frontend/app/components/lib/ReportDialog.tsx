"use client"
import { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import SuccessDialog from "./SuccessDialog";

export default function ReportDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const router = useRouter();
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [reportItem, setReportItem] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const reasons = ["ข้อมูลทางการแพทย์ผิด", "เนื้อหาไม่เหมาะสม", "อื่นๆ"];

    if (!isOpen && !showSuccess) return null;

    const handleSubmit = () => {
        if (!selectedReason || !reportItem.trim()) {
            return;
        }
        setShowSuccess(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-xs transition-all">
            <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div className="w-6" />
                    <h2 className="text-lg font-bold text-red-500">รายงานโพสต์</h2>
                    <button onClick={onClose} className="text-black cursor-pointer hover:text-black">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4 text-left">
                    <div className="flex flex-col bg-white border-2 border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-red-100 transition-all">
                        <label className="text-[10px] text-gray-500 font-semibold px-1 cursor-text">
                            สิ่งที่รายงาน :
                        </label>
                        <input
                            type="text"
                            value={reportItem}
                            onChange={(e) => setReportItem(e.target.value)}
                            placeholder="ระบุชื่อสมุนไพรหรือโพสต์ที่ต้องการรายงาน"
                            className="w-full rounded-xl text-[10px] text-gray-600 outline-none px-1 bg-transparent"
                        />
                    </div>

                    <div className="mb-0">
                        <label className="text-[10px] text-gray-500 block my-2 font-semibold">เหตุผลที่คุณรายงานโพสต์นี้:</label>
                        <div className="space-y-2 mb-0">
                            {reasons.map((reason) => (
                                <button
                                    key={reason}
                                    className={`w-full py-3 px-6 border-2 rounded-lg font-bold text-[11px] text-start transition-all cursor-pointer 
                                        ${selectedReason === reason
                                            ? 'bg-red-500 border-red-600 text-white shadow-md'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-red-50'
                                        }`}
                                    onClick={() => setSelectedReason(reason)}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-0">
                        <label className="text-xs text-gray-500 block my-2 font-medium">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
                        <textarea
                            placeholder="ระบุข้อมูลเพิ่มเติม..."
                            className="w-full bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-[10px] text-gray-500 h-15 resize-none outline-none placeholder:text-gray-300"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmit}
                            className="w-30 py-2 bg-[#E74A4A] text-[12px] text-white font-bold rounded-md active:scale-95 transition-all mt-2 cursor-pointer shadow-lg hover:bg-red-600"
                        >
                            ส่งรายงาน
                        </button>
                    </div>
                </div>
            </div>
            <SuccessDialog
                isOpen={showSuccess}
                onClose={() => {
                    setShowSuccess(false);
                    onClose();
                }}
            />
        </div>



    );
}