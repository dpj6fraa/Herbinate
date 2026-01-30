"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MeResponse = {
  id: string;
  username: string;
  profile_image_url?: string;
};

export default function Nav() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  let mounted = true;

  async function fetchMe() {
    const token = localStorage.getItem("token");
    if (!token) {
      if (mounted) {
        setUser(null);
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("unauthorized");

      const data = await res.json();
      if (mounted) setUser(data);
    } catch {
      localStorage.removeItem("token");
      if (mounted) setUser(null);
    } finally {
      if (mounted) setLoading(false);
    }
  }

  fetchMe();

  // 👇 ฟัง event โปรไฟล์อัปเดต
  const handleProfileUpdate = () => {
    fetchMe();
  };

  window.addEventListener("profile-updated", handleProfileUpdate);

  return () => {
    mounted = false;
    window.removeEventListener("profile-updated", handleProfileUpdate);
  };
}, []);


  return (
    <nav className="flex flex-col text-[24px] text-black pt-3 px-4 sticky top-0 w-full z-50 bg-white border-b-4 border-b-[#97DB8B]">
      <div className="flex justify-between items-center">
        <h1 className="font-black">Herbinate</h1>

        {/* RIGHT SIDE */}
        {!loading && (
          user ? (
            <Link href="/profile">
              <img
                src={
                  user.profile_image_url
                    ? `http://localhost:8080${user.profile_image_url}?v=${Date.now()}`
                    : "/default_profile_picture.png"
                }
                className="w-11 h-11 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-[#97DB8B] transition"
                alt="profile"
              />
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold px-4 py-2 border rounded-full hover:bg-[#97DB8B] hover:text-white transition"
            >
              Login
            </Link>
          )
        )}
      </div>

            <div className="flex justify-center mb-1">
                <div className="flex w-full max-w-md justify-between text-black">

                    <div className="flex flex-col items-center mt-3 sm:mt-4 md:mt-5 cursor-pointer">
                        <Link href="" className="flex flex-col items-center cursor-pointer gap-0.5">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            </svg>
                            <h3 className="text-xs sm:text-[13px]">หน้าแรก</h3>
                        </Link>
                    </div>

                    <div className="flex flex-col items-center mt-3 sm:mt-4 md:mt-5 cursor-pointer">
                        <Link href="" className="flex flex-col items-center cursor-pointer gap-0.5">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <h3 className="text-xs sm:text-[13px]">ชุมชน</h3>
                        </Link>
                    </div>

                    <div className="flex flex-col items-center mt-3 sm:mt-4 md:mt-5 cursor-pointer">
                        <Link href="/aisearch/text" className="flex flex-col items-center cursor-pointer gap-0.5">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 3H16.82C16.4 1.84 15.3 1 14 1H10C8.7 1 7.6 1.84 7.18 3H5C3.9 3 3 3.9 3 5V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V5C21 3.9 20.1 3 19 3Z" fill="currentColor" />
                                <path d="M14 3H10V5H14V3Z" fill="white" />
                                <path d="M9 8H7V10H5V12H7V14H9V12H11V10H9V8Z" fill="white" />
                                <path d="M5.5 18L8 20.5L12 15.5L10.5 14L8 17.5L6.5 16L5.5 18Z" fill="white" />
                                <rect x="14" y="9" width="4" height="2" rx="0.5" fill="white" />
                                <rect x="14" y="13" width="4" height="2" rx="0.5" fill="white" />
                                <rect x="14" y="17" width="4" height="2" rx="0.5" fill="white" />
                            </svg>
                            <h3 className="text-xs sm:text-[13px]">ค้นหาอาการ</h3>
                        </Link>
                    </div>

                    <div className="flex flex-col items-center mt-3 sm:mt-4 md:mt-5 cursor-pointer">
                        <Link href="/aisearch/image" className="flex flex-col items-center cursor-pointer gap-0.5">
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M2 7V3C2 2.44772 2.44772 2 3 2H7" stroke="black" strokeWidth={2} strokeLinecap="round" />
                                <path d="M17 2H21C21.5523 2 22 2.44772 22 3V7" stroke="black" strokeWidth={2} strokeLinecap="round" />
                                <path d="M2 17V21C2 21.5523 2.44772 22 3 22H7" stroke="black" strokeWidth={2} strokeLinecap="round" />
                                <path d="M17 22H21C21.5523 22 22 21.5523 22 21V17" stroke="black" strokeWidth={2} strokeLinecap="round" />
                                <path d="M11.8 19C11.8 19 5.5 17.5 5 13C4.5 9.5 9 9 11.8 14" fill="black" />
                                <path d="M12.2 19C12.2 19 18.5 17.5 19 13C19.5 9.5 15 9 12.2 14" fill="black" />
                                <path d="M12 16C14 14 15 11 12 5C9 11 10 14 12 16Z" fill="black" />
                            </svg>
                            <h3 className="text-xs sm:text-[13px]">ค้นหารูป</h3>
                        </Link>
                    </div>

                    <div className="flex flex-col items-center mt-3 sm:mt-4 md:mt-5 cursor-pointer">
                        <Link href="" className="flex flex-col items-center cursor-pointer gap-0.5">
                            <svg width="22" height="22" viewBox="0 0 400 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g transform="scale(1.2) translate(-35, -20)">
                                    <path d="M200 180V300M150 380L200 300L250 380H150Z" stroke="black" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="black" />
                                    <rect x="70" y="240" width="260" height="12" rx="6" fill="black" />
                                    <path d="M70 310C70 345 100 370 135 370C170 370 200 345 200 310H70Z" fill="black" transform="translate(0, -50)" />
                                    <circle cx="135" cy="150" r="70" fill="black" />
                                    <path d="M135 60C135 60 115 80 115 100C115 120 135 130 135 130C135 130 155 120 155 100C155 80 135 60 135 60Z" fill="white" transform="translate(0, 40)" />
                                    <path d="M105 105C105 105 90 115 90 130C90 145 105 150 115 150C125 150 135 135 135 135C130 120 105 105 105 105Z" fill="white" transform="translate(0, 40)" />
                                    <path d="M165 105C165 105 180 115 180 130C180 145 165 150 155 150C145 150 135 135 135 135C140 120 165 105 165 105Z" fill="white" transform="translate(0, 40)" />
                                    <path d="M200 310C200 345 230 370 265 370C300 370 330 345 330 310H200Z" fill="black" transform="translate(0, -50)" />
                                    <circle cx="265" cy="150" r="70" fill="black" />
                                    <path d="M265 140V70M265 140L230 85M265 140L300 85" stroke="white" strokeWidth="10" strokeLinecap="round" transform="translate(0, 40)" />
                                </g>
                            </svg>
                            <h3 className="text-xs sm:text-[13px]">เปรียบเทียบ</h3>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}