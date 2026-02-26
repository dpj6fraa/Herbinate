"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const API = "http://localhost:8080";

type Section = {
  title: string;
  content: string;
  position: number;
};

type Herb = {
  id: string;
  name: string;
  scientific_name: string;
  description: string; // ✅ เพิ่ม
  image_url: string;
  tags: string[];
  sections: Section[];
};

export default function HerbDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [herb, setHerb] = useState<Herb | null>(null);

  useEffect(() => {
    fetch(`${API}/herbs/${params.id}`)
      .then((res) => res.json())
      .then(setHerb);
  }, [params.id]);

  async function handleDelete() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Login ก่อน");
      return;
    }

    const res = await fetch(`${API}/herbs/${params.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) router.push("/herbs");
    else alert("ลบไม่สำเร็จ");
  }

  if (!herb) return <div className="p-6">Loading...</div>;

  // ✅ ต่อ base URL สำหรับรูปภาพ
  const imageURL = herb.image_url ? `${API}${herb.image_url}` : null;

  // ✅ sort sections ตาม position
  const sortedSections = [...(herb.sections ?? [])].sort(
    (a, b) => a.position - b.position
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {imageURL && (
        <img
          src={imageURL}
          alt={herb.name}
          className="w-full h-64 object-cover rounded"
        />
      )}

      <div>
        <h1 className="text-2xl font-bold">{herb.name}</h1>
        <p className="italic text-gray-500">{herb.scientific_name}</p>
      </div>

      {/* ✅ แสดง description */}
      {herb.description && (
        <p className="text-gray-700 leading-relaxed">{herb.description}</p>
      )}

      <div className="flex gap-2 flex-wrap">
        {herb.tags?.map((t, i) => (
          <span key={i} className="text-xs bg-green-100 px-2 py-1 rounded">
            {t}
          </span>
        ))}
      </div>

      <div className="space-y-4">
        {sortedSections.map((sec, i) => (
          <div key={i}>
            <h2 className="font-semibold text-lg mb-1">{sec.title}</h2>
            <p className="text-gray-700 whitespace-pre-line">{sec.content}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/herbs/${params.id}/edit`)}
          className="flex-1 bg-yellow-500 text-white py-2 rounded"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 bg-red-600 text-white py-2 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}