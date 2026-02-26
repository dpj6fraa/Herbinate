"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:8080";

type Article = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API}/articles`)
      .then((res) => res.json())
      .then(setArticles);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📄 Articles</h1>
        <button
          onClick={() => router.push("/articles/create")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Create
        </button>
      </div>

      <div className="space-y-6">
        {articles?.map((a) => (
          <div
            key={a.id}
            onClick={() => router.push(`/articles/${a.id}`)}
            className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
          >
            {a.image_url && (
              <img
                src={`${API}${a.image_url}`}
                alt={a.title}
                className="w-full h-48 object-cover rounded mb-3"
              />
            )}
            <p className="text-lg font-semibold">{a.title}</p>
            {a.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {a.description}
              </p>
            )}
            <div className="flex gap-2 mt-3 flex-wrap">
              {a.tags?.map((t, i) => (
                <span key={i} className="text-xs bg-blue-100 px-2 py-1 rounded">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}