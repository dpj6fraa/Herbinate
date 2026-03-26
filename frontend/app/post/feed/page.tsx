"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import CreatePostModal from "../../components/forcommunity/CreatePostModal";
import {
  Search,
  Filter,
  Heart,
  MessageCircle,
  Upload,
  Plus,
} from "lucide-react";

type FeedPost = {
  id: string;
  title: string;
  content: string;
  username: string;
  profileImg?: string; // เพิ่มฟิลด์สำหรับรูป Profile
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
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8080/api/posts/feed", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then(setPosts);
  }, []);

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
    if (!token) { alert("กรุณาเข้าสู่ระบบ"); return; }

    const response = await fetch(
      `http://localhost:8080/api/posts/share?post_id=${postID}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    await navigator.clipboard.writeText(`${window.location.origin}/post/${postID}`);

    if (data.success) {
      alert("คัดลอกลิงก์โพสต์แล้ว!");
      setPosts((prev) =>
        prev.map((p) => (p.id === postID ? { ...p, shares: p.shares + 1 } : p))
      );
    } else {
      alert("คัดลอกลิงก์โพสต์แล้ว (คุณ share ไปแล้ว)");
    }
  }

  // แสดงภาพในการ์ด — สไตล์ Facebook album
  function PostImages({ post }: { post: FeedPost }) {
    // รองรับทั้ง images[] และ image (fallback)
    const sorted = post.images?.length
      ? [...post.images].sort((a, b) => a.order - b.order)
      : post.image
      ? [{ url: post.image, order: 0 }]
      : [];

    if (sorted.length === 0) return null;

    const base = "http://localhost:8080";

    if (sorted.length === 1) {
      return (
        <img
          src={`${base}${sorted[0].url}`}
          className="w-full max-h-72 object-cover"
        />
      );
    }

    if (sorted.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-0.5">
          {sorted.map((img, i) => (
            <img key={i} src={`${base}${img.url}`} className="w-full h-44 object-cover" />
          ))}
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

    // 4+ ภาพ — แสดง 4 แรก + overlay "+N"
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

const renderPostCard = (post: FeedPost) => (
    <div
      key={post.id}
      onClick={() => router.push(`/post/${post.id}`)} // ย้าย onClick มาที่ตัวการ์ดหลัก
      className="mb-4 border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer" // เพิ่ม cursor-pointer
    >
      {/* Header */}
      <div className="bg-[#D9F2C7] px-4 py-3 flex items-center gap-3 transition-colors duration-300 group-hover:bg-[#cbeba3]">
        {post.profileImg ? (
          <img
            src={`http://localhost:8080${post.profileImg}`} // ตรวจสอบว่า path รูปถูกต้อง
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

      {/* Text content */}
      <div className="px-4 pt-3 pb-2"> {/* ลบ onClick เดิมออก */}
        <h3 className="font-bold text-green-600 mb-1 leading-tight text-[15px] group-hover:text-green-700 transition-colors">
          {post.title}
        </h3>
        <p className="text-[13px] text-gray-700 leading-snug line-clamp-2">
          {post.content}
        </p>
      </div>

      {/* Images (full-bleed, no padding) */}
      <div className="overflow-hidden"> {/* ลบ onClick เดิมออก */}
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

          {/* ปุ่มคอมเมนต์ไม่ต้องมี onClick เพื่อเปลี่ยนหน้าแล้ว เพราะกดการ์ดก็ไปหน้า details อยู่ดี (หรือจะเก็บไว้แล้วใส่ stopPropagation ก็ได้) */}
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

  return (
    <div className="min-h-screen bg-white flex flex-col w-full relative">

      {/* Nav */}
      <div className="w-full sticky top-0 z-50 shadow-sm bg-white">
        <Nav />
      </div>

      {/* content wrapper — กว้างขึ้นบน desktop */}
      <main className="w-full max-w-2xl mx-auto flex-1 flex flex-col px-4 md:px-6 pt-5 pb-6">

        {/* Search & Filter — มุมโค้ง */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3 mb-4 flex gap-2 items-center border border-gray-100">
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder="ค้นหาโพสต์"
              className="w-full border border-gray-200 rounded-full pl-4 pr-10 py-1.5 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-300 bg-gray-50"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-500 transition-colors" />
          </div>
          <button className="border border-gray-200 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 whitespace-nowrap bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all">
            <Filter className="w-[14px] h-[14px]" /> ทุกหมวดหมู่
          </button>
        </div>

        {/* Posts */}
        <div>{posts.map(renderPostCard)}</div>
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-[#71CE61] hover:bg-[#5da84d] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-90 transition-all duration-300 z-50 group"
      >
        <Plus className="w-8 h-8 transition-transform duration-300 group-hover:rotate-90" />
      </button>

      <Footer />

      {showCreate && (
        <CreatePostModal modalType="create" onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}