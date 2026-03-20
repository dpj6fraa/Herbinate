"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import ArticleReportModal from "../../components/ArticlereportModal";

const API = "http://localhost:8080";

type Section = {
  title: string;
  content: string;
  position: number;
};

type Article = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
  sections: Section[];
};

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/articles/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-svh bg-white flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            {/* ปรับสี Spinner เป็นสีเขียว */}
            <div className="w-8 h-8 border-[3px] border-green-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">กำลังโหลด...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-svh bg-white flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-gray-500">ไม่พบบทความ</p>
          <button
            onClick={() => router.push("/articles")}
            className="text-sm text-green-600 underline" // ปรับเป็นสีเขียว
          >
            กลับหน้ารายการ
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  const imageURL = article.image_url ? `${API}${article.image_url}` : null;
  const sortedSections = [...(article.sections ?? [])].sort(
    (a, b) => a.position - b.position
  );

  return (
    <main className="min-h-svh bg-white flex flex-col">
      <Nav />

      <div className="flex-1 flex flex-col pt-4 lg:items-center">
        <div className="max-w-2xl mx-auto bg-white min-h-screen pb-10">

          {/* รูปภาพ */}
          <div className="w-full aspect-video overflow-hidden rounded-xl shadow-lg bg-gray-100">
            {imageURL ? (
              <img
                src={imageURL}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            )}
          </div>

          {/* ชื่อ + ปุ่ม Report */}
          <div className="px-6 pt-6 flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h1 className="text-2xl font-bold text-gray-800 leading-snug">
                {article.title}
              </h1>
            </div>

            <button
              onClick={() => setIsReportOpen(true)}
              title="รายงานบทความ"
              className="p-2 rounded-full hover:bg-red-50 transition-colors cursor-pointer flex-shrink-0"
            >
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h13l-4 4 4 4H3" />
              </svg>
            </button>
          </div>

          {/* Tags - เปลี่ยนเป็นสไตล์สีเขียวเหมือนหน้า Herb */}
          {article.tags && article.tags.length > 0 && (
            <div className="px-6 mt-4">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-[#D8F5D0] text-black border-2 border-[#A2F58B] px-1 py-0.5 rounded-md text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 mt-6 space-y-6">

            {/* Description - ปรับ Border ให้เป็นสีเขียวอ่อน */}
            {article.description && (
              <p className="text-gray-600 text-base leading-relaxed border-l-4 border-[#BAF8A8] pl-4">
                {article.description}
              </p>
            )}

            {sortedSections.map((sec, i) => (
              <section
                key={i}
                className="bg-[#EEFFE5] p-4 rounded-xl border border-gray-100 shadow-lg" // ปรับสีพื้นหลังและ Shadow ให้เท่ากัน
              >
                {sec.title && (
                  <h3 className="font-bold text-gray-800 mb-2 border-l-4 border-[#BAF8A8] pl-2">
                    {sec.title}
                  </h3>
                )}
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {sec.content}
                </p>
              </section>
            ))}
          </div>

        </div>
      </div>

      <Footer />

      <ArticleReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        articleId={article.id}    // <-- ส่ง id จริงจาก DB
        articleTitle={article.title}
      />
    </main>
  );
}