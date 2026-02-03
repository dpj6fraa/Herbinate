"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

type FeedPost = {
  id: string;
  title: string;
  content: string;
  username: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean; // ⭐ เพิ่ม
};


export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const router = useRouter();
  

useEffect(() => {
  const token = localStorage.getItem("token");
  
  fetch("http://localhost:8080/posts/feed", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
    .then((res) => res.json())
    .then(setPosts);
}, []);


  async function toggleLike(postID: string, liked?: boolean) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("กรุณาเข้าสู่ระบบ");
    return;
  }

  const url = liked
    ? `http://localhost:8080/posts/unlike?post_id=${postID}`
    : `http://localhost:8080/posts/like?post_id=${postID}`;

  await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  setPosts((prev) =>
    prev.map((p) =>
      p.id === postID
        ? {
            ...p,
            liked: !liked,
            likes: liked ? p.likes - 1 : p.likes + 1,
          }
        : p
    )
  );
}

// ถ้าต้องการให้แสดงว่า share ไปแล้ว
async function sharePost(postID: string) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("กรุณาเข้าสู่ระบบ");
    return;
  }

  const response = await fetch(`http://localhost:8080/posts/share?post_id=${postID}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();

  // 📋 copy link
  const url = `${window.location.origin}/post/${postID}`;
  await navigator.clipboard.writeText(url);

  if (data.success) {
    // ✅ Share สำเร็จครั้งแรก - เพิ่มตัวเลข
    alert("คัดลอกลิงก์โพสต์แล้ว!");
    
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postID ? { ...p, shares: p.shares + 1 } : p
      )
    );
  } else {
    // ❌ Share ซ้ำ - ไม่เพิ่มตัวเลข แค่คัดลอกลิงก์
    alert("คัดลอกลิงก์โพสต์แล้ว (คุณ share ไปแล้ว)");
  }
}


  return (
    <div className="min-h-svh bg-white flex flex-col">
      <Nav />

      <div className="flex-1 max-w-xl mx-auto px-4 py-6 space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            {/* User */}
            <p className="text-sm text-gray-500 mb-1">
              {post.username} •{" "}
              {new Date(post.createdAt).toLocaleString()}
            </p>

            {/* Title */}
            <h2
              onClick={() => router.push(`/post/${post.id}`)}
              className="font-bold text-lg text-black cursor-pointer"
            >
              {post.title}
            </h2>

            {/* Content */}
            <p className="text-sm text-gray-700 mb-3 line-clamp-3">
              {post.content}
            </p>

            {/* Actions */}
            <div className="flex justify-between text-sm text-gray-600 border-t pt-2">
                <button
                  onClick={() => toggleLike(post.id, post.liked)}
                  className={post.liked ? "text-green-600 font-semibold" : ""}
                >
                  👍 {post.likes}
                </button>

              <button onClick={() => router.push(`/post/${post.id}`)}>
                💬 {post.comments}
              </button>

                <button onClick={() => sharePost(post.id)}>
                  ↪ {post.shares}
                </button>
            </div>
          </div>
        ))}
      </div>
      {/* ➕ Floating Create Post */}
        <button
          onClick={() => router.push("/create-post")}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#71CE61] text-white text-3xl shadow-lg flex items-center justify-center"
        >
          +
        </button>
      <Footer />
    </div>
  );
}
