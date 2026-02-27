import React from "react";
import { X, Camera, Video, Image as ImageIcon, Smile } from "lucide-react";

type CreatePostModalProps = {
    modalType: "create" | "edit";
    onClose: () => void;
};

export default function CreatePostModal({ modalType, onClose }: CreatePostModalProps) {
    return (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[14px] w-full max-w-sm flex flex-col shadow-2xl relative overflow-hidden ring-2 ring-purple-400">

                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                    <div className="font-bold text-lg text-green-600 text-center w-full">
                        {modalType === "create" ? "สร้างโพสต์ใหม่" : "แก้ไขโพสต์ของคุณ"}
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute right-4 text-black hover:bg-gray-100 rounded-full p-1"
                    >
                        <X className="w-6 h-6 stroke-[2.5]" />
                    </button>
                </div>

                <div className="p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-[14px] font-medium text-gray-600 whitespace-nowrap">หัวข้อ :</label>
                        <input
                            type="text"
                            placeholder={modalType === "create" ? "เพิ่มหัวข้อของคุณ ..." : "ประโยชน์ของชาคาโมมายล์ต่อการนอน"}
                            className="border border-gray-300 rounded-md px-3 py-1.5 flex-1 text-sm outline-none text-gray-800"
                            defaultValue={modalType === "edit" ? "ประโยชน์ของชาคาโมมายล์ต่อการนอน" : ""}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[14px] font-medium text-gray-600 mb-1">เนื้อหา :</label>
                        <textarea
                            rows={8}
                            placeholder="เพิ่มเนื้อหาของคุณ ..."
                            className="border border-gray-300 rounded-md w-full p-3 text-sm outline-none resize-none text-gray-800 leading-relaxed"
                            defaultValue={modalType === "edit" ? "แค่อยากมา" : ""}
                        ></textarea>
                    </div>
                </div>

                <div className="px-4 pb-4 pt-2 flex justify-between items-center">
                    <span className="text-[13px] text-gray-400 font-medium">
                        จำนวน {modalType === "edit" ? "3" : "0"} คำ
                    </span>

                    <div className="flex items-center gap-2 sm:gap-3 text-gray-800">
                        <button><Camera className="w-5 h-5" /></button>
                        <button><Video className="w-5 h-5" /></button>
                        <button><ImageIcon className="w-5 h-5" /></button>
                        <button><Smile className="w-5 h-5" /></button>
                        <button
                            onClick={onClose}
                            className="ml-2 bg-[#6BB75B] text-white px-4 py-1.5 rounded-md font-bold text-[14px] shadow-sm tracking-wide"
                        >
                            {modalType === "edit" ? "บันทึก" : "โพสต์"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
