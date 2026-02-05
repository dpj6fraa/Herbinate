"use client";

import { Menu } from "lucide-react";
import Link from "next/link";

interface HerbsItem {
  id: number;
  name: string;
  description: string;
  src: string;
  href: string;
}

function PopularHerbs({ data }: { data: HerbsItem[] }) {
  return (
    <div className="w-full bg-white sm:px-6">
      <div className="bg-white border-b border-gray-200/50">
        <div className="max-w-150 mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-700">
            สมุนไพรยอดนิยม
          </h2>
          <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors duration-200">
            <Menu className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white py-4">
        <div className="max-w-150 mx-auto">
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4">
            <div className="flex gap-3" style={{ width: "max-content" }}>
              {data?.map((item) => (
                <div key={item.id} className="shrink-0 w-36 snap-start group">
                  <Link href={item.href} className="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">

                    {/* image */}
                    <div className="w-full h-24 rounded-t-xl overflow-hidden bg-gray-100">
                      <img
                        src={item.src}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* content (โครงเดียวกับ news) */}
                    <div className="p-2.5 flex flex-col gap-1.5">
                      {/* ใช้ name เป็นหัวเรื่องสั้น ๆ */}
                      <h3 className="text-[11px] font-medium text-gray-800 line-clamp-1">
                        {item.name}
                      </h3>

                      <p className="text-[10px] text-gray-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <button className="text-[10px] text-green-600 font-normal hover:text-green-700 transition-colors text-left cursor-pointer hover:underline">
                        ดูสมุนไพรนี้ →
                      </button>
                    </div>

                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}


function HerbsNews({ data }: { data: HerbsItem[] }) {
  return (
    <div className="w-full bg-white sm:px-6">
      <div className="bg-white border-b border-gray-200/50">
        <div className="max-w-150 mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-700">
            ข่าวความเคลื่อนไหวสมุนไพร
          </h2>
          <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors duration-200">
            <Menu className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white py-4">
        <div className="max-w-150 mx-auto">
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4">
            <div className="flex gap-3" style={{ width: "max-content" }}>
              {data?.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 w-36 snap-start group"
                >
                  <Link href={item.href} className="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-full h-24 rounded-t-xl overflow-hidden bg-gray-100">
                      <img
                        src={item.src}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-2.5 flex flex-col gap-1.5">
                      <p className="text-[10px] text-gray-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <button className="text-[10px] text-green-600 font-normal hover:text-green-700 transition-colors text-left cursor-pointer hover:underline">
                        อ่านรายละเอียด →
                      </button>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data for demo
const mockHerbsData: HerbsItem[] = [
  {
    id: 1,
    name: "ขมิ้นชัน",
    description: "มีสรรพคุณช่วยบำรุงผิวพรรณ ลดการอักเสบ",
    src: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop",
    href: "/khaminchan",
  },
  {
    id: 2,
    name: "ฟ้าทะลายโจร",
    description: "ช่วยบรรเทาอาการหวัด เสริมสร้างภูมิคุ้มกัน",
    src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    href: "/khaminchan"
  },
  {
    id: 3,
    name: "ว่านหางจระเข้",
    description: "บำรุงผิว รักษาแผล ช่วยระบบขับถ่าย",
    src: "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=300&fit=crop",
    href: "/khaminchan"
  },
  {
    id: 4,
    name: "กระชาย",
    description: "แก้ท้องอืด ท้องเฟ้อ บรรเทาอาการปวด",
    src: "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=400&h=300&fit=crop",
    href: "/khaminchan"
  }
];

const mockNewsData: HerbsItem[] = [
  {
    id: 1,
    name: "",
    description: "กระทรวงสาธารณสุขผลักดันสมุนไพรไทยสู่ตลาดโลก ปี 2568",
    src: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop",
    href: "/focusontumeric"
  },
  {
    id: 2,
    name: "",
    description: "งานวิจัยใหม่พบสรรพคุณของขมิ้นชันในการต้านมะเร็ง",
    src: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop",
    href: "/focusontumeric"
  },
  {
    id: 3,
    name: "",
    description: "เกษตรกรไทยปลูกสมุนไพรออรแกนิกเพิ่มขึ้น 40%",
    src: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop",
    href: "/focusontumeric"
  },
  {
    id: 4,
    name: "",
    description: "WHO รับรองมาตรฐานสมุนไพรไทย 15 ชนิด",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    href: "/focusontumeric"
  }
];

export default function HomeContent() {
  return (
    <section className="flex-1">
      <PopularHerbs data={mockHerbsData} />
      <HerbsNews data={mockNewsData} />
    </section>
  );
}