"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Nav from "../../components/Nav"; // ปรับ Path ให้ตรงกับโปรเจกต์คุณ
import Footer from "../../components/Footer"; // ปรับ Path ให้ตรงกับโปรเจกต์คุณ

interface Herb {
  id: string;
  name: string;
  scientific_name: string;
  tags: string[];
  image_url: string;
}

export default function SavedHerbsPage() {
  const router = useRouter();
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [loading, setLoading] = useState(true);

  // States สำหรับ Search & Tags
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // เรียก API ดึงสมุนไพรที่บุ๊กมาร์กไว้
    fetch("http://localhost:8080/api/herbs/bookmarks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("failed to fetch bookmarked herbs");
        return res.json();
      })
      .then((data) => {
        setHerbs(data || []);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setLoading(false));
  }, [router]);

  // 1. ดึง Tags ทั้งหมดแบบไม่ซ้ำกัน
  const allTags = Array.from(new Set(herbs.flatMap(h => h.tags || [])));

  // 2. หาสรรพคุณ/แท็ก ที่ตรงกับคำที่กำลังพิมพ์
  const matchingTags = allTags.filter(tag =>
    searchQuery &&
    tag.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTags.includes(tag)
  );

  // ปิด Dropdown เมื่อคลิกที่อื่น
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setSearchQuery("");
    setIsTagDropdownOpen(false);
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // 🌟 ฟังก์ชันลบออกจากบุ๊กมาร์ก (Toggle Bookmark)
  const handleRemoveBookmark = async (e: React.MouseEvent, herbId: string) => {
    e.stopPropagation(); // ป้องกันไม่ให้คลิกแล้วเด้งไปหน้าเนื้อหาสมุนไพร
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8080/api/herbs/${herbId}/bookmark`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        // อัปเดต UI ทันทีโดยกรองตัวที่ถูกลบออกไป
        setHerbs(prev => prev.filter(h => h.id !== herbId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. ฟังก์ชันกรองข้อมูลสมุนไพร (Filter)
  const filteredHerbs = herbs.filter(herb => {
    const matchesSearch =
      searchQuery === "" ||
      herb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (herb.scientific_name && herb.scientific_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTags = selectedTags.length === 0 || selectedTags.every(t => herb.tags && herb.tags.includes(t));

    return matchesSearch && matchesTags;
  });

  return (
    <main className="min-h-screen flex flex-col bg-white pt-4 md:w-full">
      <Nav />

      <div className="flex-1 flex flex-col pt-4 lg:items-center w-full pb-10">
        <div className="flex flex-col items-center justify-center px-4 md:px-6 w-full max-w-4xl">

          {/* Header */}
          <div className="flex items-center justify-start w-full gap-3 mb-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-[20px] md:text-[24px] text-black font-bold">สมุนไพรที่บันทึก</h1>
          </div>

          {/* 🌟 ก้อนค้นหาอัจฉริยะ (Smart Search Box) */}
          <div className="relative w-full mt-2" ref={dropdownRef}>
            <div className={`flex flex-wrap items-center gap-2 w-full min-h-[48px] p-2 rounded-2xl md:rounded-full bg-white border-2 transition-colors shadow-sm ${isTagDropdownOpen ? 'border-[#71CE61]' : 'border-gray-200 focus-within:border-[#71CE61]'}`}>
              <span className="text-gray-400 pl-2 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>

              {selectedTags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-[#E1F7DB] text-[#1C7D29] border border-[#71CE61] px-3 py-1 rounded-full text-xs font-semibold animate-in zoom-in duration-200">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-500 hover:bg-white rounded-full p-0.5 ml-1 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsTagDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsTagDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && searchQuery === "" && selectedTags.length > 0) {
                    removeTag(selectedTags[selectedTags.length - 1]);
                  }
                }}
                placeholder={selectedTags.length === 0 ? "ค้นหาชื่อสมุนไพร หรือสรรพคุณ..." : "พิมพ์เพิ่ม..."}
                className="flex-1 min-w-[120px] bg-transparent text-sm md:text-base text-gray-800 outline-none px-1"
              />

              {(searchQuery || selectedTags.length > 0) && (
                <button
                  onClick={() => { setSearchQuery(""); setSelectedTags([]); }}
                  className="text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors p-1.5 mr-1 cursor-pointer shrink-0"
                  title="ล้างทั้งหมด"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              )}
            </div>

            {isTagDropdownOpen && searchQuery && matchingTags.length > 0 && (
              <div className="absolute top-[110%] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2.5 text-xs font-semibold text-gray-400 bg-gray-50/50 border-b border-gray-100 flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                  เพิ่มเป็นหมวดหมู่ค้นหา
                </div>
                {matchingTags.map((tag) => (
                  <div
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="px-4 py-3 hover:bg-[#EEFFE5] cursor-pointer text-sm font-medium text-gray-700 hover:text-[#1C7D29] flex items-center transition-colors border-b border-gray-50 last:border-0"
                  >
                    {tag.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                      <span>
                        {tag.substring(0, tag.toLowerCase().indexOf(searchQuery.toLowerCase()))}
                        <span className="text-[#1C7D29] font-bold">
                          {tag.substring(tag.toLowerCase().indexOf(searchQuery.toLowerCase()), tag.toLowerCase().indexOf(searchQuery.toLowerCase()) + searchQuery.length)}
                        </span>
                        {tag.substring(tag.toLowerCase().indexOf(searchQuery.toLowerCase()) + searchQuery.length)}
                      </span>
                    ) : (
                      tag
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Picks */}
          {selectedTags.length === 0 && allTags.length > 0 && (
            <div className="w-full mt-3 flex flex-wrap items-center gap-2 px-1">
              <span className="text-xs text-gray-400 font-medium mr-1">สรรพคุณที่บันทึกบ่อย:</span>
              {allTags.slice(0, 5).map(tag => (
                <span
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="text-[11px] px-3 py-1 bg-white text-gray-600 border border-gray-200 rounded-full cursor-pointer hover:bg-[#EEFFE5] hover:text-[#1C7D29] hover:border-[#71CE61] transition-colors shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* --- ส่วนแสดงผลการ์ดแบบ Grid --- */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-8 mb-12 px-4 md:px-6 w-full max-w-6xl">
          {loading ? (
            <div className="w-full flex flex-col items-center my-10">
              <div className="w-8 h-8 border-[3px] border-green-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500 text-sm animate-pulse">กำลังโหลดสมุนไพร...</p>
            </div>
          ) : filteredHerbs.length > 0 ? (
            filteredHerbs.map(herb => {
              const imgSource = herb.image_url ? (herb.image_url.startsWith('http') ? herb.image_url : `http://localhost:8080${herb.image_url}`) : "/placeholder.png";

              return (
                <div
                  key={herb.id}
                  onClick={() => router.push(`/herbs/${herb.id}`)}
                  className="w-[calc(50%-6px)] md:w-64 lg:w-72 flex flex-col rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl bg-[#F7FFF7] border border-green-50 cursor-pointer transition-transform hover:-translate-y-1 hover:scale-[1.02] relative group"
                >
                  {/* 🌟 ปุ่มถังขยะ (ลบบุ๊กมาร์ก) ซ่อนอยู่มุมขวาบน จะชัดขึ้นตอน Hover */}
                  <button
                    onClick={(e) => handleRemoveBookmark(e, herb.id)}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-500 p-2 rounded-full z-10 transition-all shadow-sm opacity-80 md:opacity-0 group-hover:opacity-100"
                    title="ลบออกจากรายการบันทึก"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                    </svg>
                  </button>

                  <div className="w-full h-28 md:h-40 overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    {imgSource !== "/placeholder.png" ? (
                      <img src={imgSource} alt={herb.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs md:text-sm">ไม่มีรูปภาพ</span>
                    )}
                  </div>

                  <div className="p-3 md:p-4 flex flex-col flex-1 w-full text-left">
                    <h2 className="text-[14px] md:text-[16px] text-black pb-1 md:pb-2 font-medium line-clamp-2 leading-tight">
                      {herb.name}
                    </h2>

                    {herb.scientific_name && (
                      <p className="text-[12px] md:text-[13px] text-gray-500 italic line-clamp-2 mb-2 md:mb-3 mt-1 md:mt-0 flex-1">
                        {herb.scientific_name}
                      </p>
                    )}

                    {/* Tags */}
                    {herb.tags && herb.tags.length > 0 && (
                      <div className="flex gap-1.5 md:gap-2 flex-wrap mt-auto pt-2 border-t border-green-100">
                        {herb.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="text-[9px] md:text-[10px] bg-[#D8F5D0] text-green-800 border border-[#A2F58B] px-1.5 md:px-2 py-0.5 md:py-1 rounded-md whitespace-nowrap"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-full text-center my-16 flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <p className="text-gray-700 text-lg font-bold">ไม่พบสมุนไพรที่บันทึกไว้</p>
              <p className="text-gray-500 text-sm mt-1">ลองเปลี่ยนคำค้นหา หรือลบหมวดหมู่บางอันออกดูนะครับ</p>
              {(searchQuery || selectedTags.length > 0) && (
                <button
                  onClick={() => { setSearchQuery(""); setSelectedTags([]); }}
                  className="mt-5 px-6 py-2.5 bg-[#71CE61] text-white rounded-full text-sm font-semibold hover:bg-[#60b552] cursor-pointer transition-colors shadow-md hover:shadow-lg"
                >
                  ล้างการค้นหาทั้งหมด
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}