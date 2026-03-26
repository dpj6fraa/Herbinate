"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { Heart, MessageCircle, Upload, BookmarkMinus } from "lucide-react";

type ImageItem = { url: string; order: number };

type FeedPost = {
  id: string;
  title: string;
  content: string;
  username: string;
  user_id?: string;
  profileImg?: string;
  createdAt: string;
  created_at?: string;
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
  images?: ImageItem[];
  image?: string | null;
};

export default function SavedPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  // States สำหรับ Search & Keywords (ใช้แทน Tags)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:8080/api/posts/bookmarks", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("failed to fetch bookmarked posts");
        return res.json();
      })
      .then((data) => {
        setPosts(data || []);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [router]);

  // ปิด Dropdown เมื่อคลิกที่อื่น
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addKeyword = (keyword: string) => {
    if (!selectedKeywords.includes(keyword)) {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const removeKeyword = (keywordToRemove: string) => {
    setSelectedKeywords(selectedKeywords.filter(k => k !== keywordToRemove));
  };

  // 🌟 ฟังก์ชันลบออกจากบุ๊กมาร์ก
  const handleRemoveBookmark = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8080/api/posts/bookmark?post_id=${postId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🌟 ฟังก์ชันจัดการรูปภาพ
  function PostImages({ post }: { post: FeedPost }) {
    const sorted = post.images?.length
      ? [...post.images].sort((a, b) => a.order - b.order)
      : post.image
      ? [{ url: post.image, order: 0 }]
      : [];

    if (sorted.length === 0) return null;
    const base = "http://localhost:8080";

    if (sorted.length === 1) {
      return <img src={`${base}${sorted[0].url}`} className="w-full max-h-72 object-cover" />;
    }
    if (sorted.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-0.5">
          {sorted.map((img, i) => <img key={i} src={`${base}${img.url}`} className="w-full h-44 object-cover" />)}
        </div>
      );
    }
    if (sorted.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-0.5">
          <img src={`${base}${sorted[0].url}`} className="w-full h-44 object-cover row-span-2 col-span-1" style={{ gridRow: "span 2" }} />
          <img src={`${base}${sorted[1].url}`} className="w-full h-[86px] object-cover" />
          <img src={`${base}${sorted[2].url}`} className="w-full h-[86px] object-cover" />
        </div>
      );
    }

    const shown = sorted.slice(0, 4);
    const extra = sorted.length - 4;
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {shown.map((img, i) => (
          <div key={i} className="relative">
            <img src={`${base}${img.url}`} className="w-full h-36 object-cover" />
            {i === 3 && extra > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">+{extra}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // กรองข้อมูลโพสต์
  const filteredPosts = posts.filter(post => {
    const textToSearch = `${post.title} ${post.content} ${post.username}`.toLowerCase();
    
    // เช็ค Keyword ในช่องพิมพ์
    const matchesSearch = searchQuery === "" || textToSearch.includes(searchQuery.toLowerCase());
    
    // เช็ค Tag สีเขียวที่ถูกเลือกไว้
    const matchesKeywords = selectedKeywords.length === 0 || selectedKeywords.every(k => textToSearch.includes(k.toLowerCase()));

    return matchesSearch && matchesKeywords;
  });

  return (
    <main className="min-h-screen flex flex-col bg-white pt-4 md:w-full">
      <Nav />

      <div className="flex-1 flex flex-col pt-4 lg:items-center w-full pb-10">
        <div className="flex flex-col items-center justify-center px-4 md:px-6 w-full max-w-2xl"> {/* ใช้ max-w-2xl เหมือนหน้า Feed */}

          {/* Header */}
          <div className="flex items-center justify-start w-full gap-3 mb-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-[20px] md:text-[24px] text-black font-bold">โพสต์ที่บันทึก</h1>
          </div>

          {/* 🌟 ก้อนค้นหาอัจฉริยะ (Smart Search Box) */}
          <div className="relative w-full mt-2" ref={dropdownRef}>
            <div className={`flex flex-wrap items-center gap-2 w-full min-h-[48px] p-2 rounded-2xl md:rounded-full bg-white border-2 transition-colors shadow-sm ${isDropdownOpen ? 'border-[#71CE61]' : 'border-gray-200 focus-within:border-[#71CE61]'}`}>
              <span className="text-gray-400 pl-2 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>

              {selectedKeywords.map((keyword) => (
                <span key={keyword} className="flex items-center gap-1 bg-[#E1F7DB] text-[#1C7D29] border border-[#71CE61] px-3 py-1 rounded-full text-xs font-semibold animate-in zoom-in duration-200">
                  {keyword}
                  <button onClick={() => removeKeyword(keyword)} className="hover:text-red-500 hover:bg-white rounded-full p-0.5 ml-1 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim() !== "") {
                    addKeyword(searchQuery.trim());
                  }
                  if (e.key === "Backspace" && searchQuery === "" && selectedKeywords.length > 0) {
                    removeKeyword(selectedKeywords[selectedKeywords.length - 1]);
                  }
                }}
                placeholder={selectedKeywords.length === 0 ? "ค้นหาจากเนื้อหา หรือชื่อผู้โพสต์..." : "พิมพ์แล้วกด Enter..."}
                className="flex-1 min-w-[120px] bg-transparent text-sm md:text-base text-gray-800 outline-none px-1"
              />

              {(searchQuery || selectedKeywords.length > 0) && (
                <button
                  onClick={() => { setSearchQuery(""); setSelectedKeywords([]); }}
                  className="text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors p-1.5 mr-1 cursor-pointer shrink-0"
                  title="ล้างทั้งหมด"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              )}
            </div>
            
            {/* คำแนะนำให้กด Enter */}
            {isDropdownOpen && searchQuery.trim() !== "" && (
               <div className="absolute top-[110%] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div 
                    onClick={() => addKeyword(searchQuery.trim())}
                    className="px-4 py-3 hover:bg-[#EEFFE5] cursor-pointer text-sm font-medium text-gray-700 flex items-center justify-between transition-colors"
                  >
                    <span>ค้นหาคำว่า <span className="text-[#1C7D29] font-bold">&ldquo;{searchQuery}&rdquo;</span></span>
                    <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded bg-gray-50">กด Enter</span>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* --- ส่วนแสดงผลโพสต์ --- */}
        <div className="flex flex-col gap-4 mt-8 mb-12 px-4 md:px-6 w-full max-w-2xl">
          {loading ? (
            <div className="w-full flex flex-col items-center my-10">
              <div className="w-8 h-8 border-[3px] border-green-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500 text-sm animate-pulse">กำลังโหลดโพสต์...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <div
                key={post.id}
                onClick={() => router.push(`/post/${post.id}`)}
                className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer relative group"
              >
                {/* Header ของ Post */}
                <div className="bg-[#e4ffea] px-4 py-3 flex items-center justify-between transition-colors duration-300 group-hover:bg-[#d8f5d0]">
                  <div className="flex items-center gap-3">
                    {post.profileImg ? (
                      <img
                        src={`http://localhost:8080${post.profileImg}`}
                        className="w-10 h-10 rounded-full object-cover shadow-sm flex-shrink-0"
                        alt={post.username}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                        {post.username?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-bold text-black text-[15px]">{post.username}</span>
                      <span className="text-green-600 font-medium text-xs">
                        {new Date(post.created_at ?? post.createdAt).toLocaleString("th-TH")}
                      </span>
                    </div>
                  </div>

                  {/* 🌟 ปุ่มถังขยะ (ลบบุ๊กมาร์ก) สำหรับหน้า Saved Posts */}
                  <button
                    onClick={(e) => handleRemoveBookmark(e, post.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white/50 rounded-full transition-all"
                    title="ลบออกจากรายการบันทึก"
                  >
                    <BookmarkMinus className="w-5 h-5" />
                  </button>
                </div>

                {/* Text content */}
                <div className="px-4 pt-3 pb-2">
                  <h3 className="font-bold text-green-600 mb-1 leading-tight text-[15px]">
                    {post.title}
                  </h3>
                  <p className="text-[13px] text-gray-700 leading-snug line-clamp-3">
                    {post.content}
                  </p>
                </div>

                {/* Images */}
                <div className="overflow-hidden">
                  <PostImages post={post} />
                </div>

                {/* Footer (แค่โชว์ตัวเลข ไม่ต้องให้กด Like/Share จริงในหน้านี้เพื่อกันความสับสน) */}
                <div className="border-t border-gray-100 bg-white px-5 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 p-1.5 -ml-1.5">
                      <Heart className={`w-[18px] h-[18px] ${post.liked ? "text-red-500 fill-red-500" : "text-gray-400 fill-gray-400"}`} />
                      <span className={`font-bold text-sm ${post.liked ? "text-red-500" : "text-gray-500"}`}>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5">
                      <MessageCircle className="w-[18px] h-[18px] text-gray-400 fill-gray-400" />
                      <span className="text-gray-500 font-bold text-sm">{post.comments}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 -mr-1.5">
                    <Upload className="w-[18px] h-[18px] text-gray-400" />
                    <span className="text-gray-500 font-bold text-sm">{post.shares}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full text-center my-16 flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <p className="text-gray-700 text-lg font-bold">ไม่พบโพสต์ที่บันทึกไว้</p>
              <p className="text-gray-500 text-sm mt-1">ลองเปลี่ยนคำค้นหาดูนะครับ</p>
              {(searchQuery || selectedKeywords.length > 0) && (
                <button
                  onClick={() => { setSearchQuery(""); setSelectedKeywords([]); }}
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