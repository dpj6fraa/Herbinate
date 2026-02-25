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
    <main className="min-h-svh bg-white flex flex-col">
      <Nav />

      <section className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
        <div className="bg-[#f0faea] rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-black text-center mb-2">
            AI สรรพคุณสมุนไพร
          </h1>
          <p className="text-center text-gray-600 mb-5">
            คุณสามารถบอกอาการคร่าวๆ เลย
          </p>

          <div className="flex items-center bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder=""
              className="flex-1 px-4 py-3 outline-none text-black bg-transparent"
            />
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-4 py-3 font-medium hover:bg-green-600 transition"
            >
              ตกลง
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {visibleSymptoms.map((s) => (
              <button
                key={s}
                onClick={() => addSymptom(s)}
                className="bg-white border border-gray-300 text-gray-700 rounded-full px-4 py-1.5 text-sm hover:bg-green-100 transition"
              >
                {s}
              </button>
            ))}

            {!showAll && SUGGESTED_SYMPTOMS.length > 6 && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full mt-2 bg-[#d4f0c4] text-gray-700 rounded-full py-2 text-sm font-medium hover:bg-green-200 transition"
              >
                เพิ่มเติม...
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
