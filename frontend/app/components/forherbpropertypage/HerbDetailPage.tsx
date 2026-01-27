"use client";

import { useState } from "react";
import ReportDialog from "../lib/ReportDialog";

interface HerbDetail {
    thaiName: string;
    engName: string;
    properties: string[];
    description: string;
    method: string[];
    warning: string;
    references: string[];
    src: string;
}

export default function HerbDetailPage({ data }: { data: HerbDetail }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className={`max-w-2xl mx-auto bg-white min-h-screen pb-10 ${isDialogOpen ? 'bg-red-50' : 'bg-white'}`}>
            <div className="w-full aspect-video overflow-hidden rounded-xl shadow-lg">
                <img
                    src={data.src}
                    alt={data.thaiName}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="px-6 pt-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{data.thaiName}</h1>
                    <p className="text-md text-gray-400 italic">{data.engName}</p>
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

            <div className="px-6 mt-6">
                <h3 className="text-black font-semibold border-l-4 border-[#BAF8A8] pl-2 mb-3">คุณสมบัติทางยา</h3>
                <div className="flex flex-wrap gap-2">
                    {data.properties.map((prop, index) => (
                        <span key={index} className="bg-[#D8F5D0] text-black border-2 border-[#A2F58B] px-1 py-0.5 rounded-md text-sm font-medium">
                            {prop}
                        </span>
                    ))}
                </div>
            </div>

            <div className="px-6 mt-4 space-y-6">
                <section className="bg-green-50/50 p-4 rounded-xl border border-gray-100 shadow-2xl">
                    <h3 className="font-bold text-gray-800 mb-2 border-l-4 border-[#BAF8A8] pl-2">รายละเอียด</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                        {data.description}
                    </p>
                </section>

                <section className="bg-green-50/50 p-4 rounded-xl border-l border-gray-100 shadow-2xl">
                    <h3 className="font-bold text-gray-800 mb-2 border-l-4 border-[#BAF8A8] pl-2">วิธีการใช้</h3>
                    <ul className="list-none space-y-2">
                        {data.method.map((item, index) => (
                            <li key={index} className="text-gray-600 text-sm leading-relaxed">{item}</li>
                        ))}
                    </ul>
                </section>

                <section className="bg-green-50/50 p-4 rounded-xl border border-gray-100 shadow-2xl">
                    <div className="flex">
                        <div className="w-5 h-5 mr-1">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <path d="M 50 10 L 85 80 Q 85 90, 75 90 L 25 90 Q 15 90, 15 80 L 50 10 Z"
                                    fill="#C4C936"
                                    stroke="#C4C936"
                                    strokeWidth="12"
                                    strokeLinejoin="round"
                                    strokeLinecap="round" />

                                <path d="M 50 22 L 78 78 Q 78 82, 74 82 L 26 82 Q 22 82, 22 78 L 50 22 Z"
                                    fill="white" />

                                <rect x="47" y="40" width="6" height="24" rx="3" fill="#C4C936" />

                                <circle cx="50" cy="72" r="3.5" fill="#C4C936" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-black mb-2 flex items-center gap-2">
                            คำเตือน
                        </h3>
                    </div>
                    <p className="text-black text-sm">
                        {data.warning}
                    </p>
                </section>

                <section className="bg-green-50/50 p-4 rounded-xl border-l border-gray-100 shadow-2xl">
                    <h3 className="font-bold text-gray-800 mb-2 border-l-4 border-[#BAF8A8] pl-2">
                        แหล่งข้อมูลอ้างอิง
                    </h3>
                    <ul className="list-none space-y-2">
                        {data.references.map((item, index) => (
                            <li key={index} className="text-black text-xs leading-relaxed flex items-start">
                                <span className="text-[14px]">{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

            </div>

            <ReportDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />

        </div>
    );
}



