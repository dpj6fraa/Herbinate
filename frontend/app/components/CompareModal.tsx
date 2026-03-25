import React from 'react';
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
    if (!isOpen) return null;

    const getSectionContent = (herb: Herb, keyword: string) => {
        const section = herb.sections?.find(s => s.title.includes(keyword));
        if (!section || !section.content) return "-";

        if (keyword === 'สรรพคุณ' || keyword === 'ประโยชน์') {
            const parts = section.content.split(/[, ]+/).filter(p => p.trim() !== "");
            return (
                <div className="flex flex-col gap-1 text-[11px] sm:text-xs">
                    {parts.map((p, i) => (
                        <span key={i}>{p}</span>
                    ))}
                </div>
            );
        }

        return <p className="text-[11px] sm:text-xs leading-relaxed max-w-[200px]">{section.content}</p>;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
            <div className="w-full max-w-4xl bg-[#F5FAF2] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="bg-[#5CA632] text-white px-5 py-3 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold">ตารางเปรียบเทียบ</h2>
                    <button
                        onClick={onClose}
                        className="bg-white text-black p-1 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center w-6 h-6"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Modal Body / Table */}
                <div className="overflow-y-auto p-2 sm:p-5">
                    <div className="w-full min-w-[600px]">
                        <table className="w-full border-collapse table-fixed">
                            <tbody>
                                {/* Header Row: Images + Names */}
                                <tr className="border-b border-gray-200/50">
                                    <td className="w-[140px] sm:w-[180px] p-3 pl-4 sm:pl-6 text-sm font-bold text-gray-900 align-middle">
                                        รายการ
                                    </td>
                                    {comparedHerbs.map(herb => {
                                        const imgUrl = herb.image_url
                                            ? (herb.image_url.startsWith('http') ? herb.image_url : `http://localhost:8080${herb.image_url}`)
                                            : "/placeholder.png";

                                        return (
                                            <td key={herb.id} className="p-3 text-center align-top">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded shadow overflow-hidden bg-white">
                                                        <img src={imgUrl} alt={herb.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="font-bold text-gray-800 text-sm sm:text-base">{herb.name}</div>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>

                                {/* Properties Row */}
                                <tr className="border-b border-gray-200/50">
                                    <td className="w-[140px] sm:w-[180px] p-3 pl-4 sm:pl-6 text-sm font-bold text-gray-900 align-top">
                                        สรรพคุณ
                                    </td>
                                    {comparedHerbs.map(herb => (
                                        <td key={herb.id} className="p-3 align-top text-gray-700">
                                            {getSectionContent(herb, 'สรรพคุณ')}
                                        </td>
                                    ))}
                                </tr>

                                {/* Benefits Row */}
                                <tr className="border-b border-gray-200/50">
                                    <td className="w-[140px] sm:w-[180px] p-3 pl-4 sm:pl-6 text-sm font-bold text-gray-900 align-top">
                                        ประโยชน์
                                    </td>
                                    {comparedHerbs.map(herb => (
                                        <td key={herb.id} className="p-3 align-top text-gray-700">
                                            {getSectionContent(herb, 'ประโยชน์')}
                                        </td>
                                    ))}
                                </tr>

                                {/* How to use Row */}
                                <tr className="border-b border-gray-200/50">
                                    <td className="w-[140px] sm:w-[180px] p-3 pl-4 sm:pl-6 text-sm font-bold text-gray-900 align-top">
                                        วิธีบริโภค
                                    </td>
                                    {comparedHerbs.map(herb => (
                                        <td key={herb.id} className="p-3 align-top text-gray-700">
                                            {getSectionContent(herb, 'วิธี')}
                                        </td>
                                    ))}
                                </tr>

                                {/* Precautions Row */}
                                <tr>
                                    <td className="w-[140px] sm:w-[180px] p-3 pl-4 sm:pl-6 text-sm font-bold text-gray-900 align-top">
                                        ข้อควรระวัง
                                    </td>
                                    {comparedHerbs.map(herb => (
                                        <td key={herb.id} className="p-3 align-top text-gray-700">
                                            {getSectionContent(herb, 'ระวัง')}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
