"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

function AnalyzingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symptom = searchParams.get("symptom") ?? "";

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symptom) return;

    const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8081";

    fetch(`${apiUrl}/api/herb-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptom }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        sessionStorage.setItem("herbResult", JSON.stringify(data));
        router.push(`/aisearch/result?symptom=${encodeURIComponent(symptom)}`);
      })
      .catch((err) => setError(err.message));
  }, [symptom]);

  return (
    <main className="min-h-svh bg-white flex flex-col">
      <Nav />

      <section className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
        <div className="bg-[#f0faea] rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-center min-h-[280px]">
            {!error && (
              <p className="text-gray-600 text-base">เรากำลังวิเคราะห์อาการ...</p>
            )}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>

          <div className="flex items-center bg-white rounded-full border border-gray-300 px-4 py-2 gap-2">
            <span className="flex-1 text-black text-sm truncate">{symptom}</span>
            <button
              onClick={() => router.push("/aisearch/text")}
              className="w-9 h-9 flex-shrink-0 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition"
              title="ค้นหาใหม่"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function AnalyzingPage() {
  return (
    <Suspense>
      <AnalyzingContent />
    </Suspense>
  );
}
