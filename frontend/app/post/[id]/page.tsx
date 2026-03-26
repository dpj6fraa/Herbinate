"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import ReportPostModal from "@/app/components/forcommunity/ReportPostModal";
import CommentReportModal from "@/app/components/CommentReportModal"; // เพิ่มตัวนี้
import { ArrowLeft, Heart, Upload, Siren, X } from "lucide-react";
import PostReportModal from "@/app/components/PostreportModal";

type ImageItem = { url: string; order: number };

type PostDetail = {
  post: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    created_at?: string;
    username: string;
    profileImg: string;
    likes: number;
    comments: number;
    shares: number;
    liked?: boolean;
  };
  images: ImageItem[];
  comments: {
    id: string;
    user_id: string;
    username: string;
    profileImg: string;
    content: string;
    created_at: string;
  }[];
};

// Lightbox ดูรูปเต็มจอ
function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: ImageItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const base = "http://localhost:8080";

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        onClick={onClose}
      >
        <X className="w-8 h-8" />
      </button>

      {/* prev */}
      {current > 0 && (
        <button
          className="absolute left-4 text-white text-4xl font-light px-3 py-1 hover:text-gray-300 transition-colors"
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => c - 1); }}
        >
          ‹
        </button>
      )}

      <img
        src={`${base}${images[current].url}`}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />

      {/* next */}
      {current < images.length - 1 && (
        <button
          className="absolute right-4 text-white text-4xl font-light px-3 py-1 hover:text-gray-300 transition-colors"
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => c + 1); }}
        >
          ›
        </button>
      )}

      {/* dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === current ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Grid ภาพ Facebook-style
function PostImageGrid({
  images,
  onOpen,
}: {
  images: ImageItem[];
  onOpen: (i: number) => void;
}) {
  const base = "http://localhost:8080";
  const sorted = [...images].sort((a, b) => a.order - b.order);

  if (sorted.length === 0) return null;

  if (sorted.length === 1) {
    return (
      <img
        src={`${base}${sorted[0].url}`}
        className="w-full max-h-80 object-cover cursor-pointer"
        onClick={() => onOpen(0)}
      />
    );
  }

  if (sorted.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {sorted.map((img, i) => (
          <img
            key={i}
            src={`${base}${img.url}`}
            className="w-full h-52 object-cover cursor-pointer hover:brightness-95 transition-all"
            onClick={() => onOpen(i)}
          />
        ))}
      </div>
    );
  }

  if (sorted.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-0.5" style={{ gridTemplateRows: "auto auto" }}>
        <img
          src={`${base}${sorted[0].url}`}
          className="w-full object-cover cursor-pointer hover:brightness-95 transition-all"
          style={{ gridRow: "span 2", height: "100%" }}
          onClick={() => onOpen(0)}
        />
        <img
          src={`${base}${sorted[1].url}`}
          className="w-full h-[104px] object-cover cursor-pointer hover:brightness-95 transition-all"
          onClick={() => onOpen(1)}
        />
        <img
          src={`${base}${sorted[2].url}`}
          className="w-full h-[104px] object-cover cursor-pointer hover:brightness-95 transition-all"
          onClick={() => onOpen(2)}
        />
      </div>
    );
  }

  // 4+ ภาพ
  const shown = sorted.slice(0, 4);
  const extra = sorted.length - 4;
  return (
    <div className="grid grid-cols-2 gap-0.5">
      {shown.map((img, i) => (
        <div key={i} className="relative">
          <img
            src={`${base}${img.url}`}
            className="w-full h-40 object-cover cursor-pointer hover:brightness-95 transition-all"
            onClick={() => onOpen(i)}
          />
          {i === 3 && extra > 0 && (
            <div
              className="absolute inset-0 bg-black/55 flex items-center justify-center cursor-pointer"
              onClick={() => onOpen(3)}
            >
              <span className="text-white font-bold text-3xl">+{extra}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  
  // State สำหรับ Modals
  const [showReport, setShowReport] = useState(false);
  const [selectedComment, setSelectedComment] = useState<{id: string, content: string} | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8080/api/posts/detail?post_id=${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleLike() {
    if (!data) return;
    const token = localStorage.getItem("token");
    if (!token) { alert("กรุณาเข้าสู่ระบบ"); return; }
    const liked = data.post.liked;
    await fetch(
      `http://localhost:8080/api/posts/${liked ? "unlike" : "like"}?post_id=${id}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );
    setData((prev) =>
      prev ? {
        ...prev,
        post: { ...prev.post, liked: !liked, likes: liked ? prev.post.likes - 1 : prev.post.likes + 1 },
      } : prev
    );
  }

  async function sharePost() {
    if (!data) return;
    const token = localStorage.getItem("token");
    if (!token) { alert("กรุณาเข้าสู่ระบบ"); return; }
    const response = await fetch(
      `http://localhost:8080/api/posts/share?post_id=${id}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );
    const result = await response.json();
    await navigator.clipboard.writeText(`${window.location.origin}/post/${id}`);
    if (result.success) {
      alert("คัดลอกลิงก์โพสต์แล้ว!");
      setData((prev) =>
        prev ? { ...prev, post: { ...prev.post, shares: prev.post.shares + 1 } } : prev
      );
    } else {
      alert("คัดลอกลิงก์โพสต์แล้ว (คุณ share ไปแล้ว)");
    }
  }

  async function sendComment() {
    if (!commentText.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) { alert("กรุณาเข้าสู่ระบบ"); return; }
    try {
      setSending(true);
      const res = await fetch("http://localhost:8080/api/posts/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ post_id: id, content: commentText }),
      });
      if (!res.ok) { alert("ส่งคอมเมนต์ไม่สำเร็จ"); return; }
      const savedComment = await res.json();
      setData((prev) =>
        prev ? {
          ...prev,
          comments: [savedComment, ...prev.comments],
          post: { ...prev.post, comments: prev.post.comments + 1 },
        } : prev
      );
      setCommentText("");
    } finally {
      setSending(false);
    }
  }

  const LoadingOrError = ({ msg }: { msg: string }) => (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b-2 border-b-[#97DB8B]"><Nav /></div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 text-sm">{msg}</p>
      </div>
    </div>
  );

  if (loading) return <LoadingOrError msg="กำลังโหลด..." />;
  if (!data) return <LoadingOrError msg="ไม่พบโพสต์" />;

  const sortedImages = [...(data.images ?? [])].sort((a, b) => a.order - b.order);

return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 w-full bg-white z-50 shadow-sm border-b-2 border-b-[#97DB8B]">
        <Nav />
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 md:px-6 pt-5 pb-10 flex flex-col gap-4">
        {/* Post Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            {/* ปุ่มรายงานโพสต์ */}
            <button
              onClick={() => setShowReport(true)}
              className="p-2 -mr-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full active:scale-90 transition-all"
              title="รายงานโพสต์"
            >
              <Siren className="w-5 h-5" />
            </button>
          </div>

          {/* Author */}
          <div className="px-4 pb-3 flex items-center gap-3">
            {data.post.profileImg ? (
              <img
                src={`http://localhost:8080${data.post.profileImg}`}
                className="w-11 h-11 rounded-full object-cover shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-green-400 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                {data.post.username?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-[16px] text-black">{data.post.username}</span>
              <span className="text-green-600 font-medium text-[13px]">
                {new Date(data.post.created_at ?? data.post.createdAt).toLocaleString("th-TH")}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 pb-3">
            <h2 className="text-[18px] font-bold text-green-600 mb-2">{data.post.title}</h2>
            <p className="text-gray-800 text-[14px] leading-relaxed whitespace-pre-wrap">
              {data.post.content}
            </p>
          </div>

          {/* Images grid */}
          {sortedImages.length > 0 && (
            <PostImageGrid images={sortedImages} onOpen={(i) => setLightboxIndex(i)} />
          )}

          {/* Likes & Shares */}
          <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={toggleLike}
              className="flex items-center gap-1.5 p-2 -ml-2 rounded-lg hover:bg-red-50 active:scale-95 transition-all group/like"
            >
              <Heart className={`w-5 h-5 transition-transform duration-200 group-hover/like:scale-110 ${
                data.post.liked ? "text-red-500 fill-red-500" : "text-gray-400 fill-gray-400 group-hover/like:text-red-400"
              }`} />
              <span className={`font-bold text-sm transition-colors ${
                data.post.liked ? "text-red-500" : "text-gray-600 group-hover/like:text-red-500"
              }`}>{data.post.likes} ถูกใจ</span>
            </button>
            <button
              onClick={sharePost}
              className="flex items-center gap-1.5 p-2 -mr-2 rounded-lg hover:bg-blue-50 active:scale-95 transition-all group/share"
            >
              <Upload className="w-5 h-5 text-gray-400 transition-transform duration-200 group-hover/share:-translate-y-0.5 group-hover/share:text-blue-500" />
              <span className="font-bold text-sm text-gray-600 group-hover/share:text-blue-600 transition-colors">
                {data.post.shares} แชร์
              </span>
            </button>
          </div>
        </div>

        {/* Comment Section */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 px-4 py-5 mt-2">
          <h3 className="font-bold text-green-700 mb-4 text-[15px] border-b border-gray-200 pb-3">
            คอมเมนต์ ({data.post.comments})
          </h3>

          {/* Input */}
          <div className="flex gap-2 mb-5">
            <input
              type="text"
              placeholder="เพิ่มคอมเมนต์ของคุณ ..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendComment()}
              className="text-black flex-1 border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 text-sm outline-none bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
            />
            <button
              onClick={sendComment}
              disabled={sending}
              className="bg-[#6BB75B] hover:bg-[#5da84d] disabled:opacity-60 active:scale-95 text-white px-5 rounded-xl font-bold text-sm shadow-sm whitespace-nowrap transition-all"
            >
              {sending ? "กำลังส่ง..." : "ส่ง"}
            </button>
          </div>

        {/* List คอมเมนต์ */}
          <div className="flex flex-col gap-3">
            {data.comments.map((c) => (
              <div 
                key={c.id} 
                className="bg-white border border-gray-100 shadow-sm rounded-xl py-3 pl-3 pr-3 flex gap-2 items-start group"
              >
                {/* ส่วนรูปโปรไฟล์ - จะชิดขอบซ้ายมากขึ้นเพราะ pl-2 */}
                {c.profileImg ? (
                  <img
                    src={`http://localhost:8080${c.profileImg}`}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                    {c.username?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div className="flex flex-col flex-1 mt-0.5">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-green-700 text-[14px]">{c.username}</span>
                    
                  {/* ปุ่มรายงานคอมเมนต์ใหม่ (โชว์สีเทาตลอด เอาเมาส์ชี้เปลี่ยนเป็นสีแดง) */}
                  <button 
                    onClick={() => setSelectedComment({ id: c.id, content: c.content })}
                    className="p-1 text-gray-300 hover:text-red-400 transition-all"
                    title="รายงานคอมเมนต์"
                  >
                    <Siren className="w-4 h-4" />
                  </button>
                  </div>
                  <p className="text-gray-700 text-[14px] leading-relaxed mt-1">{c.content}</p>
                  <p className="text-gray-400 text-[11px] mt-1.5 font-medium">
                    {new Date(c.created_at).toLocaleString("th-TH")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={sortedImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Modals */}
      {showReport && (
        <PostReportModal
          isOpen={showReport}
          postId={id as string} // ส่ง postId ไปด้วย
          postTitle={data.post.title}
          onClose={() => setShowReport(false)}
        />
      )}

      {selectedComment && (
        <CommentReportModal
          isOpen={!!selectedComment}
          onClose={() => setSelectedComment(null)}
          commentId={selectedComment.id}
          commentContent={selectedComment.content}
        />
      )}
    </div>
  );
}