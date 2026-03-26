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

  // (ส่วน Logic การดึงข้อมูลคงเดิม ไม่เปลี่ยนแปลง)
  useEffect(() => {
    if (symptom) {
      fetch("http://localhost:8080/api/herbs")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((resp) => {
          const arr = Array.isArray(resp) ? resp : resp.data || [];
          const searchTerms = symptom.split(/\s+/).filter(t => t.length > 2);
          if (searchTerms.length === 0) searchTerms.push(symptom);

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
                score += 3;
              }
              else if (fullText.includes(lowerTerm)) {
                score += 1;
              }
            });

            return { herb, score };
          });

          let filtered = scoredHerbs
            .filter((item: any) => item.score > 0)
            .sort((a: any, b: any) => b.score - a.score)
            .map((item: any) => item.herb);

          if (filtered.length === 0) {
            filtered = arr.sort(() => 0.5 - Math.random()).slice(0, 4);
          } else {
            filtered = filtered.slice(0, 4);
          }

          setRelatedHerbs(filtered);
        })
        .catch((err) => console.error("Error fetching related herbs:", err));
    }

    const raw = sessionStorage.getItem("herbResult");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
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
  }, [router, symptom]);

  if (!data) return null;

  async function handleShare() {
    try {
      await navigator.share({ title: "Herbinate", url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

// ... (ส่วนบนของไฟล์ยังคงเหมือนเดิมจนถึง return statement)

  return (
    <main className="min-h-svh bg-white flex flex-col">
      <Nav />

      {/* --- ส่วนแสดงผล AI Result --- */}
      <section className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8">
          
          {/* Header & Share */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
            <div>
              <p className="text-sm text-black font-medium mb-1">ผลการวิเคราะห์สำหรับอาการ</p>
              <h1 className="text-2xl font-bold text-gray-800 leading-snug">
                <span className="text-green-600 font-extrabold">
                  "{symptom}"
                </span>
              </h1>
            </div>
            <button
              onClick={handleShare}
              className="flex-shrink-0 p-2.5 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-full transition-all duration-300 transform hover:scale-105"
              title="แชร์ผลลัพธ์"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a1 1 0 001 1h14a1 1 0 001-1v-8M16 6l-4-4-4 4M12 2v13" />
              </svg>
            </button>
          </div>

          {/* Debugging block (ถ้าจำเป็น) */}
          {(!data.herbs && !Array.isArray(data)) && (
            <pre className="text-xs bg-red-50 border border-red-100 rounded-xl p-4 mb-6 overflow-auto max-h-60 text-gray-600">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}

          {/* List ของสมุนไพรแยกเป็นการ์ด */}
          <div className="space-y-4">
            {(Array.isArray(data) ? data : (data.herbs || data.data || [])).map((herb: any, i: number) => (
              <div 
                key={i} 
                className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-green-300 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* ขีดสีเขียวตกแต่งด้านซ้าย */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-sm font-black">
                    {i + 1}
                  </span>
                  {herb.name || herb.herb_name || "ไม่ระบุชื่อ"}
                </h2>
                
                <div className="space-y-3 pl-8">
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <p className="leading-relaxed">
                      <span className="font-semibold text-gray-800">สรรพคุณ: </span> 
                      {herb.benefits || herb.properties || herb.description || "-"}
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800 block mb-1">วิธีใช้:</span>
                      <ul className="space-y-1">
                        {(Array.isArray(herb.usage) ? herb.usage : (herb.how_to_use ? [herb.how_to_use] : [])).map((u: string, j: number) => (
                          <li key={j} className="flex gap-2 leading-relaxed text-gray-600">
                            <span className="text-gray-300">•</span>
                            <span>{typeof u === 'string' ? u.replace(/\*/g, '') : u}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Advice Box */}
          {data.additional_advice && (
            <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start">
              <div className="text-2xl">💡</div>
              <div>
                <p className="text-sm font-bold text-blue-900 mb-1">คำแนะนำเพิ่มเติมจาก AI</p>
                <p className="text-sm text-blue-800 whitespace-pre-line leading-relaxed">
                  {typeof data.additional_advice === 'string'
                    ? data.additional_advice.replace(/\*\s/g, '• ').replace(/\*/g, '')
                    : data.additional_advice}
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center mt-10">
            <button
              onClick={() => router.push("/aisearch/text")}
              className="flex items-center gap-2 bg-[#71CE61] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#5da84d] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              ปรึกษาอาการอื่นเพิ่มเติม
            </button>
          </div>
        </div>
      </section>

      {/* --- ส่วนสมุนไพรที่เกี่ยวข้อง (ปรับให้สอดคล้องกับ Component PopularHerbs) --- */}
      {relatedHerbs.length > 0 && (
        <section className="w-full bg-white sm:px-6 mt-4">
          <div className="bg-white border-b border-gray-200/50">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-800">
                สมุนไพรที่เกี่ยวข้อง
              </h2>
              {/* ปุ่มดูทั้งหมดแบบเดียวกับหน้าหลัก */}
              <button
                onClick={() => router.push('/herbs')}
                className="group flex items-center gap-1 text-[11px] sm:text-xs font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-all duration-200"
              >
                ดูทั้งหมด
                <svg
                  className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-white py-4">
            <div className="max-w-2xl mx-auto">
              <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 hide-scrollbar">
                <div className="flex gap-4 pb-2" style={{ width: "max-content" }}>
                  {relatedHerbs.map((item, i) => {
                    const imgSrc = item.image_url
                      ? (item.image_url.startsWith('http') ? item.image_url : (process.env.NEXT_PUBLIC_MAIN_SERVER || "http://localhost:8080") + item.image_url)
                      : "/placeholder.png"; // ใช้ placeholder ตามโค้ดต้นฉบับถ้าไม่มีรูป

                    // หาคำอธิบายที่เหมาะสม
                    let descriptionStr = "";
                    if (item.sections && Array.isArray(item.sections)) {
                      const benefitSection = item.sections.find((sec: any) => sec.title.includes("สรรพคุณ"));
                      if (benefitSection && benefitSection.content) {
                        descriptionStr = benefitSection.content;
                      }
                    }
                    if (!descriptionStr) {
                      descriptionStr = item.properties || item.benefits || item.description || item.scientific_name || '-';
                    }

                    return (
                      <div
                        key={i}
                        onClick={() => router.push(`/herbs/${item.id}`)}
                        className="shrink-0 w-40 snap-start group cursor-pointer h-full"
                      >
                        <div className="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-50">
                          <div className="w-full h-28 rounded-t-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                            <img
                              src={imgSrc}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-3 flex flex-col gap-1.5 flex-1">
                            <h3 className="text-xs font-bold text-gray-800 line-clamp-1">
                              {item.name}
                            </h3>
                            <p className="text-[10px] text-gray-600 line-clamp-2 leading-relaxed flex-1">
                              {descriptionStr}
                            </p>
                            <span className="text-[10px] text-green-600 font-normal group-hover:text-green-700 transition-colors text-left mt-auto pt-1">
                              ดูสมุนไพรนี้ →
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
      
      {/* ซ่อน Scrollbar แนวนอนเพื่อให้ดูคลีนขึ้น */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
// ...

export default function ResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  );
}