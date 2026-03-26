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
  "เคลื่อนไส้ อาเจียร",
  "วิงเวียนศีรษะ",
  "ท้องผูก",
];

export default function AITextPage() {
  const [input, setInput] = useState("");
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();

  const visibleSymptoms = showAll ? SUGGESTED_SYMPTOMS : SUGGESTED_SYMPTOMS.slice(0, 6);

  function addSymptom(symptom: string) {
    setInput((prev) =>
      prev.trim() ? `${prev.trim()} ${symptom}` : symptom
    );
  }

  function handleSubmit() {
    if (!input.trim()) return;
    router.push(`/aisearch/analyzing?symptom=${encodeURIComponent(input.trim())}`);
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

          {/* Main Card (ลบขอบประสีเขียวออกแล้ว) */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            {/* ส่วนนี้เคยเป็นกรอบประ แต่ตอนนี้เป็นแค่ Container ธรรมดา */}
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
                  />
                  <button
                    onClick={handleSubmit}
                    className="bg-[#71CE61] hover:bg-[#5da84d]  text-white font-bold py-3 px-10 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    วิเคราะห์
                  </button>
                </div>
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
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}