"use client"
import { useState } from "react";
import { X } from "lucide-react";

interface ReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    // herbName: string;     
}

export default function ReportDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    if (!isOpen) return null;
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const reasons = ["ข้อมูลทางการแพทย์ผิด", "เนื้อหาไม่เหมาะสม", "อื่นๆ"];

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
                    <div className="flex flex-col bg-white border-2 border-gray-300 rounded-l p-2 focus-within:ring-2 focus-within:ring-gray-100 transition-all mb-0">
                        <label className="text-[10px] text-gray-500 font-semibold px-1 cursor-text">
                            สิ่งที่รายงาน :
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-xl text-[10px] text-gray-500 outline-none px-1"
                        />
                    </div>

                    <div className="mb-0">
                        <label className="text-[10px] text-gray-500 block my-2 font-semibold">เหตุผลที่คุณรายงานโพสต์นี้:</label>
                        <div className="space-y-2 mb-0">
                            {reasons.map((reason, index) => (
                                <button
                                    key={reason}
                                    className={`w-full py-3 px-4 border-2 rounded-l font-bold text-[11px] text-start transition-all cursor-pointer 
                                        ${selectedReason === reason
                                            ? 'bg-red-500 border-red-600 shadow-md'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-red-50 hover:border-red-500'
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
                            placeholder="ระบุข้อมูลเพิ่มเติมเพื่อให้เราเข้าใจปัญหานี้..."
                            className="w-full bg-white border-2 border-gray-300 rounded-l px-3 py-2 text-[10px] text-gray-500 h-15 resize-none outline-none placeholder:text-gray-500"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button className="w-30 py-2 bg-[#E74A4A] text-[12px] text-white font-bold rounded-md active:scale-95 transition-all mt-2 cursor-pointer">
                            ส่งรายงาน
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}