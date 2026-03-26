import React, { useState } from "react";
import { X } from "lucide-react";

type ReportPostModalProps = {
    onClose: () => void;
    postTitle: string | undefined;
};

export default function ReportPostModal({ onClose, postTitle }: ReportPostModalProps) {
    const [reportReason, setReportReason] = useState<string>("ข้อมูลทางการแพทย์ที่บิดเบือน / ไม่ถูกต้อง");

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[14px] w-full max-w-sm flex flex-col shadow-2xl relative overflow-hidden">

                <div className="flex justify-between items-center px-4 py-4 pt-5">
                    <div className="font-bold text-[18px] text-[#EB5757] text-center w-full">
                        รายงานโพสต์
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-5 text-black hover:bg-gray-100 rounded-full p-1"
                    >
                        <X className="w-6 h-6 stroke-[3]" />
                    </button>
                </div>

                <div className="px-4 pb-5 flex flex-col gap-3">

                    {/* Topic info */}
                    <div className="flex flex-col mt-2">
                        <label className="text-[13px] text-gray-500 font-medium mb-1">หัวข้อโพสต์ :</label>
                        <input
                            type="text"
                            readOnly
                            value={postTitle || "ประโยชน์ของชาคาโมมายล์ต่อการนอน"}
                            className="border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-500 bg-white cursor-not-allowed outline-none"
                        />
                    </div>

                    <label className="text-[13px] text-gray-500 font-medium mt-1">
                        ทำไมคุณถึงรายงานโพสต์นี้ :
                    </label>

                    <div className="flex flex-col gap-2 mt-1">
                        {[
                            "ข้อมูลทางการแพทย์ที่บิดเบือน / ไม่ถูกต้อง",
                            "เนื้อหาเป็นการคุกคาม หรือการกลั่นแกล้ง",
                            "เนื้อหาที่ไม่เหมาะสม",
                            "เนื้อหานอกประเด็น / ไม่เกี่ยวข้องกับหัวข้อ",
                            "อื่น ๆ"
                        ].map(option => {
                            const isSelected = reportReason === option;
                            return (
                                <label
                                    key={option}
                                    className={`border rounded-md px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${isSelected ? 'border-red-400 bg-[#FFF5F5]' : 'border-gray-200'
                                        }`}
                                    onClick={() => setReportReason(option)}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-black bg-black' : 'border-gray-400'
                                        }`}>
                                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                    </div>
                                    <span className={`text-[13px] font-bold ${isSelected ? 'text-black' : 'text-gray-500'}`}>
                                        {option}
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    <div className="flex flex-col mt-1">
                        <label className="text-[13px] text-gray-500 font-medium mb-1 truncate">
                            รายละเอียดเพิ่มเติม (ไม่บังคับ)
                        </label>
                        <textarea
                            rows={2}
                            placeholder="ให้เนื้อหาเพิ่มเติมเพื่อช่วยให้เราเข้าใจปัญหานี้ ..."
                            className="border border-gray-200 rounded-md p-3 text-sm outline-none resize-none text-gray-800 placeholder-gray-400"
                        ></textarea>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-[100px] mt-3 self-end bg-[#EB5757] text-white px-5 py-2.5 rounded-md font-bold text-sm shadow-sm whitespace-nowrap"
                    >
                        ส่งรายงาน
                    </button>

                </div>
            </div>
        </div>
    );
}
