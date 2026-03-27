"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

const SUGGESTED_SYMPTOMS = [
  "ปวดหัว", "ตัวร้อน", "ไอ เจ็บคอ", "ไอแห้ง",
  "คลื่นไส้ อาเจียน", "วิงเวียนศีรษะ", "ท้องผูก",
];

export default function AITextPage() {
  const [input, setInput] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const visibleSymptoms = showAll
    ? SUGGESTED_SYMPTOMS
    : SUGGESTED_SYMPTOMS.slice(0, 6);

  function addSymptom(symptom: string) {
    setInput((prev) => prev.trim() ? `${prev.trim()} ${symptom}` : symptom);
  }

  async function handleSubmit() {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    const symptom = input.trim();
    const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8081";

    try {
      const res = await fetch(`${apiUrl}/api/herb-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptom }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      sessionStorage.setItem("herbResult", JSON.stringify(data));
      router.push(`/aisearch/result?symptom=${encodeURIComponent(symptom)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setError(message);
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Nav />

      <div className="flex-1 flex items-start sm:items-center justify-center px-4 pt-6 pb-10 sm:py-8">
        <div className="w-full max-w-xl">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-50 border border-green-100 mb-4">
              <svg className="w-6 h-6 text-[#65B741]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a9 9 0 0 1 9 9c0 3.18-1.65 5.97-4.13 7.59C15.7 19.77 14 21 12 21s-3.7-1.23-4.87-2.41C4.65 16.97 3 14.18 3 11a9 9 0 0 1 9-9z"/>
                <path d="M12 8v4l2 2"/>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1.5">
              AI ค้นหาสรรพคุณสมุนไพร
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              บอกอาการของคุณ แล้วให้ AI แนะนำสมุนไพรที่เหมาะสม
            </p>
          </div>

          {isAnalyzing ? (
            /* Loading State */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 flex flex-col items-center text-center">
              <div className="relative w-16 h-16 mb-5">
                <div className="absolute inset-0 border-4 border-green-100 rounded-full"/>
                <div className="absolute inset-0 border-4 border-[#71CE61] border-t-transparent rounded-full animate-spin"/>
                <div className="absolute inset-0 flex items-center justify-center text-[#71CE61]">
                  <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-800 mb-2">กำลังวิเคราะห์อาการ...</p>
              <p className="text-sm text-gray-400 mb-4">อาจใช้เวลาสักครู่</p>
              <div className="bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-2 rounded-full max-w-xs truncate">
                &quot;{input}&quot;
              </div>
            </div>

          ) : (
            /* Input State */
            <>
              {/* Input box — input + ปุ่มอยู่แถวเดียวกันเสมอ */}
              <div className="bg-white rounded-2xl border-2 border-green-100 shadow-lg focus-within:border-green-400 transition-colors overflow-hidden mb-3">
                <div className="flex items-center gap-2 px-4 py-3">
                  <svg className="w-5 h-5 text-green-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>

                  {/* textarea แทน input เพื่อรองรับข้อความยาว */}
                  <textarea
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="เช่น ปวดหัว ตัวร้อน มีไข้..."
                    className="flex-1 resize-none outline-none text-gray-800 bg-transparent text-base leading-relaxed placeholder:text-gray-400"
                    disabled={isAnalyzing}
                  />

                  {/* ปุ่มอยู่ขวาเสมอ ไม่ตกลงไปด้านล่าง */}
                  <button
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                    className="shrink-0 bg-[#71CE61] hover:bg-[#5da84d] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
                  >
                    วิเคราะห์
                  </button>
                </div>

                {/* แสดงจำนวนตัวอักษร ช่วยให้รู้ว่าพิมพ์อะไรไปบ้าง */}
                {input.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-1.5 bg-green-50/60 border-t border-green-100">
                    <span className="text-[11px] text-green-600">กด Enter เพื่อวิเคราะห์</span>
                    <button
                      onClick={() => setInput("")}
                      className="text-[11px] text-gray-400 hover:text-red-400 transition-colors"
                    >
                      ล้าง
                    </button>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-3">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Suggested symptoms */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  อาการที่พบบ่อย
                </p>
                <div className="flex flex-wrap gap-2">
                  {visibleSymptoms.map((s) => (
                    <button
                      key={s}
                      onClick={() => addSymptom(s)}
                      className="bg-green-50 border border-green-100 text-green-800 rounded-full px-4 py-1.5 text-sm font-medium hover:bg-green-100 hover:border-green-300 transition-all"
                    >
                      + {s}
                    </button>
                  ))}
                  {!showAll && SUGGESTED_SYMPTOMS.length > 6 && (
                    <button
                      onClick={() => setShowAll(true)}
                      className="px-4 py-1.5 text-sm font-semibold text-green-600 hover:text-green-800 transition-colors"
                    >
                      เพิ่มเติม →
                    </button>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-center text-xs text-gray-400 mt-4 px-2 leading-relaxed">
                ระบบ AI แนะนำสมุนไพรเบื้องต้นจากฐานข้อมูล<br/>
                <span className="italic">* ควรปรึกษาแพทย์หรือผู้เชี่ยวชาญก่อนใช้งานจริง</span>
              </p>
            </>
          )}

        </div>
      </div>

      <Footer />
    </main>
  );
}