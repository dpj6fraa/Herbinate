import React, { useMemo } from 'react';

export interface Herb {
    id: string;
    name: string;
    scientific_name: string;
    description: string;
    image_url: string;
    tags: string[];
    sections?: {
        title: string;
        content: string;
        position: number;
    }[];
}

interface CompareModalProps {
    isOpen: boolean;
    onClose: () => void;
    comparedHerbs: Herb[];
}

export default function CompareModal({ isOpen, onClose, comparedHerbs }: CompareModalProps) {
    // 1. คำนวณหา Tag ที่ซ้ำกัน (มีมากกว่า 1 ตัว) โดยใช้ useMemo เพื่อประสิทธิภาพ
    const sharedTags = useMemo(() => {
        const tagCounts: Record<string, number> = {};
        comparedHerbs.forEach(herb => {
            herb.tags?.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        
        // คืนค่าเฉพาะ Tag ที่ปรากฏในสมุนไพรตั้งแต่ 2 ชนิดขึ้นไป
        return Object.keys(tagCounts).filter(tag => tagCounts[tag] > 1);
    }, [comparedHerbs]);

    if (!isOpen) return null;

    const getSectionContent = (herb: Herb, keyword: string) => {
        const section = herb.sections?.find(s => s.title.includes(keyword));
        if (!section || !section.content) return <span className="text-gray-300">-</span>;

        return (
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {section.content}
            </div>
        );
    };

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm font-sans">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-[#65B741] to-[#5CA632] text-white px-6 py-4 flex justify-between items-center shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold tracking-wide">เปรียบเทียบสมุนไพร</h2>
                    </div>
                    <button onClick={onClose} className="bg-white/10 text-white p-1.5 rounded-full hover:bg-white hover:text-[#5CA632] transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-auto w-full p-4 sm:p-6 bg-[#FBFDFB]">
                    <div className="w-full min-w-[700px] bg-white border border-green-100 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full border-collapse table-fixed">
                            <tbody>
                                {/* 1. Header Row */}
                                <tr className="border-b-2 border-green-100 bg-white">
                                    <td className="w-[140px] sm:w-[160px] px-4 pt-8 pb-5 font-bold text-[#3A7D22] align-top bg-[#F4FCF0] border-r border-green-100 text-left text-sm sm:text-base">
                                        สมุนไพร
                                    </td>
                                    {comparedHerbs.map((herb, index) => {
                                        const imgUrl = herb.image_url?.startsWith('http') ? herb.image_url : `${BASE_URL}${herb.image_url}`;
                                        return (
                                            <td key={herb.id} className={`px-5 pt-8 pb-5 text-center align-top ${index !== comparedHerbs.length - 1 ? 'border-r border-gray-100' : ''}`}>
                                                <div className="flex flex-col items-center gap-3">
                                                    <img src={imgUrl || "/placeholder.png"} alt={herb.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shadow-sm border-2 border-green-50 object-cover" />
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-base sm:text-lg">{herb.name}</div>
                                                        <div className="text-xs text-gray-400 italic">{herb.scientific_name || "-"}</div>
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>

                                {/* 2. Properties (Tags) - Highlighting Shared Tags */}
                                <tr className="border-b border-gray-100 hover:bg-green-50/30 transition-colors">
                                    <td className="w-[140px] sm:w-[160px] p-4 sm:p-5 text-sm sm:text-base font-bold text-[#3A7D22] align-top bg-[#F4FCF0] border-r border-green-100 text-left">
                                        สรรพคุณ
                                    </td>
                                    {comparedHerbs.map((herb, index) => (
                                        <td key={herb.id} className={`p-4 sm:p-5 align-top ${index !== comparedHerbs.length - 1 ? 'border-r border-gray-100' : ''}`}>
                                            {herb.tags && herb.tags.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {herb.tags.map((tag, i) => {
                                                        const isShared = sharedTags.includes(tag);
                                                        return (
                                                            <span 
                                                                key={i} 
                                                                className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition-all
                                                                    ${isShared 
                                                                        ? "bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047] shadow-sm scale-105" 
                                                                        : "bg-[#E1F7DB] text-[#1C7D29] border border-[#71CE61]"
                                                                    }`}
                                                            >
                                                                {tag}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            ) : <span className="text-gray-300">-</span>}
                                        </td>
                                    ))}
                                </tr>

                                {/* 3-5 Rows */}
                                {['ประโยชน์', 'วิธีใช้', 'ข้อควรระวัง'].map((label, rowIdx) => (
                                    <tr key={label} className={`border-b border-gray-100 hover:bg-green-50/30 transition-colors ${label === 'ข้อควรระวัง' ? 'bg-red-50/10' : ''}`}>
                                        <td className={`w-[140px] sm:w-[160px] p-4 sm:p-5 text-sm sm:text-base font-bold align-top border-r border-green-100 text-left 
                                            ${label === 'ข้อควรระวัง' ? 'text-[#D04A4A] bg-[#FFF5F5] border-red-100' : 'text-[#3A7D22] bg-[#F4FCF0]'}`}>
                                            {label}
                                        </td>
                                        {comparedHerbs.map((herb, index) => (
                                            <td key={herb.id} className={`p-4 sm:p-5 align-top ${index !== comparedHerbs.length - 1 ? 'border-r border-gray-100' : ''}`}>
                                                {getSectionContent(herb, label.substring(0, 3))}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-gray-50 border-t border-gray-100 p-4 shrink-0 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors">
                        ปิดหน้าต่าง
                    </button>
                </div>
            </div>
        </div>
    );
}