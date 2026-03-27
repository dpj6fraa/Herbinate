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
    const sharedTags = useMemo(() => {
        const tagCounts: Record<string, number> = {};
        comparedHerbs.forEach(herb => {
            herb.tags?.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        return Object.keys(tagCounts).filter(tag => tagCounts[tag] > 1);
    }, [comparedHerbs]);

    if (!isOpen) return null;

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

    const getSectionContent = (herb: Herb, keyword: string) => {
        const section = herb.sections?.find(s => s.title.includes(keyword));
        if (!section?.content) return <span className="text-gray-300 text-sm">-</span>;
        return (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {section.content}
            </p>
        );
    };

    const rows = [
        { label: 'ประโยชน์', keyword: 'ประโ', danger: false },
        { label: 'วิธีใช้',   keyword: 'วิธี', danger: false },
        { label: 'ข้อควรระวัง', keyword: 'ข้อค', danger: true  },
    ];

    const colCount = comparedHerbs.length;
    const gridCols = colCount === 2 ? 'grid-cols-2' : 'grid-cols-3';

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
            {/*
             * บนมือถือ: sheet ขึ้นมาจากล่าง (items-end + rounded-t-2xl)
             * บน sm ขึ้นไป: modal กลางจอเหมือนเดิม (items-center + rounded-2xl)
             */}
            <div className="w-full max-w-3xl bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-[#65B741] text-white px-5 py-4 flex justify-between items-center shrink-0 rounded-t-2xl">
                    <div className="flex items-center gap-2.5">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                            <line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                        <h2 className="text-base font-bold">เปรียบเทียบสมุนไพร</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-white/10 text-white p-1.5 rounded-full hover:bg-white hover:text-[#5CA632] transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                {/* Body — scroll แนวตั้งเพียงอย่างเดียว */}
                <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-3 bg-[#FBFDFB]">

                    {/* Herb header cards */}
                    <div className={`grid ${gridCols} gap-2`}>
                        {comparedHerbs.map(herb => {
                            const imgUrl = herb.image_url?.startsWith('http')
                                ? herb.image_url
                                : `${BASE_URL}${herb.image_url}`;
                            return (
                                <div key={herb.id} className="bg-white border border-green-100 rounded-xl p-3 flex flex-col items-center text-center gap-2 shadow-sm">
                                    <img
                                        src={imgUrl || '/placeholder.png'}
                                        alt={herb.name}
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-green-50"
                                    />
                                    <div>
                                        <p className="font-bold text-sm sm:text-base text-gray-900 leading-tight">{herb.name}</p>
                                        {herb.scientific_name && (
                                            <p className="text-[11px] text-gray-400 italic mt-0.5">{herb.scientific_name}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* สรรพคุณ */}
                    <div className="bg-white border border-green-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-[#F4FCF0] px-4 py-2.5 border-b border-green-100">
                            <p className="text-sm font-bold text-[#3A7D22]">สรรพคุณ</p>
                        </div>
                        <div className={`grid ${gridCols} divide-x divide-gray-100 items-start`}>
                            {comparedHerbs.map(herb => (
                                <div key={herb.id} className="p-3 flex flex-wrap gap-1">
                                    {herb.tags?.length ? herb.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium border
                                                ${sharedTags.includes(tag)
                                                    ? 'bg-[#FEF9C3] text-[#854D0E] border-[#FDE047]'
                                                    : 'bg-[#E1F7DB] text-[#1C7D29] border-[#71CE61]'
                                                }`}
                                        >
                                            {tag}
                                        </span>
                                    )) : <span className="text-gray-300 text-sm">-</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ประโยชน์ / วิธีใช้ / ข้อควรระวัง */}
                    {rows.map(({ label, keyword, danger }) => (
                        <div key={label} className="bg-white border border-green-100 rounded-xl overflow-hidden shadow-sm">
                            <div className={`px-4 py-2.5 border-b ${danger ? 'bg-[#FFF5F5] border-red-100' : 'bg-[#F4FCF0] border-green-100'}`}>
                                <p className={`text-sm font-bold ${danger ? 'text-[#D04A4A]' : 'text-[#3A7D22]'}`}>{label}</p>
                            </div>
                            <div className={`grid ${gridCols} divide-x divide-gray-100`}>
                                {comparedHerbs.map(herb => (
                                    <div key={herb.id} className="p-3">
                                        {getSectionContent(herb, keyword)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 shrink-0 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-full hover:bg-gray-300 transition-colors"
                    >
                        ปิดหน้าต่าง
                    </button>
                </div>
            </div>
        </div>
    );
}