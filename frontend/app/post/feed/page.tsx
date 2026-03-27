"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import CreatePostModal from "../../components/forcommunity/CreatePostModal";
import PostReportModal from "@/app/components/PostreportModal"; // 🌟 เพิ่ม Modal รายงาน
import {
  Search,
  Filter,
  Heart,
  MessageCircle,
  Upload,
  Plus,
  MoreHorizontal, // 🌟 เพิ่ม Icons
  Bookmark,
  Pencil,
  Trash2,
  Siren
} from "lucide-react";

type FeedPost = {
  id: string;
  title: string;
  content: string;
  username: string;
  user_id?: string; // 🌟 เผื่อ backend ส่ง user_id มาให้เช็คความเป็นเจ้าของ
  is_bookmarked?: boolean;
  profileImg?: string;
  createdAt: string;
  created_at?: string;
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
  images?: { url: string; order: number }[];
  image?: string | null;
};

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedSort, setFeedSort] = useState<"newest" | "trending">("newest");
  
  // 🌟 States สำหรับจัดการ Dropdown และ Modals ใน Feed
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
  const [reportingPost, setReportingPost] = useState<{ id: string; title: string } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000); // ให้หายไปเองใน 3 วินาที
  };

  const router = useRouter();

useEffect(() => {
    const fetchFeedAndUser = async () => {
      const token = localStorage.getItem("token");
      
      // ถอดรหัส Token และระบุ Type ป้องกันตัวแดง
      let parsedUserId: string | null = null;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1])) as { 
            user_id?: string; 
            id?: string; 
            sub?: string 
          };
          parsedUserId = payload.user_id || payload.id || payload.sub || null;
        } catch (e) {
          parsedUserId = localStorage.getItem("user_id");
        }
      }

      // โหลดข้อมูลโพสต์
      try {
        const res = await fetch("http://localhost:8080/api/posts/feed", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        // 🌟 3. ดักจับ Status 401 ก่อนที่จะสั่ง .json()
        if (res.status === 401) {
          console.warn("Unauthorized: Redirecting to login...");
          router.push("/login"); // เด้งไปหน้า login
          return; // หยุดการทำงานของฟังก์ชันนี้ทันที เพื่อไม่ให้ไปบรรทัด .json()
        }

        // เช็คเผื่อกรณี Error อื่นๆ (เช่น 500) จะได้ไม่พังตอนแปลง JSON
        if (!res.ok) {
          throw new Error(`Error HTTP Status: ${res.status}`);
        }

        const data = await res.json();
        
        // อัปเดต State พร้อมกัน เพื่อลดการ Render ซ้ำซ้อน
        setCurrentUserId(parsedUserId);
        setPosts(Array.isArray(data) ? data : data?.data || data?.posts || []);
      } catch (err) {
        console.error("Failed to fetch feed:", err);
      }
    };

    fetchFeedAndUser();
}, [router]);

  async function toggleLike(postID: string, liked?: boolean) {
    const token = localStorage.getItem("token");
    if (!token) { alert("กรุณาเข้าสู่ระบบ"); return; }

    const url = liked
      ? `http://localhost:8080/api/posts/unlike?post_id=${postID}`
      : `http://localhost:8080/api/posts/like?post_id=${postID}`;

    await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}` } });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postID
          ? { ...p, liked: !liked, likes: liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }

  async function sharePost(postID: string) {
    const token = localStorage.getItem("token");
    if (!token) { showToast("กรุณาเข้าสู่ระบบ"); return; } // เปลี่ยนจาก alert เป็น showToast

    try {
      const response = await fetch(
        `http://localhost:8080/api/posts/share?post_id=${postID}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      
      // คัดลอกลิงก์
      await navigator.clipboard.writeText(`${window.location.origin}/post/${postID}`);

      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postID ? { ...p, shares: p.shares + 1 } : p))
        );
        showToast("คัดลอกลิงก์โพสต์แล้ว!"); // เปลี่ยนจาก alert เป็น showToast
      } else {
        showToast("คัดลอกลิงก์โพสต์แล้ว (คุณเคยแชร์ไปแล้ว)"); // เปลี่ยนจาก alert เป็น showToast
      }
    } catch (e) {
      console.error(e);
      showToast("เกิดข้อผิดพลาดในการแชร์");
    }
  }

// 🌟 ฟังก์ชัน Bookmark จากหน้า Feed
  async function handleBookmark(postID: string) {
    const token = localStorage.getItem("token");
    if (!token) { showToast("กรุณาเข้าสู่ระบบ"); return; } // เปลี่ยน alert เป็น showToast
    try {
      const res = await fetch(`http://localhost:8080/api/posts/bookmark?post_id=${postID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        setPosts((prevPosts) => 
          prevPosts.map((p) => 
            p.id === postID 
              ? { ...p, is_bookmarked: data.bookmarked } 
              : p
          )
        );

        // 🌟 เรียกใช้ Toast แทน alert()
        showToast(data.message === "Bookmark added" ? "บันทึกโพสต์เรียบร้อย" : "ยกเลิกการบันทึกโพสต์แล้ว");
      }
    } catch (e) {
      console.error(e);
    }
  }

  // 🌟 ฟังก์ชันลบโพสต์จากหน้า Feed
  async function deletePost(postID: string) {
    if (!confirm("คุณต้องการลบโพสต์นี้ใช่หรือไม่?")) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8080/api/posts/delete?post_id=${postID}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPosts((prev) => prev.filter(p => p.id !== postID));
      }
    } catch (e) {
      console.error(e);
    }
  }

  const processedPosts = posts
    .filter((p) => {
      const query = searchQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(query) ||
        p.content?.toLowerCase().includes(query) ||
        p.username?.toLowerCase().includes(query)
      );
    })
    .filter((p) => {
      if (feedSort === "trending") {
        const postDate = new Date(p.created_at ?? p.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return postDate >= sevenDaysAgo;
      }
      return true; 
    })
    .sort((a, b) => {
      if (feedSort === "trending") {
        return b.likes - a.likes; 
      } else {
        const dateA = new Date(a.created_at ?? a.createdAt).getTime();
        const dateB = new Date(b.created_at ?? b.createdAt).getTime();
        return dateB - dateA; 
      }
    });

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

  const renderPostCard = (post: FeedPost) => {
    const isOwner = currentUserId === post.user_id;

    return (
      <div
        key={post.id}
        onClick={() => router.push(`/post/${post.id}`)}
        className="mb-4 border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer relative"
      >
        
        {/* Header */}
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

          {/* 🌟 3-Dot Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation(); // ป้องกันการเด้งไปหน้า Post Detail
                setOpenMenuId(openMenuId === post.id ? null : post.id);
              }}
              className="p-2 -mr-2 text-gray-500 hover:text-black hover:bg-white/50 rounded-full transition-all"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {openMenuId === post.id && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} 
                />
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()} // ป้องกันการกดเมนูแล้วเด้งไปหน้าอื่น
                >
                  {/* ปุ่ม Bookmark */}
                  <button
                    onClick={() => {
                      handleBookmark(post.id);
                      setOpenMenuId(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-[14px] font-medium transition-colors"
                  >
                    <Bookmark className={`w-4 h-4 ${post.is_bookmarked ? "fill-green-500 text-green-500" : "text-gray-500"}`} />
                    {post.is_bookmarked ? "เลิกบันทึกโพสต์" : "บันทึกโพสต์"}
                  </button>

                  {/* เมนูเฉพาะเจ้าของโพสต์ */}
                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-[14px] font-medium transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-blue-500" />
                        แก้ไขโพสต์
                      </button>
                      <button
                        onClick={() => {
                          deletePost(post.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 text-[14px] font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                        ลบโพสต์
                      </button>
                    </>
                  )}

                  {/* เส้นคั่น */}
                  {isOwner && <div className="h-px bg-gray-100 my-1" />}

                  {/* ปุ่ม Report */}
                  <button
                    onClick={() => {
                      setReportingPost({ id: post.id, title: post.title });
                      setOpenMenuId(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-[14px] font-medium transition-colors"
                  >
                    <Siren className="w-4 h-4 text-orange-500" />
                    รายงานปัญหา
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Text content */}
        <div className="px-4 pt-3 pb-2">
          <h3 className="font-bold text-green-600 mb-1 leading-tight text-[15px] group-hover:text-green-700 transition-colors">
            {post.title}
          </h3>
          <p className="text-[13px] text-gray-700 leading-snug line-clamp-2">
            {post.content}
          </p>
        </div>

        {/* Images */}
        <div className="overflow-hidden">
          <PostImages post={post} />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={(e) => { e.stopPropagation(); toggleLike(post.id, post.liked); }}
              className="flex items-center gap-1.5 p-1.5 -ml-1.5 rounded-lg hover:bg-red-50 active:scale-95 transition-all group/like"
            >
              <Heart className={`w-[18px] h-[18px] transition-transform duration-200 group-hover/like:scale-110 ${
                post.liked ? "text-red-500 fill-red-500" : "text-gray-400 fill-gray-400 group-hover/like:text-red-400"
              }`} />
              <span className={`font-bold text-sm transition-colors ${
                post.liked ? "text-red-500" : "text-gray-500 group-hover/like:text-red-400"
              }`}>{post.likes}</span>
            </button>

            <button
              onClick={(e) => e.stopPropagation()} 
              className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-green-50 active:scale-95 transition-all group/comment"
            >
              <MessageCircle className="w-[18px] h-[18px] text-gray-400 fill-gray-400 transition-transform duration-200 group-hover/comment:scale-110 group-hover/comment:text-green-500" />
              <span className="text-gray-500 group-hover/comment:text-green-600 font-bold text-sm transition-colors">{post.comments}</span>
            </button>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); sharePost(post.id); }}
            className="flex items-center gap-1.5 p-1.5 -mr-1.5 rounded-lg hover:bg-blue-50 active:scale-95 transition-all group/share"
          >
            <Upload className="w-[18px] h-[18px] text-gray-400 transition-transform duration-200 group-hover/share:-translate-y-0.5 group-hover/share:text-blue-500" />
            <span className="text-gray-500 group-hover/share:text-blue-600 font-bold text-sm transition-colors">{post.shares}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col w-full relative">
      <div className="w-full sticky top-0 z-50 shadow-sm bg-white">
        <Nav />
      </div>

      <main className="w-full max-w-2xl mx-auto flex-1 flex flex-col px-4 md:px-6 pt-5 pb-6">
        {/* Search & Sort */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3 mb-4 flex gap-2 items-center border border-gray-100">
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder="ค้นหาโพสต์, เนื้อหา, หรือชื่อผู้โพสต์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-200 rounded-full pl-4 pr-10 py-1.5 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 bg-gray-50"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-500 transition-colors" />
          </div>
          
          <button 
            onClick={() => setFeedSort(prev => prev === "newest" ? "trending" : "newest")}
            className={`border rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
              feedSort === "trending" 
                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" 
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Filter className={`w-[14px] h-[14px] ${feedSort === "trending" ? "text-green-600" : ""}`} /> 
            {feedSort === "newest" ? "โพสต์ล่าสุด" : "ยอดฮิต (7 วัน)"}
          </button>
        </div>

        <div>
          {processedPosts.length > 0 ? (
            processedPosts.map(renderPostCard)
          ) : (
            <div className="text-center py-10 text-gray-500 flex flex-col items-center gap-2">
              <span className="text-4xl">🪴</span>
              ไม่พบโพสต์ที่คุณกำลังมองหา
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-[#71CE61] hover:bg-[#5da84d] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-90 transition-all duration-300 z-50 group"
      >
        <Plus className="w-8 h-8 transition-transform duration-300 group-hover:rotate-90" />
      </button>

        {/* 🌟 Toast Notification UI */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[14px] font-medium px-6 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-2 transition-all duration-300">
          <Bookmark className="w-4 h-4 text-green-400" />
          {toastMessage}
        </div>
      )}

      <Footer />

      {/* Modals */}
      {showCreate && (
        <CreatePostModal modalType="create" onClose={() => setShowCreate(false)} />
      )}
      
      {/* แก้ไขโพสต์ */}
      {editingPost && (
        <CreatePostModal 
          modalType="edit"
          postId={editingPost.id}
          initialTitle={editingPost.title}
          initialContent={editingPost.content}
          initialImages={editingPost.images}
          onClose={() => setEditingPost(null)}
          onSuccess={() => {
            window.location.reload(); 
          }}
        />
      )}

      {/* รายงานโพสต์ */}
      {reportingPost && (
        <PostReportModal
          isOpen={!!reportingPost}
          postId={reportingPost.id}
          postTitle={reportingPost.title}
          onClose={() => setReportingPost(null)}
        />
      )}

    </div>
  );
}