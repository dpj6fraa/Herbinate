"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon, GripVertical } from "lucide-react";

type CreatePostModalProps = {
  modalType: "create" | "edit";
  onClose: () => void;
  postId?: string;
  initialTitle?: string;
  initialContent?: string;
  // เพิ่มการรับ initialImages
  initialImages?: { url: string; order: number }[];
  onSuccess?: () => void;
};

// สร้าง Type เพื่อเก็บสถานะว่ารูปนี้เป็นรูปเก่า (ดึงจากเซิร์ฟเวอร์) หรือรูปใหม่ (เพิ่งเลือก)
type MediaItem = {
  id: string; // เอาไว้ใช้กับ key ตอนวนลูป
  isOld: boolean;
  url: string; // URL สำหรับพรีวิว (ถ้าเก่าคือ path เซิร์ฟเวอร์, ถ้าใหม่คือ blob url)
  file: File | null; // ถ้าเป็นรูปใหม่จะมี File ให้ส่งไป Backend
  originalUrl?: string; // เก็บ URL ดิบของรูปเก่า ไว้ส่งบอกเซิร์ฟเวอร์ว่ารูปนี้ยังอยู่
};

export default function CreatePostModal({ 
  modalType, 
  onClose, 
  postId, 
  initialTitle = "", 
  initialContent = "",
  initialImages = [],
  onSuccess 
}: CreatePostModalProps) {
  const router = useRouter();
  const baseApi = "http://localhost:8080";

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const MAX_IMAGES = 5;

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const imageInputRef = React.useRef<HTMLInputElement>(null);

  // โหลดรูปภาพเดิมถ้าเป็นโหมด Edit
  useEffect(() => {
    if (modalType === "edit" && initialImages.length > 0) {
      const oldMedia = initialImages
        .sort((a, b) => a.order - b.order)
        .map((img) => ({
          id: Math.random().toString(36).substring(7),
          isOld: true,
          url: `${baseApi}${img.url}`,
          file: null,
          originalUrl: img.url,
        }));
      setMedia(oldMedia);
    }
  }, [modalType, initialImages]);

  // ล้าง Blob URL เมื่อ Component ถูก unmount ป้องกัน Memory Leak
  useEffect(() => {
    return () => {
      media.forEach((m) => {
        if (!m.isOld) URL.revokeObjectURL(m.url);
      });
    };
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    
    if (media.length + selected.length > MAX_IMAGES) {
      setError(`อัปโหลดได้สูงสุด ${MAX_IMAGES} รูป`);
      return;
    }

    const newMediaItems = selected.map((file) => ({
      id: Math.random().toString(36).substring(7),
      isOld: false,
      url: URL.createObjectURL(file),
      file: file,
    }));

    setMedia((prev) => [...prev, ...newMediaItems]);
    setError("");
    e.target.value = "";
  }

  function removeImage(index: number) {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }

  // Drag-to-reorder
  function onDragStart(index: number) { setDragIndex(index); }
  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setMedia((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  }
  function onDragEnd() { setDragIndex(null); }

  async function handleSubmit() {
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

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      if (modalType === "create") {
        // ========== โหมดสร้างโพสต์ ==========
        media.forEach((m) => {
          if (m.file) formData.append("images", m.file);
        });

        const res = await fetch(`${baseApi}/api/posts/create`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการสร้างโพสต์");
        const data = await res.json();
        onClose();
        router.push(`/post/${data.post_id}`);

      } else if (modalType === "edit") {
        // ========== โหมดแก้ไขโพสต์ ==========
        if (!postId) throw new Error("ไม่พบรหัสโพสต์");
        formData.append("post_id", postId);

        // ส่งบอก Backend ว่ารูปเก่ารูปไหนยังอยู่ (เรียงตามลำดับปัจจุบัน)
        // ถ้าผู้ใช้ลบรูปไหนออก มันก็จะไม่ถูกส่งไป Backend จะได้ลบออกจาก Database
        media.forEach((m, index) => {
          if (m.isOld && m.originalUrl) {
            formData.append("kept_images", m.originalUrl); // ส่ง path เดิมกลับไป
          } else if (m.file) {
            formData.append("new_images", m.file); // ส่งไฟล์ใหม่ไป
          }
          // *หมายเหตุ*: การจัดการ "ลำดับผสม (เก่าสลับใหม่)" ในฝั่ง Backend อาจจะซับซ้อนขึ้น 
          // แนะนำให้ Backend ลบรูปเก่าที่ไม่ได้อยู่ใน kept_images ทิ้ง แล้วอัปเดต/เพิ่มรูปตามข้อมูลที่รับมาครับ
        });

        const res = await fetch(`${baseApi}/api/posts/edit`, {
          method: "PUT", // เปลี่ยนไปใช้ PUT แบบ FormData แทน JSON
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) throw new Error("แก้ไขโพสต์ไม่สำเร็จ");
        onClose();
        if (onSuccess) onSuccess();
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white rounded-[16px] w-full max-w-sm flex flex-col shadow-2xl relative overflow-hidden ring-2 ring-[#6BB75B]/80 transform transition-all">

        {/* ... (Header, ช่องใส่หัวข้อ และเนื้อหา โค้ดส่วนนี้เหมือนเดิมเลยครับ) ... */}

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          {/* หัวข้อ */}
          <div className="flex items-center gap-3 group">
            <label className="text-[14px] font-bold text-gray-600 whitespace-nowrap group-focus-within:text-green-600 transition-colors">หัวข้อ :</label>
            <input type="text" placeholder="เพิ่มหัวข้อของคุณ ..." value={title} onChange={(e) => setTitle(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 flex-1 text-sm outline-none text-gray-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all" />
          </div>

          {/* เนื้อหา */}
          <div className="flex flex-col group">
            <label className="text-[14px] font-bold text-gray-600 mb-2 group-focus-within:text-green-600 transition-colors">เนื้อหา :</label>
            <textarea rows={5} placeholder="เพิ่มเนื้อหาของคุณ ..." value={content} onChange={(e) => setContent(e.target.value)} className="border border-gray-300 rounded-lg w-full p-3 text-sm outline-none resize-none text-gray-800 leading-relaxed focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all custom-scrollbar" />
          </div>

          {/* พรีวิวรูปภาพ (ปลดล็อคให้แสดงทั้ง Create และ Edit) */}
          {media.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">
                เลือกแล้ว <span className="text-green-600 font-bold">{media.length}</span> / {MAX_IMAGES} รูป
                <span className="text-gray-400 text-xs ml-1">(ลากเพื่อเรียงลำดับ)</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {media.map((m, index) => (
                  <div key={m.id} draggable onDragStart={() => onDragStart(index)} onDragOver={(e) => onDragOver(e, index)} onDragEnd={onDragEnd} className="relative rounded-lg overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing border-transparent hover:border-green-300">
                    <img src={m.url} alt={`preview-${index}`} className="w-full h-20 object-cover" />
                    <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors">
                      <X className="w-3 h-3 stroke-[3]" />
                    </button>
                    <div className="absolute bottom-1 right-1 text-white/70">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>

{/* Footer / Toolbar */}
        <div className="px-5 pb-5 pt-2 flex justify-between items-center bg-gray-50/50 border-t border-gray-100">
          <span className="text-[13px] text-gray-400 font-medium">
            จำนวน <span className="text-green-600 font-bold">{content.length}</span> ตัวอักษร
          </span>

          <div className="flex items-center gap-4 text-gray-600">
            {/* ปุ่มอัปโหลดรูป */}
            <div>
              <input ref={imageInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              <button onClick={() => imageInputRef.current?.click()} className="p-2 rounded-full hover:bg-green-100 hover:text-green-600 active:scale-90 transition-all duration-200 flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>

            {/* กลุ่มปุ่ม Action (ยกเลิก / บันทึก) */}
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="bg-gray-200 hover:bg-gray-300 disabled:opacity-60 text-gray-700 px-4 h-[40px] flex items-center justify-center rounded-lg font-bold text-[14px] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 tracking-wide"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#6BB75B] hover:bg-[#5da84d] disabled:opacity-60 text-white px-4 h-[40px] flex items-center justify-center rounded-lg font-bold text-[14px] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 tracking-wide"
              >
                {loading ? "กำลังบันทึก..." : modalType === "edit" ? "บันทึก" : "โพสต์"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}