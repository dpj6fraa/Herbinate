"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { MessageSquare, Trash2, ChevronRight } from "lucide-react";

type MyComment = {
  id: string;
  post_id: string;
  content: string;
  post_title: string;
  created_at: string;
};

export default function MyCommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<MyComment[]>([]);
  const [loading, setLoading] = useState(true);

  // States สำหรับ Search & Keywords
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State สำหรับ Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:8080/api/posts/my-comments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("failed to fetch comments");
        return res.json();
      })
      .then((data) => {
        setComments(data || []);
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

  // 🌟 ฟังก์ชันลบคอมเมนต์
  const handleDeleteComment = async (e: React.MouseEvent, commentId: string) => {
    e.stopPropagation();
    if (!confirm("คุณต้องการลบคอมเมนต์นี้ใช่หรือไม่?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8080/api/posts/comment?comment_id=${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        showToast("ลบคอมเมนต์เรียบร้อยแล้ว");
      } else {
        showToast("ไม่สามารถลบคอมเมนต์ได้");
      }
    } catch (err) {
      console.error(err);
      showToast("เกิดข้อผิดพลาด");
    }
  };

  // กรองข้อมูลคอมเมนต์
  const filteredComments = comments.filter(comment => {
    const textToSearch = `${comment.content} ${comment.post_title}`.toLowerCase();
    const matchesSearch = searchQuery === "" || textToSearch.includes(searchQuery.toLowerCase());
    const matchesKeywords = selectedKeywords.length === 0 || selectedKeywords.every(k => textToSearch.includes(k.toLowerCase()));
    return matchesSearch && matchesKeywords;
  });

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 pt-4 md:w-full relative">
      <Nav />

      <div className="flex-1 flex flex-col pt-4 lg:items-center w-full pb-10">
        <div className="flex flex-col items-center justify-center px-4 md:px-6 w-full max-w-2xl">

          {/* Header */}
          <div className="flex items-center justify-start w-full gap-3 mb-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer text-gray-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-[20px] md:text-[24px] text-black font-bold">ประวัติคอมเมนต์</h1>
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
                  if (e.key === "Enter" && searchQuery.trim() !== "") addKeyword(searchQuery.trim());
                  if (e.key === "Backspace" && searchQuery === "" && selectedKeywords.length > 0) removeKeyword(selectedKeywords[selectedKeywords.length - 1]);
                }}
                placeholder={selectedKeywords.length === 0 ? "ค้นหาจากเนื้อหาคอมเมนต์ หรือโพสต์..." : "พิมพ์แล้วกด Enter..."}
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
            
            {isDropdownOpen && searchQuery.trim() !== "" && (
               <div className="absolute top-[110%] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div 
                    onClick={() => addKeyword(searchQuery.trim())}
                    className="px-4 py-3 hover:bg-[#EEFFE5] cursor-pointer text-sm font-medium text-gray-700 flex items-center justify-between transition-colors"
                  >
                    <span>ค้นหาคำว่า <span className="text-[#1C7D29] font-bold">&quot;{searchQuery}&quot;</span></span>
                    <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded bg-gray-50">กด Enter</span>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* --- ส่วนแสดงผลคอมเมนต์ --- */}
        <div className="flex flex-col gap-3 mt-6 mb-12 px-4 md:px-6 w-full max-w-2xl">
          {loading ? (
            <div className="w-full flex flex-col items-center my-10">
              <div className="w-8 h-8 border-[3px] border-green-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500 text-sm animate-pulse">กำลังโหลดประวัติคอมเมนต์...</p>
            </div>
          ) : filteredComments.length > 0 ? (
            filteredComments.map(comment => (
              <div
                key={comment.id}
                onClick={() => router.push(`/post/${comment.post_id}`)}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer relative group flex flex-col gap-2"
              >
                {/* อ้างอิงโพสต์ต้นทาง */}
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-600 truncate">ตอบกลับในโพสต์: </span>
                  <span className="text-[#1C7D29] truncate flex-1 font-medium">{comment.post_title || "โพสต์ถูกลบไปแล้ว"}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </div>

                <div className="flex items-start gap-3 mt-1">
                  <div className="w-8 h-8 rounded-full bg-[#E1F7DB] flex items-center justify-center text-[#1C7D29] shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 fill-current" />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <p className="text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    <span className="text-[11px] text-gray-400 mt-2 font-medium">
                      {new Date(comment.created_at).toLocaleString("th-TH")}
                    </span>
                  </div>

                  {/* ปุ่มลบมุมขวา จะโผล่ตอน Hover */}
                  <button
                    onClick={(e) => handleDeleteComment(e, comment.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all md:opacity-0 md:group-hover:opacity-100"
                    title="ลบคอมเมนต์"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full text-center my-16 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                <MessageSquare className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-700 text-lg font-bold">ไม่พบประวัติการคอมเมนต์</p>
              <p className="text-gray-500 text-sm mt-1">คุณยังไม่ได้แสดงความคิดเห็นในโพสต์ใดเลย</p>
              {(searchQuery || selectedKeywords.length > 0) && (
                <button
                  onClick={() => { setSearchQuery(""); setSelectedKeywords([]); }}
                  className="mt-5 px-6 py-2.5 bg-[#71CE61] text-white rounded-full text-sm font-semibold hover:bg-[#60b552] transition-colors shadow-md"
                >
                  ล้างการค้นหาทั้งหมด
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[14px] font-medium px-6 py-3 rounded-full shadow-2xl z-[100] transition-all animate-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}

      {/* <Footer /> */}
    </main>
  );
}