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
      <div className="bg-white border-b border-gray-200/50">
        <div className="max-w-150 mx-auto px-4 py-4 flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-700">
            ข่าวความเคลื่อนไหวสมุนไพร
          </h2>
          <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-b from-green-50/30 to-white py-6">
        <div className="max-w-150 mx-auto">
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4">
            <div className="flex gap-4" style={{ width: "max-content" }}>
              {limitedNews?.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 w-44 snap-start group"
                >
                  <div className="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-full h-32 rounded-t-xl overflow-hidden bg-gray-100">
                      <img
                        src={item.src}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-3 flex flex-col gap-2">
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                        {item.description}
                      </p>

                      <button className="text-xs text-green-600 font-normal hover:text-green-700 transition-colors text-left">
                        อ่านรายละเอียด →
                      </button>
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