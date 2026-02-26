"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const API = "http://localhost:8080";

type Section = { title: string; content: string; position: number };

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(false);

  // โหลดข้อมูลเดิม
  useEffect(() => {
    fetch(`${API}/articles/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setTagsInput((data.tags ?? []).join(", "));
        setSections(
          (data.sections ?? []).sort(
            (a: Section, b: Section) => a.position - b.position
          )
        );
        setExistingImage(data.image_url ?? "");
      });
  }, [params.id]);

  function addSection() {
    setSections([...sections, { title: "", content: "", position: sections.length }]);
  }

  function removeSection(i: number) {
    setSections(sections.filter((_, idx) => idx !== i));
  }

  function updateSection(i: number, field: keyof Section, value: string) {
    const updated = [...sections];
    updated[i] = { ...updated[i], [field]: value };
    setSections(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) { alert("กรุณา Login ก่อน"); setLoading(false); return; }

    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const sectionsWithPosition = sections.map((s, i) => ({ ...s, position: i }));

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", JSON.stringify(tags));
    formData.append("sections", JSON.stringify(sectionsWithPosition));
    if (image) formData.append("image", image);

    const res = await fetch(`${API}/articles/${params.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    setLoading(false);
    if (res.ok) router.push(`/articles/${params.id}`);
    else {
      const err = await res.json();
      alert("เกิดข้อผิดพลาด: " + (err.error ?? "unknown"));
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">✏️ แก้ไข Article</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">ชื่อบทความ *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">คำอธิบาย</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tags <span className="text-gray-400 text-xs">(คั่นด้วย ,)</span>
          </label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

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
                  placeholder="หัวข้อ"
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
            className="mt-2 text-sm text-blue-700 hover:underline"
          >
            + เพิ่ม Section
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">รูปภาพ</label>
          {existingImage && !image && (
            <img
              src={`${API}${existingImage}`}
              alt="current"
              className="mb-2 h-40 object-cover rounded"
            />
          )}
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

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border py-2 rounded text-gray-600"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </div>
  );
}