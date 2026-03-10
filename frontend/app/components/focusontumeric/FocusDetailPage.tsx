"use client";

import ReportDialog from "../lib/ReportDialog";
import { useState } from "react";


interface Detail {
    src: string;
    name: string;
    author: string;
    description: string;
    reference: string;
    link: string;
}

export default function FocusDetailPage({ data }: { data: Detail }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className={`max-w-2xl mx-auto bg-white min-h-screen pb-10 ${isDialogOpen ? 'bg-red-50' : 'bg-white'}`}>
            <div className="w-full aspect-video overflow-hidden rounded-xl shadow-lg">
                <img
                    src={data.src}
                    alt={data.name}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="px-6 pt-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{data.name}</h1>
                    <p className="text-sm text-gray-400 pb-0 pt-2">By {data.author}</p>
                </div>
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="p-2 rounded-full w-15 h-15 cursor-pointer">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <line x1="32" y1="22" x2="35" y2="28" stroke="#E85D5D" strokeWidth="4" strokeLinecap="round" />
                        <line x1="23" y1="26" x2="31" y2="32" stroke="#E85D5D" strokeWidth="4" strokeLinecap="round" />
                        <line x1="20" y1="34" x2="27" y2="36" stroke="#E85D5D" strokeWidth="4" strokeLinecap="round" />

                        <path d="M 30 50 Q 30 30, 50 30 Q 70 30, 70 50 L 70 65 Q 70 70, 65 70 L 35 70 Q 30 70, 30 65 Z"
                            fill="#E85D5D" />

                        <rect x="25" y="72" width="50" height="6" rx="2" fill="#E85D5D" />
                    </svg>
                </button>
            </div>

            <div className="px-6 mt-4 space-y-6">
                <section className="bg-green-50/50 p-4 rounded-xl border border-gray-100 shadow-2xl">
                    <h3 className="font-bold text-gray-800 mb-2 border-l-4 border-[#BAF8A8] pl-2">รายละเอียด</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line  pb-20">
                        {data.description}
                    </p>
                </section>
                <section className="bg-green-50/50 p-4 rounded-xl border border-gray-100 shadow-2xl">
                    <h3 className="font-bold text-gray-800 mb-2 border-l-4 border-[#BAF8A8] pl-2">แหล่งข้อมูลอ้างอิง</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line pb-15">
                        {data.reference}
                        <a href={data.link} target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 underline hover:underline break-all"
                    >
                        {data.link}
                    </a>
                    </p>
                    
                </section>

            </div>

            <ReportDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />

        </div>
    );

}