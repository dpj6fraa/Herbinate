"use client";

import Footer from "@/app/components/Footer";
import { useEffect, useState } from "react";

export default function MainPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoggedIn(!!token);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  function goLogin() {
    window.location.href = "/login";
  }

  function goProfile() {
    window.location.href = "/profile";
  }

  return (
    <div className="min-h-svh bg-white flex flex-col">
      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Brand / Title */}
        <h1 className="text-4xl font-bold text-black mb-10 tracking-wide">
          Herbinate
        </h1>

        {/* Action Panel */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          {isLoggedIn ? (
            <>
              {/* Profile */}
              <button
                onClick={goProfile}
                className="
                  w-full py-3 rounded-md
                  bg-[#CFF3C5] text-black font-semibold
                  hover:ring-2 hover:ring-[#71CE61]
                  transition
                "
              >
                โปรไฟล์
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="
                  w-full py-3 rounded-md
                  bg-red-500 text-white font-semibold
                  hover:bg-red-600
                  transition
                "
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <button
                onClick={goLogin}
                className="
                  w-full py-3 rounded-md
                  bg-[#71CE61] text-white font-semibold
                  hover:bg-[#5fbf50]
                  transition
                "
              >
                เข้าสู่ระบบ
              </button>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
