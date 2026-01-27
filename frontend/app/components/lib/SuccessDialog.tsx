"use client"
// import { CheckCircle2 } from "lucide-react";
import { X } from "lucide-react";


interface SuccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SuccessDialog({ isOpen, onClose }: SuccessDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-15 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm transition-all">
            <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl animate-in zoom-in duration-300 text-center h-118 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-between">
                    <div className="flex justify-end w-full">
                        <button onClick={onClose} className="text-black cursor-pointer hover:text-black">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <h1 className="text-5xl font-bold text-green-500 mb-5 mt-10 -rotate-8 border-3 p-1.5">ACCEPTED</h1>
                    <p className="text-2xl text-gray-400 mb-14 mt-15 leading-relaxed">
                        ขอบคุณที่รายงานข้อผิดพลาด ทางเราจะทำการตรวจสอบให้เร็วที่สุดเท่าที่จะทำได้
                    </p>

                    <button
                        onClick={onClose}
                        className="w-30 py-2 bg-green-500 text-white font-bold rounded-xl active:scale-95 transition-all cursor-pointer shadow-lg hover:bg-green-800"
                    >
                        ยืนยัน
                    </button>
                </div>
            </div>
        </div>
    );
}