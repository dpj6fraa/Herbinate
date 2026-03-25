"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "../components/Nav";
import CompareModal from "../components/CompareModal";

export type Herb = {
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
};

export default function ComparePage() {
    const router = useRouter();

    const [herbs, setHerbs] = useState<Herb[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("ทุกหมวดหมู่");

    const [selectedHerbs, setSelectedHerbs] = useState<string[]>([]);

    // Modal state
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetch("http://localhost:8080/api/herbs")
            .then((res) => res.json())
            .then((data) => {
                setHerbs(Array.isArray(data) ? data : data?.data || []);
            })
            .catch((err) => console.error("Error fetching herbs:", err))
            .finally(() => setLoading(false));
    }, []);

    const allTags = Array.from(new Set(herbs.flatMap(h => h.tags || [])));
    const filters = ["ทุกหมวดหมู่", ...allTags];

    const filteredHerbs = herbs.filter(herb => {
        const matchesSearch = herb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (herb.scientific_name && herb.scientific_name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = activeFilter === "ทุกหมวดหมู่" || (herb.tags && herb.tags.includes(activeFilter));
        return matchesSearch && matchesFilter;
    });

    const toggleSelection = (id: string) => {
        if (selectedHerbs.includes(id)) {
            setSelectedHerbs(selectedHerbs.filter(herbId => herbId !== id));
        } else {
            if (selectedHerbs.length < 3) {
                setSelectedHerbs([...selectedHerbs, id]);
            } else {
                // Optional: Can add toast/alert here if they select more than 3
            }
        }
    };

    const handleCompare = () => {
        if (selectedHerbs.length >= 2) {
            setShowModal(true);
        }
    };

    const comparedHerbs = herbs.filter(h => selectedHerbs.includes(h.id));

    return (
        <div className="min-h-svh bg-white flex flex-col relative pb-24 font-sans">
            <Nav />

            <div className="px-5 pt-6 max-w-2xl mx-auto w-full">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">เปรียบเทียบสมุนไพร</h1>
                    <p className="text-gray-500 text-xs sm:text-sm">เลือกสมุนไพรได้สูงสุด <span className="text-[#65B741] font-bold">3</span> ชนิด</p>
                </div>

                {/* Search */}
                <div className="relative mb-5">
                    <input
                        type="text"
                        placeholder="ค้นหาสมุนไพร..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-6 pr-10 py-2.5 bg-white border border-gray-400 rounded-full text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-gray-800 placeholder-gray-400"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-800">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-1.5 rounded-full text-[11px] sm:text-xs whitespace-nowrap border transition-colors flex items-center gap-1.5 shrink-0 ${activeFilter === filter
                                ? "border-gray-600 bg-gray-50 text-gray-900 font-medium"
                                : "border-gray-400 text-gray-600 hover:border-gray-500"
                                }`}
                        >
                            {filter === "ทุกหมวดหมู่" && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                </svg>
                            )}
                            {filter}
                        </button>
                    ))}
                </div>

                <p className="text-gray-700 text-xs mb-3 font-medium">เลือกสมุนไพรที่ต้องการเปรียบเทียบ</p>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="w-8 h-8 border-[3px] border-green-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 pb-4">
                        {filteredHerbs.map(herb => {
                            const isSelected = selectedHerbs.includes(herb.id);
                            const isDisabled = !isSelected && selectedHerbs.length >= 3;

                            const imgUrl = herb.image_url
                                ? (herb.image_url.startsWith('http') ? herb.image_url : `http://localhost:8080${herb.image_url}`)
                                : "/placeholder.png";

                            return (
                                <div
                                    key={herb.id}
                                    onClick={() => !isDisabled && toggleSelection(herb.id)}
                                    className={`flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-200 border relative ${isSelected
                                        ? "border-[#65B741] bg-[#F4FCF0] shadow-md ring-1 ring-[#65B741] transform scale-[0.98]"
                                        : isDisabled
                                            ? "border-transparent opacity-55 cursor-not-allowed"
                                            : "border-transparent shadow-sm hover:shadow-md cursor-pointer"
                                        }`}
                                    style={{ boxShadow: isSelected ? "none" : "0 1px 4px rgba(0,0,0,0.08)" }}
                                >
                                    <div className="w-full aspect-video sm:aspect-[4/3] bg-gray-100 relative">
                                        <img
                                            src={imgUrl}
                                            alt={herb.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-[#65B741]/20 flex items-center justify-center">
                                                <div className="bg-[#65B741] text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg transform scale-100 animate-in zoom-in duration-200">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 sm:p-3 text-center flex flex-col items-center flex-1 h-full justify-between">
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-0.5 line-clamp-1">{herb.name}</h3>
                                            <p className="text-[9px] sm:text-[10px] text-gray-400 italic mb-1.5 line-clamp-1">{herb.scientific_name}</p>
                                        </div>
                                        {herb.tags && herb.tags.length > 0 && (
                                            <p className="text-[10px] sm:text-[11px] text-gray-700 font-medium line-clamp-1 px-1">{herb.tags[0]}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            {selectedHerbs.length > 0 && (
                <div className="fixed bottom-8 right-6 z-40 transform transition-all duration-300 animate-in slide-in-from-bottom-5">
                    <button
                        onClick={handleCompare}
                        disabled={selectedHerbs.length < 2}
                        className={`shadow-lg rounded-xl px-5 py-3 font-bold text-sm sm:text-base flex items-center gap-2 transition-all ${selectedHerbs.length >= 2
                            ? "bg-[#65B741] text-white hover:bg-[#529e32] active:scale-95"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        เปรียบเทียบ ({selectedHerbs.length})
                    </button>
                </div>
            )}

            {/* Modal */}
            <CompareModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                comparedHerbs={comparedHerbs}
            />
        </div>
    );
}
