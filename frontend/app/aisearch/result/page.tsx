"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

interface Herb {
  name: string;
  benefits: string;
  usage: string[];
}

interface HerbResult {
  symptom?: string;
  herbs?: Herb[];
  additional_advice?: string;
  [key: string]: unknown;
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symptom = searchParams.get("symptom") ?? "";

  const [data, setData] = useState<any>(null);
  const [relatedHerbs, setRelatedHerbs] = useState<any[]>([]);

  useEffect(() => {
    if (symptom) {
      fetch("http://localhost:8080/api/herbs")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((resp) => {
          const arr = Array.isArray(resp) ? resp : resp.data || [];

          // ทำให้คำค้นหายืดหยุ่นขึ้น (แบ่งคำ)
          const searchTerms = symptom.split(/\s+/).filter(t => t.length > 2);
          if (searchTerms.length === 0) searchTerms.push(symptom);

          // คำนวณความเกี่ยวข้อง (Score) ของแต่ละสมุนไพร
          const scoredHerbs = arr.map((herb: any) => {
            let score = 0;
            const fullText = [
              herb.name,
              ...(herb.tags || []),
              herb.description,
              herb.properties
            ].join(" ").toLowerCase();

            searchTerms.forEach(term => {
              const lowerTerm = term.toLowerCase();
              if (herb.tags && herb.tags.some((tag: string) => tag.toLowerCase().includes(lowerTerm))) {
                score += 3; // แท็กตรงให้น้ำหนักเยอะ
              }
              else if (fullText.includes(lowerTerm)) {
                score += 1; // เจอในส่วนอื่นให้น้ำหนักน้อยลงมา
              }
            });

            return { herb, score };
          });

          // เรียงตามคะแนนความเกี่ยวข้อง และตัดข้อมูลที่ไม่มีความเกี่ยวข้องออก (score === 0)
          let filtered = scoredHerbs
            .filter((item: any) => item.score > 0)
            .sort((a: any, b: any) => b.score - a.score)
            .map((item: any) => item.herb);

          // ถ้าไม่มีข้อมูลที่เกี่ยวข้องตรงๆ อาจสุ่มแสดงบางส่วน
          if (filtered.length === 0) {
            filtered = arr.sort(() => 0.5 - Math.random()).slice(0, 4);
          } else {
            filtered = filtered.slice(0, 4); // แสดงมากสุด 4 รายการ
          }

          setRelatedHerbs(filtered);
        })
        .catch((err) => console.error("Error fetching related herbs:", err));
    }

    const raw = sessionStorage.getItem("herbResult");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        console.log("[herbResult]", parsed);

        if (parsed.result && typeof parsed.result === "string") {
          const lines = parsed.result.split('\n');
          const herbs: any[] = [];
          let currentHerb: any = null;
          let additionalAdvice = "";
          let parsingAdvice = false;
          let parsingUsage = false;

          for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;

            if (line.startsWith("###")) continue;

            if (line.includes("คำแนะนำเพิ่มเติม")) {
              parsingAdvice = true;
              const adviceText = line.replace(/^\*?\*?คำแนะนำเพิ่มเติม:\*?\*?\s*/, "").trim();
              if (adviceText) {
                additionalAdvice += adviceText;
              }
              continue;
            }

            if (parsingAdvice) {
              additionalAdvice += (additionalAdvice ? "\n" : "") + line;
              continue;
            }

            const cleanLineForCheck = line.replace(/^[-*]\s*/, "");

            let isNewHerb = false;
            if (cleanLineForCheck.match(/^\*?\*?\d+\.\s+/) || cleanLineForCheck.match(/^\d+\.\s+/)) {
              if (!parsingUsage) {
                isNewHerb = true;
              } else {
                for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                  if (lines[j].includes("สรรพคุณ")) {
                    isNewHerb = true;
                    break;
                  }
                }
              }
            }

            if (isNewHerb) {
              let name = cleanLineForCheck.replace(/\*/g, "").replace(/^\d+\.\s*/, "").trim();
              currentHerb = { name, benefits: "", usage: [] };
              herbs.push(currentHerb);
              parsingUsage = false;
              continue;
            }

            if (currentHerb) {
              if (line.includes("สรรพคุณ:")) {
                currentHerb.benefits = line.substring(line.indexOf("สรรพคุณ:") + 8).replace(/\*/g, "").trim();
                parsingUsage = false;
              } else if (line.includes("วิธีใช้:")) {
                parsingUsage = true;
                let usageInline = line.substring(line.indexOf("วิธีใช้:") + 8).replace(/\*/g, "").trim();
                if (usageInline) {
                  currentHerb.usage.push(usageInline);
                }
              } else if (parsingUsage && (line.startsWith("-") || line.startsWith("*") || cleanLineForCheck.match(/^\d+\./))) {
                currentHerb.usage.push(cleanLineForCheck.replace(/^\d+\.\s*/, "").trim());
              } else if (!parsingUsage && !currentHerb.benefits) {
                currentHerb.benefits = line;
              }
            }
          }

          setData({ herbs, additional_advice: additionalAdvice });
        } else {
          setData(parsed);
        }
      } catch {
        router.push("/aisearch/text");
      }
    } else {
      router.push("/aisearch/text");
    }
  }, [router]);

  if (!data) return null;

  async function handleShare() {
    try {
      await navigator.share({ title: "Herbinate", url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <main className="min-h-svh bg-white flex flex-col">
      <Nav />

      <section className="flex-1 px-5 py-6 max-w-md mx-auto w-full bg-[#f0faea] rounded-2xl shadow-sm my-4">
        <div className="flex items-start justify-between mb-5 gap-2">
          <h1 className="text-xl font-bold text-black leading-snug">
            จากอาการ: {symptom} เราขอแนะนำ
          </h1>
          <button
            onClick={handleShare}
            className="flex-shrink-0 mt-1 text-gray-500 hover:text-gray-700"
            title="แชร์"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a1 1 0 001 1h14a1 1 0 001-1v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
          </button>
        </div>

        {(!data.herbs && !Array.isArray(data)) && (
          <pre className="text-xs bg-white border border-red-200 rounded p-3 mb-4 overflow-auto max-h-60 text-gray-600">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}

        <div className="space-y-5">
          {(Array.isArray(data) ? data : (data.herbs || data.data || [])).map((herb: any, i: number) => (
            <div key={i}>
              <p className="font-bold text-black mb-1">
                🌿 {i + 1}.{" "}
                <span className="text-green-600">{herb.name || herb.herb_name || "ไม่ระบุชื่อ"}</span>
              </p>
              <p className="text-gray-800 text-sm mb-1 leading-relaxed">
                <span className="font-semibold">สรรพคุณ:</span> {herb.benefits || herb.properties || herb.description || "-"}
              </p>
              <p className="text-gray-800 text-sm font-semibold mb-1">วิธีใช้:</p>
              <ul className="space-y-1 pl-1">
                {(Array.isArray(herb.usage) ? herb.usage : (herb.how_to_use ? [herb.how_to_use] : [])).map((u: string, j: number) => (
                  <li key={j} className="text-sm text-gray-800 flex gap-1.5 leading-relaxed">
                    <span className="mt-0.5">•</span>
                    <span>{typeof u === 'string' ? u.replace(/\*/g, '') : u}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {data.additional_advice && (
          <div className="mt-6">
            <p className="text-sm text-gray-700 mb-1">
              💬 <span className="font-semibold">คำแนะนำเพิ่มเติม:</span>
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {typeof data.additional_advice === 'string'
                ? data.additional_advice.replace(/\*\s/g, '• ').replace(/\*/g, '')
                : data.additional_advice}
            </p>
          </div>
        )}

        <div className="flex justify-end mt-8">
          <button
            onClick={() => router.push("/aisearch/text")}
            className="bg-green-500 text-white text-sm px-5 py-2.5 rounded-full hover:bg-green-600 transition"
          >
            สอบถามอาการถัดไป
          </button>
        </div>
      </section>

      {relatedHerbs.length > 0 && (
        <section className="px-5 py-4 max-w-md mx-auto w-full mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">สมุนไพรที่เกี่ยวข้อง</h2>
            <button className="text-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {relatedHerbs.map((h, i) => {
              const imgSrc = h.image_url
                ? (h.image_url.startsWith('http') ? h.image_url : (process.env.NEXT_PUBLIC_MAIN_SERVER || "http://localhost:8080") + h.image_url)
                : null;

              return (
                <div
                  key={i}
                  onClick={() => router.push(`/herbs/${h.id}`)}
                  className="min-w-[150px] max-w-[150px] flex-shrink-0 cursor-pointer flex flex-col rounded-[20px] overflow-hidden bg-[#FAFDFA] hover:shadow-md transition-shadow h-full border border-green-50"
                >
                  <div className="w-full h-24 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {imgSrc ? (
                      <img src={imgSrc} alt={h.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs">ไม่มีรูปภาพ</span>
                    )}
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col bg-[#F9FEF6]">
                    <h3 className="font-bold text-gray-900 text-[14px] line-clamp-1">{h.name}</h3>
                    <p className="text-[12px] text-gray-800 mt-1.5 line-clamp-2 leading-relaxed font-medium">
                      {(() => {
                        if (h.sections && Array.isArray(h.sections)) {
                          const benefitSection = h.sections.find((sec: any) => sec.title.includes("สรรพคุณ"));
                          if (benefitSection && benefitSection.content) {
                            return benefitSection.content;
                          }
                        }
                        return h.properties || h.benefits || h.description || '-';
                      })()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  );
}