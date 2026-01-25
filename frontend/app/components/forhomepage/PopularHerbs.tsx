"use client";

import { Menu } from "lucide-react";

interface HerbsItem {
  id: number;
  name: string;
  description: string;
  src: string; 
}

export default function PopularHerbs({ data }: { data: HerbsItem[] }) {
  return (
    <>
      <div className="bg-white mt-2 sticky top-14.25] z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 text-[16px]">
            สมุนไพรยอดนิยม
          </h2>
          <button className="p-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="bg-white ">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 px-4 py-3   bg-[#F7FFF7]" style={{ width: "max-content" }}>
            {data?.map((item) => (
              <div key={item.id} className="shrink-0 w-44">
                <div className="bg-white rounded-lg overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.name}
                    className="w-44 h-32 object-cover"
                  />
                  <div className="pt-2">
                    <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}