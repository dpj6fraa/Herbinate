"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const API = "http://localhost:8080";

// 1. Interface ของ Herb (ตาม Base Code)
type Herb = {
  id: string;
  name: string;
  scientific_name: string;
  image_url: string;
  tags: string[];
};

// 2. Component ย่อยสำหรับแสดงการ์ดสมุนไพร
function HerbCards({ data }: { data: Herb[] }) {
  const router = useRouter();

  return (
    <>
      {data?.map((item) => {
        const imgSource = item.image_url ? `${API}${item.image_url}` : null;

        return (
          <div
            key={item.id}
            onClick={() => router.push(`/herbs/${item.id}`)}
            // จัดความกว้างให้ได้ 2 การ์ดบนมือถือ และคงที่บนจอใหญ่
            className="w-[calc(50%-6px)] md:w-64 lg:w-72 flex flex-col rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl bg-[#F7FFF7] border border-green-50 cursor-pointer transition-transform hover:-translate-y-1 hover:scale-[1.02]"
          >
            {/* ส่วนรูปภาพ */}
            <div className="w-full h-28 md:h-40 overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
              {imgSource ? (
                <img
                  src={imgSource}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-xs md:text-sm">ไม่มีรูปภาพ</span>
              )}
            </div>

            {/* ส่วนเนื้อหา */}
            <div className="p-3 md:p-4 flex flex-col flex-1 w-full text-left">
              <h2 className="text-[14px] md:text-[16px] text-black pb-1 md:pb-2 font-medium line-clamp-2 leading-tight">
                {item.name}
              </h2>

              {/* แสดงชื่อวิทยาศาสตร์ (แทนที่ Description ของบทความ) */}
              {item.scientific_name && (
                <p className="text-[12px] md:text-[14px] text-gray-500 italic line-clamp-2 mb-2 md:mb-3 mt-1 md:mt-0 flex-1">
                  {item.scientific_name}
                </p>
              )}

              {/* แสดง Tags เล็กๆ */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex gap-1.5 md:gap-2 flex-wrap mt-auto pt-2 border-t border-green-100">
                  {item.tags.slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[9px] md:text-[10px] bg-[#D8F5D0] text-green-800 border border-[#A2F58B] px-1.5 md:px-2 py-0.5 md:py-1 rounded-md whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

// 3. Component หลัก (หน้า Page)
export default function HerbsPage() {
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ดึงข้อมูลจาก API
  useEffect(() => {
    fetch(`${API}/herbs`)
      .then((res) => res.json())
      .then((data) => {
        setHerbs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch herbs:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-white pt-4 md:w-full">
      <Nav />

      <div className="flex-1 flex flex-col pt-4 lg:items-center w-full">
        {/* --- ส่วนของหน้าค้นหาและตัวกรอง --- */}
        <div className="flex flex-col items-center justify-center px-4 md:px-6 w-full max-w-4xl">
          
          {/* Header และปุ่ม Create */}
          <div className="flex justify-between items-center w-full">
            <h1 className="text-[20px] md:text-[24px] text-black font-bold"> สมุนไพรทั้งหมด</h1>
             {/*<button
              onClick={() => router.push("/herbs/create")}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs md:text-sm transition-colors shadow-sm"
            >
              + เพิ่มสมุนไพร
            </button>*/}
          </div>

          <div className="relative w-full mt-4">
            <input
              type="text"
              placeholder="ค้นหาสมุนไพรทั้งหมด"
              className="w-full py-2 px-6 rounded-full text-sm md:text-base text-gray-700 focus:outline-none border-2 border-gray-300 focus:border-green-400 transition-colors my-2 md:my-4"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
          </div>

          <div className="flex justify-start items-center w-full text-black mt-2">
            <a className="flex cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex justify-center items-center gap-1.5 md:gap-2 border-2 border-gray-300 hover:border-green-400 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 4H20L14 12V18L10 21V12L4 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                ทุกหมวดหมู่
              </div>
            </a>
          </div>
        </div>

        {/* --- ส่วนแสดงผลการ์ด (จัดให้อยู่ตรงกลางด้วย Flex) --- */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-8 mb-12 px-4 md:px-6 w-full max-w-6xl">
          {loading ? (
            <div className="w-full flex justify-center items-center my-10">
              <div className="w-8 h-8 border-[3px] border-green-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : herbs.length > 0 ? (
            <HerbCards data={herbs} />
          ) : (
            <p className="w-full text-center text-gray-500 my-10">ไม่พบข้อมูลสมุนไพร</p>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}