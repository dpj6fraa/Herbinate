"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

const SUGGESTED_SYMPTOMS = [
  "ปวดหัว",
  "ตัวร้อน",
  "ไอ เจ็บคอ",
  "ไอแห้ง",
  "คลื่นไส้ อาเจียน",
  "วิงเวียนศีรษะ",
  "ท้องผูก",
];

export default function AITextPage() {
  const [input, setInput] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // State ควบคุมหน้า Loading
  const [error, setError] = useState<string | null>(null); // State จัดการ Error
  const router = useRouter();

  const visibleSymptoms = showAll
    ? SUGGESTED_SYMPTOMS
    : SUGGESTED_SYMPTOMS.slice(0, 6);

  function addSymptom(symptom: string) {
    setInput((prev) =>
      prev.trim() ? `${prev.trim()} ${symptom}` : symptom
    );
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

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const data = await res.json();
      sessionStorage.setItem("herbResult", JSON.stringify(data));
      // พอสำเร็จ ให้ส่งตรงไปหน้า Result เลย
      router.push(`/aisearch/result?symptom=${encodeURIComponent(symptom)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง";
      setError(message);
      setIsAnalyzing(false); // ปิด Loading หากเกิด Error เพื่อให้ผู้ใช้กดลองใหม่ได้
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Nav />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              AI ค้นหาสรรพคุณสมุนไพร
            </h1>
            <p className="text-gray-600 text-lg">
              พิมพ์อาการของคุณเพื่อให้ AI ช่วยวิเคราะห์สมุนไพรที่เหมาะสม
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 min-h-[400px] flex flex-col justify-center">
            
            {isAnalyzing ? (
              // ---------------- LOADING STATE UI ----------------
              <div className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-500">
                <div className="relative w-20 h-20 mb-8">
                  {/* วงกลมหมุนๆ (Spinner) */}
                  <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#71CE61] rounded-full border-t-transparent animate-spin"></div>
                  {/* ไอคอนตรงกลาง (ถ้าอยากใส่รูป AI หรือรูปใบไม้ สามารถเปลี่ยนเป็น <Image /> ได้) */}
                  <div className="absolute inset-0 flex items-center justify-center text-[#71CE61]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                  กำลังวิเคราะห์อาการ...
                </h2>
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm max-w-sm truncate text-center border border-green-100">
                  &quot;{input}&quot;
                </div>
              </div>
            ) : (
              // ---------------- NORMAL INPUT UI ----------------
              <>
                <div className="p-2 md:p-4 bg-green-50/30 rounded-xl">
                  {/* Input Area */}
                  <div className="mb-8">
                    <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-xl border-2 border-green-100 shadow-sm focus-within:border-green-400 transition-all">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder="เช่น ปวดหัว ตัวร้อน มีไข้..."
                        className="flex-1 px-4 py-3 outline-none text-gray-800 bg-transparent text-lg"
                        disabled={isAnalyzing}
                      />
                      <button
                        onClick={handleSubmit}
                        disabled={!input.trim()}
                        className="bg-[#71CE61] hover:bg-[#5da84d] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed text-white font-bold py-3 px-10 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
                      >
                        วิเคราะห์
                      </button>
                    </div>
                    
                    {/* แสดง Error ถ้า API ยิงไม่ผ่าน */}
                    {error && (
                      <p className="text-red-500 text-sm mt-3 px-2 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Suggested Symptoms Section */}
                  <div className="text-left px-2">
                    <p className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">
                      อาการที่พบบ่อย:
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {visibleSymptoms.map((s) => (
                        <button
                          key={s}
                          onClick={() => addSymptom(s)}
                          className="bg-white border border-green-200 text-gray-700 rounded-full px-5 py-2 text-sm font-medium hover:bg-lime-50 hover:border-green-400 hover:text-green-700 transition-all shadow-sm"
                        >
                          + {s}
                        </button>
                      ))}

                      {!showAll && SUGGESTED_SYMPTOMS.length > 6 && (
                        <button
                          onClick={() => setShowAll(true)}
                          className="px-5 py-2 text-sm font-bold text-green-600 hover:text-emerald-700 transition-colors"
                        >
                          เพิ่มเติม...
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Guidance */}
                <div className="mt-8 text-center text-sm text-gray-400">
                  <p>ระบบ AI จะช่วยแนะนำสมุนไพรเบื้องต้นจากฐานข้อมูล</p>
                  <p className="mt-1 italic">* ควรปรึกษาแพทย์หรือผู้เชี่ยวชาญก่อนการใช้งานจริง</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}