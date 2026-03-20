"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Mock data based on the screenshot
const mockArticles = [
  {
    id: 1,
    title: "ขมิ้นชัน สมุนไพรทองคำ บำรุงตับและลดการอักเสบ",
    tag: "สมุนไพรรักษาโรค",
    image: "/default_profile_picture.png",
    timestamp: "2 ชั่วโมงที่แล้ว",
  },
  {
    id: 2,
    title: "ฟ้าทะลายโจร ต้านหวัด ลดไข้ และเสริมภูมิคุ้มกัน",
    tag: "สมุนไพรรักษาโรค",
    image: "/default_profile_picture.png",
    timestamp: "2 ชั่วโมงที่แล้ว",
  },
  {
    id: 3,
    title: "ใบบัวบก ช่วยความจำ ลดรอยช้ำใน แก้ร้อนใน",
    tag: "สมุนไพรบำรุง",
    image: "/default_profile_picture.png",
    timestamp: "2 วันที่แล้ว",
  },
  {
    id: 4,
    title: "ว่านหางจระเข้ มอยส์เจอร์ไรเซอร์ธรรมชาติ รักษาแผลพุพอง",
    tag: "สมุนไพรบำรุง",
    image: "/default_profile_picture.png",
    timestamp: "2 วันที่แล้ว",
  },
  {
    id: 5,
    title: "ตะไคร้ หอมสดชื่น ขับลม แก้ท้องอืดท้องเฟ้อ",
    tag: "สมุนไพรบำรุง",
    image: "/default_profile_picture.png",
    timestamp: "1 ธ.ค. 2568",
  },
  {
    id: 6,
    title: "กระชายขาว ราชาสมุนไพร บำรุงร่างกายและกระดูก",
    tag: "สมุนไพรรักษาโรค",
    image: "/default_profile_picture.png",
    timestamp: "1 ธ.ค. 2568",
  }
];

export default function SavedArticlesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ทั้งหมด");

  const filters = ["ทั้งหมด", "สมุนไพรรักษาโรค", "สมุนไพรบำรุง"];

  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = article.title.includes(searchQuery);
    const matchesFilter = activeFilter === "ทั้งหมด" || article.tag === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-svh bg-white flex flex-col pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-6 sticky top-0 bg-white z-10">
        <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-2xl font-medium text-black">บทความที่บันทึก</h1>
      </div>

      <div className="px-5">
        {/* Search */}
        <div className="relative mb-5">
          <input
            type="text"
            placeholder="ค้นหาบทความ"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-6 pr-10 py-2.5 bg-white border border-gray-400 rounded-full text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-gray-800 placeholder-gray-400"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-black">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors cursor-pointer ${activeFilter === filter
                ? "border-gray-600 text-gray-800 font-medium"
                : "border-gray-400 text-gray-600 hover:border-gray-500"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Articles List */}
        <div className="flex flex-col gap-4 mt-2">
          {filteredArticles.map(article => (
            <div key={article.id} className="bg-[#EEFFE5] border border-[#d2eac5] rounded-xl overflow-hidden flex flex-col">
              <div className="p-3 flex gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white shrink-0 border border-green-100 flex items-center justify-center">
                  <img src={article.image} alt={article.title} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 flex flex-col justify-start pt-1">
                  <h3 className="text-sm font-medium text-gray-900 leading-snug pr-1">
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="bg-[#CFF3C5] text-black text-[11px] px-2.5 py-0.5 rounded-full border border-green-200">
                      {article.tag}
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      <button className="bg-[#71CE61] text-white text-[12px] px-3 py-1 rounded-md hover:bg-[#61b852] transition-colors flex items-center shadow-sm cursor-pointer">
                        View
                      </button>
                      <button className="bg-[#71CE61] text-white text-[12px] px-2.5 py-1 rounded-md hover:bg-[#61b852] transition-colors flex items-center gap-1 shadow-sm cursor-pointer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#e4F8D3] px-4 py-2 text-[12px] text-gray-500 border-t border-[#d2eac5]">
                {article.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
