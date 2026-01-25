"use client";

import { Menu } from "lucide-react";

interface HerbsItem {
  id: number;
  name: string;
  description: string;
  src: string;
}

export default function HerbsNews({ data }: { data: HerbsItem[] }) {
  const limitedNews = data;

  return (
    <div className="w-full bg-white sm:px-6 mt-2">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-150 mx-auto px-4 pb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-gray-800">
            ข่าวความเคลื่อนไหวสมุนไพร
          </h2>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Menu className="w-6 h-6 text-black" />
          </button>
        </div>
      </div>

      <div className="bg-[#F7FFF7]">
        <div className="max-w-200 mx-auto">
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            <div className="flex px-4 pb-6" style={{ width: "max-content" }}>
              {limitedNews?.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 w-40 snap-start"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-38 h-36 rounded-t-lg overflow-hidden shadow-md bg-white">
                      <img
                        src={item.src}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="pt-3 w-full text-left px-2">
                      <p className="text-[12px] text-gray-700 line-clamp-2 leading-snug h-9 pl-2">
                        {item.description}
                      </p>

                      <p className="text-[11px] text-black text-center font-medium mt-2 cursor-pointer hover:underline pl-2">
                        อ่านรายละเอียด
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}