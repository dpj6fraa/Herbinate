'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

const API = process.env.NEXT_PUBLIC_MAIN_SERVER || 'http://localhost:8080';

type Herb = {
  id: string;
  name: string;
  scientific_name: string;
  description: string;
  image_url: string;
  tags: string[];
  sections: { title: string; content: string; position: number }[];
};

type Article = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
};

type PredictResult = {
  filename: string;
  image_url?: string;
  predictions: {
    class_id: number;
    class_name: string;
    confidence: number;
    bbox: number[];
  }[];
};

export default function AiImageResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<PredictResult | null>(null);
  const [herb, setHerb] = useState<Herb | null>(null);
  const [relatedHerbs, setRelatedHerbs] = useState<Herb[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem('herbResult');

    if (!raw) {
      router.push('/Image/Search');
      return;
    }

    try {
      const parsed: PredictResult = JSON.parse(raw);
      console.log('Result from previous page (PredictResult):', parsed);
      setResult(parsed);

      if (parsed.predictions && parsed.predictions.length > 0) {
        const primaryPrediction = parsed.predictions[0];

        // Fetch herb details from backend using class_name
        fetch(`${API}/herbs`)
          .then((res) => res.json())
          .then((herbs: Herb[]) => {
            const className = primaryPrediction.class_name.toLowerCase();
            const matched = herbs.find(
              (h) =>
                h.name.toLowerCase().includes(className) ||
                className.includes(h.name.toLowerCase()) ||
                (h.scientific_name && h.scientific_name.toLowerCase().includes(className))
            );
            if (matched) {
              setHerb(matched);
              // Get related herbs (same tags, exclude current)
              const related = herbs
                .filter((h) => h.id !== matched.id)
                .filter((h) => h.tags?.some((t) => matched.tags?.includes(t)))
                .slice(0, 4);
              setRelatedHerbs(related);
            }
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else {
        setLoading(false);
      }

      // Fetch articles
      fetch(`${API}/articles`)
        .then((res) => res.json())
        .then((data: Article[]) => setArticles(data.slice(0, 4)))
        .catch(() => { });
    } catch {
      router.push('/Image/Search');
    }
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-svh bg-white flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-green-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">กำลังโหลด...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!result) return null;

  const sortedSections = herb
    ? [...(herb.sections ?? [])].sort((a, b) => a.position - b.position)
    : [];

  return (
    <main className="min-h-svh bg-white flex flex-col">
      <Nav />

      <div className="flex-1 flex flex-col pt-4 lg:items-center">
        <div className="max-w-2xl mx-auto w-full bg-white pb-10">
          {/* Title */}
          <div className="px-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              AI ค้นหาสมุนไพรจากภาพ
            </h1>
          </div>

          {/* Uploaded Image */}
          {result?.image_url && (
            <div className="w-full aspect-video overflow-hidden rounded-xl shadow-lg bg-gray-100 mx-auto max-w-2xl">
              <img
                src={result.image_url}
                alt="Uploaded herb"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Result Info */}
          <div className="px-6 pt-6">
            <p className="text-gray-800 text-base leading-relaxed mb-2">
              จากภาพนี้เป็น{' '}
              <span className="font-bold text-green-700">
                {herb
                  ? herb.name
                  : (result.predictions && result.predictions.length > 0
                    ? result.predictions[0].class_name
                    : 'ไม่พบข้อมูล')}
              </span>
              {herb?.scientific_name && (
                <span className="text-gray-500 italic">
                  {' '}({herb.scientific_name})
                </span>
              )}
            </p>

            {/* Confidence */}
            {result.predictions && result.predictions.length > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                ความมั่นใจ: {(result.predictions[0].confidence * 100).toFixed(1)}%
              </p>
            )}

            {/* Herb Details */}
            {herb && (
              <div className="space-y-4">
                {herb.description && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">
                      สรรพคุณของ{herb.name}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                      {herb.description}
                    </p>
                  </div>
                )}

                {sortedSections.map((sec, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-gray-800 mb-1">{sec.title}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                      {sec.content}
                    </p>
                  </div>
                ))}

                {/* Tags */}
                {herb.tags && herb.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {herb.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-[#D8F5D0] text-green-800 border border-[#A2F58B] px-2 py-0.5 rounded-md text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* No herb found fallback */}
            {!herb && result.predictions && result.predictions.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-gray-700 text-sm">
                  ผลลัพธ์: <span className="font-bold">{result.predictions[0].class_name}</span>
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  ไม่พบข้อมูลสมุนไพรนี้ในระบบ
                </p>
              </div>
            )}

            {/* Empty prediction fallback */}
            {(!result.predictions || result.predictions.length === 0) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm font-semibold">
                  ไม่พบสมุนไพรในภาพนี้ หรือระบบไม่สามารถระบุได้ชัดเจน
                </p>
              </div>
            )}
          </div>

          {/* Upload Next Button */}
          <div className="px-6 mt-6 flex justify-end">
            <button
              onClick={() => router.push('/Image/Search')}
              className="flex items-center gap-2 bg-green-500 text-white text-sm px-5 py-2.5 rounded-full hover:bg-green-600 transition shadow-md"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              เพิ่มรูปถัดไป
            </button>
          </div>

          {/* Related Herbs Section */}
          {relatedHerbs.length > 0 && (
            <div className="px-6 mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  สมุนไพรที่เกี่ยวข้อง
                </h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {relatedHerbs.map((h) => {
                  const imgSrc = h.image_url ? `${API}${h.image_url}` : null;
                  return (
                    <div
                      key={h.id}
                      onClick={() => router.push(`/herbs/${h.id}`)}
                      className="min-w-[150px] max-w-[150px] flex-shrink-0 rounded-2xl overflow-hidden shadow-lg bg-[#F7FFF7] border border-green-50 cursor-pointer hover:shadow-xl transition-transform hover:-translate-y-1"
                    >
                      <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={h.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">ไม่มีรูปภาพ</span>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">
                          {h.name}
                        </p>
                        {h.tags && h.tags.length > 0 && (
                          <p className="text-xs text-green-600 mt-1 line-clamp-1">
                            {h.tags.slice(0, 2).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommended Articles Section */}
          {articles.length > 0 && (
            <div className="px-6 mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  บทความที่แนะนำ
                </h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {articles.map((a) => {
                  const imgSrc = a.image_url ? `${API}${a.image_url}` : null;
                  return (
                    <div
                      key={a.id}
                      onClick={() => router.push(`/articles/${a.id}`)}
                      className="min-w-[150px] max-w-[150px] flex-shrink-0 rounded-2xl overflow-hidden shadow-lg bg-[#F7FFF7] border border-green-50 cursor-pointer hover:shadow-xl transition-transform hover:-translate-y-1"
                    >
                      <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={a.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">ไม่มีรูปภาพ</span>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">
                          {a.title}
                        </p>
                        {a.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {a.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
