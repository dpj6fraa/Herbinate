"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

type PostDetail = {
  post: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    username: string;
    profileImg: string;
    likes: number;
    comments: number;
    shares: number;
  };
  images: {
    url: string;
    order: number;   // 👈 เพิ่ม
  }[];
    comments: {
      id: string;
      user_id: string;
      username: string;
      profileImg: string;
      content: string;
      created_at: string;
  }[];
};


export default function PostDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);


  useEffect(() => {
    fetch(`http://localhost:8080/posts/detail?post_id=${id}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-4">กำลังโหลด...</p>;
  if (!data) return <p className="p-4">ไม่พบโพสต์</p>;

  async function sendComment() {
  if (!commentText.trim()) return;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("กรุณาเข้าสู่ระบบ");
    return;
  }

  try {
    setSending(true);

    const res = await fetch("http://localhost:8080/posts/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        post_id: id,
        content: commentText,
      }),
    });

    if (!res.ok) {
      alert("ส่งคอมเมนต์ไม่สำเร็จ");
      return;
    }

    // ⭐ รีโหลดเฉพาะคอมเมนต์
    const savedComment = await res.json();

    setData((prev) =>
      prev
        ? {
            ...prev,
            comments: [savedComment, ...prev.comments],
            post: { ...prev.post, comments: prev.post.comments + 1 },
          }
        : prev
    );

    setCommentText("");
  } finally {
    setSending(false);
  }
}

  return (
    <div className="min-h-svh bg-white flex flex-col">
      <Nav />

      <div className="flex-1 px-4 py-6 max-w-xl mx-auto">

        {/* 👤 User */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={`http://localhost:8080${data.post.profileImg}`}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-black">{data.post.username}</p>
            <p className="text-xs text-gray-500">
              {new Date(data.post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 📝 Title */}
        <h1 className="text-xl font-bold text-black mb-2">
          {data.post.title}
        </h1>

        {/* 📄 Content */}
        <p className="text-black mb-4 whitespace-pre-line">
          {data.post.content}
        </p>

        {/* 🖼 Images */}
        {data.images?.length > 0 && (
          <div className="space-y-3 mb-4">
            {data.images
              .sort((a, b) => a.order - b.order)   // 👈 ใช้ position
              .map((img, i) => (
                <img
                  key={i}
                  src={`http://localhost:8080${img.url}`}
                  className="rounded-lg w-full"
                />
              ))}
          </div>
        )}


        {/* 📊 Stats */}
        <div className="flex justify-between text-sm text-gray-600 border-y py-2 mb-4">
          <span>👍 {data.post.likes}</span>
          <span>💬 {data.post.comments}</span>
          <span>↪ {data.post.shares}</span>
        </div>

      </div>
      {/* 💬 Comment Box */}
<div className="mb-6">
  <div className="flex gap-2">
    <input
      type="text"
      placeholder="เขียนคอมเมนต์..."
      value={commentText}
      onChange={(e) => setCommentText(e.target.value)}
      className="flex-1 px-3 py-2 rounded-md bg-[#EEFFE5] text-black focus:ring-2 focus:ring-[#71CE61]"
    />
    <button
      onClick={sendComment}
      disabled={sending}
      className="px-4 py-2 bg-[#71CE61] text-white rounded-md text-sm"
    >
      ส่ง
    </button>
  </div>
</div>

{/* 📜 Comment List */}
<div className="space-y-4">
  {data.comments.length === 0 && (
    <p className="text-sm text-gray-500 text-center">ยังไม่มีคอมเมนต์</p>
  )}

{data.comments.map((c) => (
  <div key={c.id} className="bg-[#F5F5F5] p-3 rounded-lg">
    <div className="flex items-center gap-2 mb-1">
      <img
        src={`http://localhost:8080${c.profileImg}`}
        className="w-7 h-7 rounded-full object-cover"
      />
      <span className="text-sm font-semibold">{c.username}</span>
    </div>

    <p className="text-sm text-black">{c.content}</p>

    <p className="text-xs text-gray-500 mt-1">
      {new Date(c.created_at).toLocaleString()}
    </p>
  </div>
))}

</div>


      <Footer />
    </div>
  );
}
