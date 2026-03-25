"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "../../components/Nav";

interface Article {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image_url: string;
  created_at: string;
}

export default function SavedArticlesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ทั้งหมด");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:8080/api/articles/bookmarks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("failed to fetch bookmarks");
        return res.json();
      })
      .then((data) => {
        setArticles(data || []);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const allTags = Array.from(new Set(articles.flatMap(a => a.tags || [])));
  const filters = ["ทั้งหมด", ...allTags];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.includes(searchQuery);
    const matchesFilter = activeFilter === "ทั้งหมด" || (article.tags && article.tags.includes(activeFilter));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-svh bg-white flex flex-col pb-8">
      <Nav />
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-6 sticky top-0 bg-white z-10">
        <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-2xl font-medium text-black">บทความที่บันทึก</h1>
      </div>

      <div className="px-5">
        {/* Search */}
        <div className="relative mb-5">
          <input
            type="text"
            placeholder="ค้นหาบทความ"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-6 pr-10 py-2.5 bg-white border border-gray-400 rounded-full text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-gray-800 placeholder-gray-400"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-black">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors cursor-pointer ${activeFilter === filter
                ? "border-gray-600 text-gray-800 font-medium"
                : "border-gray-400 text-gray-600 hover:border-gray-500"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Articles List */}
        <div className="flex flex-col gap-4 mt-2">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-[3px] border-green-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredArticles.length > 0 ? (
            filteredArticles.map(article => (
              <div key={article.id} className="bg-[#EEFFE5] border border-[#d2eac5] rounded-xl overflow-hidden flex flex-col">
                <div className="p-3 flex gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white shrink-0 border border-green-100 flex items-center justify-center">
                    <img src={article.image_url ? (article.image_url.startsWith('http') ? article.image_url : `http://localhost:8080${article.image_url}`) : "/default_profile_picture.png"} alt={article.title} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 flex flex-col justify-start pt-1">
                    <h3 className="text-sm font-medium text-gray-900 leading-snug pr-1">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      {article.tags && article.tags.length > 0 ? (
                        <span className="bg-[#CFF3C5] text-black text-[11px] px-2.5 py-0.5 rounded-full border border-green-200">
                          {article.tags[0]}
                        </span>
                      ) : (
                        <span className="bg-[#CFF3C5] text-black text-[11px] px-2.5 py-0.5 rounded-full border border-green-200 opacity-0">
                          ไม่มีแท็ก
                        </span>
                      )}
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => router.push(`/articles/${article.id}`)} className="bg-[#71CE61] text-white text-[12px] px-3 py-1 rounded-md hover:bg-[#61b852] transition-colors flex items-center shadow-sm cursor-pointer">
                          View
                        </button>
                        <button className="bg-[#71CE61] text-white text-[12px] px-2.5 py-1 rounded-md hover:bg-[#61b852] transition-colors flex items-center gap-1 shadow-sm cursor-pointer">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#e4F8D3] px-4 py-2 text-[12px] text-gray-500 border-t border-[#d2eac5]">
                  {new Date(article.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">ไม่มีบทความที่บันทึกไว้</div>
          )}
        </div>
      </div>
    </div>
  );
}
