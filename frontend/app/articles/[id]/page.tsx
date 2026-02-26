"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const API = "http://localhost:8080";

type Section = { title: string; content: string; position: number };

type Article = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
  sections: Section[];
};

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    fetch(`${API}/articles/${params.id}`)
      .then((res) => res.json())
      .then(setArticle);
  }, [params.id]);

  async function handleDelete() {
    const token = localStorage.getItem("token");
    if (!token) { alert("Login ก่อน"); return; }

    const res = await fetch(`${API}/articles/${params.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) router.push("/articles");
    else alert("ลบไม่สำเร็จ");
  }

  if (!article) return <div className="p-6">Loading...</div>;

  const imageURL = article.image_url ? `${API}${article.image_url}` : null;
  const sortedSections = [...(article.sections ?? [])].sort(
    (a, b) => a.position - b.position
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {imageURL && (
        <img src={imageURL} alt={article.title}
          className="w-full h-64 object-cover rounded" />
      )}

      <div>
        <h1 className="text-2xl font-bold">{article.title}</h1>
      </div>

      {article.description && (
        <p className="text-gray-600 leading-relaxed">{article.description}</p>
      )}

      <div className="flex gap-2 flex-wrap">
        {article.tags?.map((t, i) => (
          <span key={i} className="text-xs bg-blue-100 px-2 py-1 rounded">{t}</span>
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
          onClick={() => router.push(`/articles/${params.id}/edit`)}
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