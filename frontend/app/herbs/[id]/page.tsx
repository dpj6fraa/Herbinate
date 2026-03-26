"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import HerbReportModal from "../../components/HerbReportModal";
import { Siren } from "lucide-react";

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
  description: string;
  image_url: string;
  tags: string[];
  sections: Section[];
};

export default function HerbDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [herb, setHerb] = useState<Herb | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // เพิ่ม State จัดการ Bookmark

  useEffect(() => {
    // โหลดข้อมูลสมุนไพร
    fetch(`${API}/api/herbs/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setHerb(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // เช็คสถานะ Bookmark เมื่อโหลดหน้า
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API}/api/herbs/${params.id}/bookmark`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (!res.ok) throw new Error("Not bookmarked or error");
          return res.json();
        })
        .then((data) => {
          setIsSaved(!!(data.is_bookmarked !== false && data.bookmarked !== false));
        })
        .catch(() => {
          setIsSaved(false);
        });
    }
  }, [params.id]);

  // ฟังก์ชันจัดการตอนกดปุ่ม Bookmark
  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API}/api/herbs/${params.id}/bookmark`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setIsSaved(!isSaved);
      } else {
        console.error("Failed to bookmark herb");
      }
    } catch (error) {
      console.error("Error bookmarking herb:", error);
    }
  };

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

  if (!herb) {
    return (
      <main className="min-h-svh bg-white flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-gray-500">ไม่พบข้อมูลสมุนไพร</p>
          <button
            onClick={() => router.push("/herbs")}
            className="text-sm text-green-600 underline"
          >
            กลับหน้ารายการ
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  const imageURL = herb.image_url ? `${API}${herb.image_url}` : null;
  const sortedSections = [...(herb.sections ?? [])].sort(
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
                alt={herb.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* ชื่อ + ปุ่ม Bookmark & Report */}
          <div className="px-6 pt-6 flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h1 className="text-2xl font-bold text-gray-800">{herb.name}</h1>
              {herb.scientific_name && (
                <p className="text-md text-gray-400 italic">{herb.scientific_name}</p>
              )}
            </div>

            {/* กลุ่มปุ่ม Action */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleBookmark}
                title={isSaved ? "เลิกบันทึกสมุนไพร" : "บันทึกสมุนไพร"}
                className="p-2 rounded-full hover:bg-green-50 transition-colors cursor-pointer"
              >
                <svg
                  className={`w-6 h-6 ${isSaved ? "text-green-500 fill-green-500" : "text-gray-400"}`}
                  fill={isSaved ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>

              <button
                onClick={() => setIsReportOpen(true)}
                title="รายงานข้อมูล"
                className="p-2 -mr-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full active:scale-90 transition-all"
              >
                <Siren className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tags */}
          {herb.tags && herb.tags.length > 0 && (
            <div className="px-6 mt-6">
              <h3 className="text-black font-semibold border-l-4 border-[#BAF8A8] pl-2 mb-3">
                คุณสมบัติทางยา
              </h3>
              <div className="flex flex-wrap gap-2">
                {herb.tags.map((tag, i) => (
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

          {/* Content sections */}
          <div className="px-6 mt-4 space-y-6">

            {herb.description && (
              <section className="bg-[#EEFFE5] p-4 rounded-xl border border-gray-100 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-2 border-l-4 border-[#BAF8A8] pl-2">
                  รายละเอียด
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {herb.description}
                </p>
              </section>
            )}

            {sortedSections.map((sec, i) => (
              <section
                key={i}
                className="bg-[#EEFFE5] p-4 rounded-xl border border-gray-100 shadow-lg"
              >
                <h3 className="font-bold text-gray-800 mb-2 border-l-4 border-[#BAF8A8] pl-2">
                  {sec.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {sec.content}
                </p>
              </section>
            ))}
          </div>

        </div>
      </div>

      <Footer />
      <HerbReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        herbId={herb.id} 
        herbName={herb.name}
      />
    </main>
  );
}