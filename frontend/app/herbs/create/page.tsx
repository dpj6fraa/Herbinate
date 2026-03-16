"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Section = {
  title: string;
  content: string;
  position: number;
};

export default function CreateHerbPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [scientific, setScientific] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [sections, setSections] = useState<Section[]>([
    { title: "", content: "", position: 0 },
  ]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  function addSection() {
    setSections([
      ...sections,
      { title: "", content: "", position: sections.length },
    ]);
  }

  function removeSection(index: number) {
    setSections(sections.filter((_, i) => i !== index));
  }

  function updateSection(index: number, field: keyof Section, value: string) {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("กรุณา Login ก่อน");
      setLoading(false);
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const sectionsWithPosition = sections.map((s, i) => ({
      ...s,
      position: i,
    }));

    const formData = new FormData();
    formData.append("name", name);
    formData.append("scientific_name", scientific);
    formData.append("description", description);
    formData.append("tags", JSON.stringify(tags));
    formData.append("sections", JSON.stringify(sectionsWithPosition));
    if (image) formData.append("image", image);

    const res = await fetch("http://localhost:8080/herbs", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    setLoading(false);

    if (res.ok) {
      router.push("/herbs");
    } else {
      const err = await res.json();
      alert("เกิดข้อผิดพลาด: " + (err.error ?? "unknown"));
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🌿 เพิ่มสมุนไพรใหม่</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ชื่อ */}
        <div>
          <label className="block text-sm font-medium mb-1">ชื่อสมุนไพร *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="เช่น ขมิ้นชัน"
          />
        </div>

        {/* ชื่อวิทยาศาสตร์ */}
        <div>
          <label className="block text-sm font-medium mb-1">ชื่อวิทยาศาสตร์</label>
          <input
            value={scientific}
            onChange={(e) => setScientific(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="เช่น Curcuma longa"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">คำอธิบาย</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border rounded px-3 py-2"
            placeholder="อธิบายสมุนไพรโดยย่อ..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tags <span className="text-gray-400 text-xs">(คั่นด้วย ,)</span>
          </label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="เช่น ต้านอักเสบ, บำรุงตับ"
          />
        </div>

        {/* Sections */}
        <div>
          <label className="block text-sm font-medium mb-2">Sections</label>
          <div className="space-y-3">
            {sections.map((sec, i) => (
              <div key={i} className="border rounded p-3 space-y-2 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Section {i + 1}</span>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(i)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      ลบ
                    </button>
                  )}
                </div>
                <input
                  value={sec.title}
                  onChange={(e) => updateSection(i, "title", e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="หัวข้อ เช่น สรรพคุณ"
                />
                <textarea
                  value={sec.content}
                  onChange={(e) => updateSection(i, "content", e.target.value)}
                  rows={3}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="เนื้อหา..."
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSection}
            className="mt-2 text-sm text-green-700 hover:underline"
          >
            + เพิ่ม Section
          </button>
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium mb-1">รูปภาพ</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="preview"
              className="mt-2 h-40 object-cover rounded"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </form>
    </div>
  );
}