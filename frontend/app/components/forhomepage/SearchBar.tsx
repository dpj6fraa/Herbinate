"use client";

import Image from "next/image";

export default function SearchBar() {
    return (
        <div>
            <div className="relative w-full flex flex-col items-center justify-center text-white overflow-hidden h-64 sm:h-75 md:h-60">
                <Image
                    src="/images/herbs.webp"
                    alt="Herbinate Background"
                    fill
                    className="object-cover brightness-50"
                />

                <div className="text-center w-full h-full flex flex-col justify-center items-center bg-[rgba(255,255,255,0.3)] z-40 px-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-tight">
                        &quot;สมุนไพร... เรื่องง่ายสำหรับทุกคน&quot;
                    </h1>
                    <h2 className="text-xs sm:text-sm md:text-lg text-[rgba(255,255,255,0.9)] leading-relaxed">
                        แหล่งความรู้และผลิตภัณฑ์สมุนไพร
                    </h2>
                    <h2 className="text-xs sm:text-sm md:text-lg mb-4 text-[rgba(255,255,255,0.9)] leading-relaxed">
                        ที่ช่วยให้คุณเลือกใช้ได้อย่างมั่นใจ
                    </h2>

                    <div className="relative w-full max-w-md mx-auto px-4">
                        <input
                            type="text"
                            placeholder="ค้นหาสมุนไพร..."
                            className="w-full py-2 px-6 rounded-full text-sm text-black bg-white/90 focus:outline-none shadow-lg"
                        />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400">
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
                                className="text-black cursor-pointer"
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}