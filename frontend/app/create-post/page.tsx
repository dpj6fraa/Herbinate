"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/app/components/Footer";
import Nav from "@/app/components/Nav";

export default function CreatePostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const MAX_IMAGES = 5;

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
    if (!e.target.files) return;

    const selected = Array.from(e.target.files);

    if (images.length + selected.length > MAX_IMAGES) {
      setError(`อัปโหลดได้สูงสุด ${MAX_IMAGES} รูป`);
      return;
    }

    setImages((prev) => [...prev, ...selected]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
      images.forEach((file) => {
        formData.append("images", file);
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

          {images.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                เลือกแล้ว {images.length} / {MAX_IMAGES} รูป
              </p>

              <div className="space-y-2">
                {images.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md"
                  >
                    <span className="text-sm text-black truncate w-40">
                      {file.name}
                    </span>
                
                    <button
                      onClick={() => removeImage(index)}
                      className="text-red-500 text-sm"
                    >
                      ลบ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
