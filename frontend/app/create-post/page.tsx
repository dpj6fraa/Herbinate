"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/app/components/Footer";
import Nav from "@/app/components/Nav";

export default function CreatePostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 Route Guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImages(e.target.files);
  }

  async function createPost() {
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    if (images) {
      Array.from(images).forEach((file) => {
        formData.append("images", file); // backend รับ key = images
      });
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8080/posts/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text || "เกิดข้อผิดพลาด");
        return;
      }

      router.push("/homepage"); // หรือหน้า feed ของคุณ
    } catch (err) {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-svh bg-white flex flex-col">
      <Nav />

      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-semibold text-black mb-4">
            สร้างโพสต์
          </h1>

          {/* Title */}
          <input
            type="text"
            placeholder="หัวข้อโพสต์"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-3 px-4 py-2 rounded-md bg-[#EEFFE5] focus:ring-2 focus:ring-[#71CE61]"
          />

          {/* Content */}
          <textarea
            placeholder="เขียนอะไรบางอย่าง..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full mb-3 px-4 py-2 rounded-md bg-[#EEFFE5] focus:ring-2 focus:ring-[#71CE61]"
          />

          {/* Images */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="mb-4"
          />

          <button
            onClick={createPost}
            disabled={loading}
            className="w-full py-3 bg-[#71CE61] text-white rounded-md font-semibold"
          >
            {loading ? "กำลังโพสต์..." : "โพสต์"}
          </button>

          {error && (
            <p className="mt-3 text-red-600 text-sm text-center">{error}</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
