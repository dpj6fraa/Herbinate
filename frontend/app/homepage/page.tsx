"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const API = "http://localhost:8080";

// ==========================================
// 1. Interfaces
// ==========================================
type Herb = {
  id: string;
  name: string;
  scientific_name: string;
  description: string;
  image_url: string;
  tags: string[];
};

type Article = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
};

// 🌟 เพิ่ม Interface ของ Post สำหรับระบบ Search
type Post = {
  id: string;
  title: string;
  content: string;
};

// ==========================================
// 2. Components ย่อย (Search, Tools)
// ==========================================
function SearchBar() {
  const router = useRouter();
  
  // 🌟 States เก็บข้อมูลทั้งหมดสำหรับค้นหา
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // โหลดข้อมูลมาเตรียมไว้ตอนเปิดหน้าเว็บ
  useEffect(() => {
    Promise.all([
      fetch(`${API}/herbs`).then(res => res.ok ? res.json() : []),
      fetch(`${API}/articles`).then(res => res.ok ? res.json() : []),
      // 🌟🌟 แก้ URL ตรงนี้ให้ชี้ไปที่ /api/posts/feed ตาม routes.go ของคุณ
      fetch(`${API}/api/posts/feed`).then(res => res.ok ? res.json() : []) 
    ])
    .then(([herbsData, articlesData, postsData]) => {
      
      setHerbs(Array.isArray(herbsData) ? herbsData : herbsData?.data || []);
      setArticles(Array.isArray(articlesData) ? articlesData : articlesData?.data || []);
      
      // กันเหนียวเผื่อข้อมูล posts ถูกห่อมาในรูปแบบอื่น
      let finalPosts = [];
      if (Array.isArray(postsData)) {
        finalPosts = postsData;
      } else if (postsData && Array.isArray(postsData.data)) {
        finalPosts = postsData.data;
      }
      setPosts(finalPosts);

    })
    .catch(err => console.error("Error fetching search data:", err));
  }, []);

  // ปิด Dropdown เมื่อคลิกที่อื่น
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🌟 ฟังก์ชันกรองข้อมูล และจำกัดจำนวนที่ 5 รายการ (Limit = 5)
  const filteredHerbs = herbs.filter(h =>
    h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.scientific_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5); 

  const filteredArticles = articles.filter(a =>
    a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const filteredPosts = posts.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim() || !text) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <span key={i} className="text-[#1C7D29] font-bold">{part}</span> : part
    );
  };

  const hasResults = filteredHerbs.length > 0 || filteredArticles.length > 0 || filteredPosts.length > 0;

  return (
    <div>
      <div className="relative w-full h-64 sm:h-75 md:h-60">
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          <Image
            src="/images/herbs.webp"
            alt="Herbinate Background"
            fill
            className="object-cover opacity-60" 
          />
        </div>

        <div className="relative z-40 w-full h-full flex flex-col justify-center items-center px-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-tight text-white shadow-sm">
            &quot;สมุนไพร... เรื่องง่ายสำหรับทุกคน&quot;
          </h1>
          <h2 className="text-xs sm:text-sm md:text-lg text-white/90 leading-relaxed shadow-sm">
            แหล่งความรู้และผลิตภัณฑ์สมุนไพร
          </h2>
          <h2 className="text-xs sm:text-sm md:text-lg mb-4 text-white/90 leading-relaxed shadow-sm">
            ที่ช่วยให้คุณเลือกใช้ได้อย่างมั่นใจ
          </h2>

          <div className="relative w-full max-w-md mx-auto px-4" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsOpen(true);
                }}
                placeholder="ค้นหาสมุนไพร, บทความ, กระทู้..."
                className="w-full py-3 px-6 rounded-full text-sm text-black bg-white focus:outline-none focus:ring-4 focus:ring-[#71CE61]/50 shadow-xl transition-all"
              />
              
              {searchQuery ? (
                <button 
                  onClick={() => { setSearchQuery(""); setIsOpen(false); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              ) : (
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
              )}
            </div>

            {isOpen && searchQuery.length > 0 && (
              <div className="absolute top-[115%] left-4 right-4 bg-white rounded-xl shadow-2xl overflow-hidden z-50 text-left border border-gray-100 flex flex-col max-h-[60vh] animate-in slide-in-from-top-2 duration-200">
                <div className="overflow-y-auto scrollbar-hide">
                  {hasResults ? (
                    <>
                      {/* หมวดสมุนไพร */}
                      {filteredHerbs.length > 0 && (
                        <div className="border-b border-gray-100 last:border-0">
                          <div className="px-4 py-2 bg-green-50/50 text-xs font-bold text-[#1C7D29] flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"></path></svg>
                            สมุนไพร
                          </div>
                          {filteredHerbs.map((herb) => (
                            <div
                              key={herb.id}
                              onClick={() => router.push(`/herbs/${herb.id}`)}
                              className="px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col"
                            >
                              <span className="text-sm text-gray-800 font-medium line-clamp-1">{highlightText(herb.name, searchQuery)}</span>
                              {herb.scientific_name && <span className="text-[11px] text-gray-400 italic line-clamp-1">{highlightText(herb.scientific_name, searchQuery)}</span>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* หมวดบทความ */}
                      {filteredArticles.length > 0 && (
                        <div className="border-b border-gray-100 last:border-0">
                          <div className="px-4 py-2 bg-blue-50/50 text-xs font-bold text-blue-700 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            บทความ
                          </div>
                          {filteredArticles.map((article) => (
                            <div
                              key={article.id}
                              onClick={() => router.push(`/articles/${article.id}`)}
                              className="px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col"
                            >
                              <span className="text-sm text-gray-800 font-medium line-clamp-1">{highlightText(article.title, searchQuery)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* หมวดชุมชน */}
                      {filteredPosts.length > 0 && (
                        <div className="border-b border-gray-100 last:border-0">
                          <div className="px-4 py-2 bg-orange-50/50 text-xs font-bold text-orange-700 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            ชุมชน
                          </div>
                          {filteredPosts.map((post) => (
                            <div
                              key={post.id}
                              // 🌟 ไปที่หน้า /post/[id]
                              onClick={() => router.push(`/post/${post.id}`)} 
                              className="px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex flex-col"
                            >
                              <span className="text-sm text-gray-800 font-medium line-clamp-1">{highlightText(post.title, searchQuery)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center flex flex-col items-center justify-center">
                      <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      <p className="text-sm text-gray-500 font-medium">ไม่พบผลลัพธ์สำหรับ &quot;<span className="text-gray-800">{searchQuery}</span>&quot;</p>
                    </div>
                  )}
                </div>
                
                {hasResults && (
                  <div className="bg-gray-50 p-2 text-center text-[10px] text-gray-400 border-t border-gray-100">
                    เลือกผลลัพธ์ที่ต้องการเพื่อดูรายละเอียด
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tools() {
  return (
    <div className="w-full bg-white sm:px-6">
      <div className="bg-white border-b border-gray-200/50">
        <div className="max-w-150 mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">เครื่องมือ</h2>
        </div>
      </div>

      <div className="bg-white py-4">
        <div className="max-w-150 mx-auto px-4">
          <div className="grid grid-cols-2 gap-2.5">
            <Link href="/aisearch/image" className="flex flex-col justify-center border border-gray-300 p-3 rounded-xl bg-green-50/50 hover:bg-green-50 transition-colors duration-200">
              <div className="flex justify-start items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 7V3C2 2.44772 2.44772 2 3 2H7" stroke="black" strokeWidth={2} strokeLinecap="round" />
                  <path d="M17 2H21C21.5523 2 22 2.44772 22 3V7" stroke="black" strokeWidth={2} strokeLinecap="round" />
                  <path d="M2 17V21C2 21.5523 2.44772 22 3 22H7" stroke="black" strokeWidth={2} strokeLinecap="round" />
                  <path d="M17 22H21C21.5523 22 22 21.5523 22 21V17" stroke="black" strokeWidth={2} strokeLinecap="round" />
                  <path d="M11.8 19C11.8 19 5.5 17.5 5 13C4.5 9.5 9 9 11.8 14" fill="black" />
                  <path d="M12.2 19C12.2 19 18.5 17.5 19 13C19.5 9.5 15 9 12.2 14" fill="black" />
                  <path d="M12 16C14 14 15 11 12 5C9 11 10 14 12 16Z" fill="black" />
                </svg>
                <h3 className="text-xs text-gray-800 font-medium">AI Scanner</h3>
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5">ถ่ายรูประบุสมุนไพร</p>
            </Link>

            <Link href="/aisearch/text" className="flex flex-col justify-center border border-gray-300 p-3 rounded-xl bg-green-50/50 hover:bg-green-50 transition-colors duration-200">
              <div className="flex justify-start items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H16.82C16.4 1.84 15.3 1 14 1H10C8.7 1 7.6 1.84 7.18 3H5C3.9 3 3 3.9 3 5V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V5C21 3.9 20.1 3 19 3Z" fill="black" />
                  <path d="M14 3H10V5H14V3Z" fill="white" />
                  <path d="M9 8H7V10H5V12H7V14H9V12H11V10H9V8Z" fill="white" />
                  <path d="M5.5 18L8 20.5L12 15.5L10.5 14L8 17.5L6.5 16L5.5 18Z" fill="white" />
                  <rect x="14" y="9" width="4" height="2" rx="0.5" fill="white" />
                  <rect x="14" y="13" width="4" height="2" rx="0.5" fill="white" />
                  <rect x="14" y="17" width="4" height="2" rx="0.5" fill="white" />
                </svg>
                <h3 className="text-xs text-gray-800 font-medium">AI Checker</h3>
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5">แนะนำสมุนไพรตามอาการ</p>
            </Link>

            <Link href="/post/feed" className="flex flex-col justify-center border border-gray-300 p-3 rounded-xl bg-green-50/50 hover:bg-green-50 transition-colors duration-200 cursor-pointer">
              <div className="flex justify-start items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <h3 className="text-xs text-gray-800 font-medium">Community</h3>
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5">ชุมชนผู้ใช้สมุนไพร</p>
            </Link>

            <div className="flex flex-col justify-center border border-gray-300 p-3 rounded-xl bg-green-50/50 hover:bg-green-50 transition-colors duration-200 cursor-pointer">
              <div className="flex justify-start items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 400 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g transform="scale(1.2) translate(-35, -20)">
                    <path d="M200 180V300M150 380L200 300L250 380H150Z" stroke="black" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="black" />
                    <rect x="70" y="240" width="260" height="12" rx="6" fill="black" />
                    <path d="M70 310C70 345 100 370 135 370C170 370 200 345 200 310H70Z" fill="black" transform="translate(0, -50)" />
                    <circle cx="135" cy="150" r="70" fill="black" />
                    <path d="M135 60C135 60 115 80 115 100C115 120 135 130 135 130C135 130 155 120 155 100C155 80 135 60 135 60Z" fill="white" transform="translate(0, 40)" />
                    <path d="M105 105C105 105 90 115 90 130C90 145 105 150 115 150C125 150 135 135 135 135C130 120 105 105 105 105Z" fill="white" transform="translate(0, 40)" />
                    <path d="M165 105C165 105 180 115 180 130C180 145 165 150 155 150C145 150 135 135 135 135C140 120 165 105 165 105Z" fill="white" transform="translate(0, 40)" />
                    <path d="M200 310C200 345 230 370 265 370C300 370 330 345 330 310H200Z" fill="black" transform="translate(0, -50)" />
                    <circle cx="265" cy="150" r="70" fill="black" />
                    <path d="M265 140V70M265 140L230 85M265 140L300 85" stroke="white" strokeWidth="10" strokeLinecap="round" transform="translate(0, 40)" />
                  </g>
                </svg>
                <h3 className="text-xs text-gray-800 font-medium">Compare</h3>
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5">เปรียบเทียบสรรพคุณ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. Components แสดงผลข้อมูล
// ==========================================
function PopularHerbs({ data }: { data: Herb[] }) {
  const router = useRouter();

  return (
    <div className="w-full bg-white sm:px-6">
        <div className="bg-white border-b border-gray-200/50">
            <div className="max-w-150 mx-auto px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-800">
                สมุนไพรยอดนิยม
              </h2>
              <button 
                onClick={() => router.push('/herbs')} 
                className="group flex items-center gap-1 text-[11px] sm:text-xs font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-all duration-200"
              >
                ดูทั้งหมด
                <svg 
                  className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" 
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
          </button>
        </div>
      </div>

      <div className="bg-white py-4">
        <div className="max-w-150 mx-auto">
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4">
            <div className="flex gap-4" style={{ width: "max-content" }}>
              {data?.map((item) => {
                const imgSource = item.image_url ? `${API}${item.image_url}` : "/placeholder.png";

                return (
                  <div 
                    key={item.id} 
                    onClick={() => router.push(`/herbs/${item.id}`)} 
                    className="shrink-0 w-40 snap-start group cursor-pointer h-full"
                  >
                    <div className="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-full">
                      <div className="w-full h-28 rounded-t-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                        <img
                          src={imgSource}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3 flex flex-col gap-1.5 flex-1">
                        <h3 className="text-xs font-bold text-gray-800 line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-[10px] text-gray-600 line-clamp-2 leading-relaxed flex-1">
                          {item.description || item.scientific_name}
                        </p>
                        <span className="text-[10px] text-green-600 font-normal group-hover:text-green-700 transition-colors text-left mt-auto pt-1">
                          ดูสมุนไพรนี้ →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HerbsNews({ data }: { data: Article[] }) {
  const router = useRouter();

  return (
    <div className="w-full bg-white sm:px-6 mt-2">
        <div className="bg-white border-b border-gray-200/50">
            <div className="max-w-150 mx-auto px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-800">
                บทความและเกร็ดความรู้
              </h2>
              <button 
                onClick={() => router.push('/articles')} 
                className="group flex items-center gap-1 text-[11px] sm:text-xs font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-all duration-200"
              >
                ดูทั้งหมด
                <svg 
                  className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" 
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
        </div>
      </div>

      <div className="bg-white py-4">
        <div className="max-w-150 mx-auto">
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4">
            <div className="flex gap-4" style={{ width: "max-content" }}>
              {data?.map((item) => {
                const imgSource = item.image_url ? `${API}${item.image_url}` : "/placeholder.png";

                return (
                  <div 
                    key={item.id} 
                    onClick={() => router.push(`/articles/${item.id}`)}
                    className="shrink-0 w-40 snap-start group cursor-pointer h-full"
                  >
                    <div className="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-full">
                      <div className="w-full h-28 rounded-t-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                        <img
                          src={imgSource}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3 flex flex-col gap-1.5 flex-1">
                        <h3 className="text-xs font-bold text-gray-800 line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-[10px] text-gray-600 line-clamp-2 leading-relaxed flex-1">
                          {item.description}
                        </p>
                        <span className="text-[10px] text-green-600 font-normal group-hover:text-green-700 transition-colors text-left mt-auto pt-1">
                          อ่านรายละเอียด →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/herbs`).then(res => res.json()),
      fetch(`${API}/articles`).then(res => res.json())
    ])
    .then(([herbsData, articlesData]) => {
      setHerbs(herbsData.slice(0, 10));
      setArticles(articlesData.slice(0, 10));
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching home data:", err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="w-8 h-8 border-[3px] border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="flex-1">
      <PopularHerbs data={herbs} />
      <HerbsNews data={articles} />
    </section>
  );
}

// ==========================================
// 4. Main Page Component
// ==========================================
export default function Home() {
  return (
    <main className="min-h-svh bg-white flex flex-col">
      <Nav />
      <SearchBar />
      <Tools />
      <HomeContent />
      <Footer />
    </main>
  );
}