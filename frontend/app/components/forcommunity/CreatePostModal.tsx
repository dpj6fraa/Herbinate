import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon, GripVertical } from "lucide-react";

type CreatePostModalProps = {
  modalType: "create" | "edit";
  onClose: () => void;
};

export default function CreatePostModal({ modalType, onClose }: CreatePostModalProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const MAX_IMAGES = 5;

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const imageInputRef = React.useRef<HTMLInputElement>(null);

  // สร้าง / ล้าง object URLs เมื่อ images เปลี่ยน
  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [images]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    if (images.length + selected.length > MAX_IMAGES) {
      setError(`อัปโหลดได้สูงสุด ${MAX_IMAGES} รูป`);
      return;
    }
    setImages((prev) => [...prev, ...selected]);
    setError("");
    e.target.value = ""; // reset เพื่อให้เลือกไฟล์เดิมซ้ำได้
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  // Drag-to-reorder
  function onDragStart(index: number) {
    setDragIndex(index);
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  }

  function onDragEnd() {
    setDragIndex(null);
  }

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

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    images.forEach((file) => formData.append("images", file));

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8080/api/posts/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text || "เกิดข้อผิดพลาด");
        return;
      }

      const data = await res.json();
      onClose();
      router.push(`/post/${data.post_id}`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white rounded-[16px] w-full max-w-sm flex flex-col shadow-2xl relative overflow-hidden ring-2 ring-[#6BB75B]/80 transform transition-all">

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100 bg-white">
          <div className="font-bold text-lg text-green-600 text-center w-full">
            {modalType === "create" ? "สร้างโพสต์ใหม่" : "แก้ไขโพสต์ของคุณ"}
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1.5 transition-all duration-300 hover:rotate-90 active:scale-90"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          {/* หัวข้อ */}
          <div className="flex items-center gap-3 group">
            <label className="text-[14px] font-bold text-gray-600 whitespace-nowrap group-focus-within:text-green-600 transition-colors">
              หัวข้อ :
            </label>
            <input
              type="text"
              placeholder="เพิ่มหัวข้อของคุณ ..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 flex-1 text-sm outline-none text-gray-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
            />
          </div>

          {/* เนื้อหา */}
          <div className="flex flex-col group">
            <label className="text-[14px] font-bold text-gray-600 mb-2 group-focus-within:text-green-600 transition-colors">
              เนื้อหา :
            </label>
            <textarea
              rows={5}
              placeholder="เพิ่มเนื้อหาของคุณ ..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border border-gray-300 rounded-lg w-full p-3 text-sm outline-none resize-none text-gray-800 leading-relaxed focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all custom-scrollbar"
            />
          </div>

          {/* พรีวิวรูปภาพ + drag-to-reorder */}
          {images.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">
                เลือกแล้ว{" "}
                <span className="text-green-600 font-bold">{images.length}</span>{" "}
                / {MAX_IMAGES} รูป{" "}
                <span className="text-gray-400 text-xs">(ลากเพื่อเรียงลำดับ)</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {previews.map((url, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragOver={(e) => onDragOver(e, index)}
                    onDragEnd={onDragEnd}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing
                      ${dragIndex === index
                        ? "border-green-400 opacity-50 scale-95"
                        : "border-transparent hover:border-green-300"
                      }`}
                  >
                    <img
                      src={url}
                      alt={`preview-${index}`}
                      className="w-full h-20 object-cover"
                    />
                    {/* เลขลำดับ */}
                    <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </div>
                    {/* ปุ่มลบ */}
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 stroke-[3]" />
                    </button>
                    {/* grip icon */}
                    <div className="absolute bottom-1 right-1 text-white/70">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </div>

        {/* Footer / Toolbar */}
        <div className="px-5 pb-5 pt-2 flex justify-between items-center bg-gray-50/50 border-t border-gray-100">
          <span className="text-[13px] text-gray-400 font-medium">
            จำนวน{" "}
            <span className="text-green-600 font-bold">{content.length}</span>{" "}
            ตัวอักษร
          </span>

          <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
            {/* Hidden file input */}
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* ปุ่มอัพโหลดรูป */}
            <button
              onClick={() => imageInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-green-100 hover:text-green-600 active:scale-90 transition-all duration-200"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* ปุ่ม Post / Save */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="ml-2 bg-[#6BB75B] hover:bg-[#5da84d] disabled:opacity-60 text-white px-5 py-2 rounded-lg font-bold text-[14px] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 tracking-wide"
            >
              {loading ? "กำลังโพสต์..." : modalType === "edit" ? "บันทึก" : "โพสต์"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}