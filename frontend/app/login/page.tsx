"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Footer from "@/app/components/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function login() {
    setError("");
  
    const res = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      setError("อีเมล์หรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
  
    const data = await res.json();
    localStorage.setItem("token", data.token);
  
    // ✅ Redirect ไปหน้า Main
    window.location.href = "/main";
  }
  return (
    <div className="min-h-svh bg-white flex flex-col">
      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-between px-6 sm:px-10">
        {/* Top Spacer */}
        <div className="h-[10vh] min-h-16" />

        {/* Main Content */}
        <div className="flex flex-col items-center">
          {/* Brand */}
          <h1 className="text-5xl text-black font-bold mb-6 tracking-wide">
            Herbinate
          </h1>

          <h2 className="text-2xl text-black font-semibold mb-5">
            เข้าสู่ระบบ
          </h2>

          {/* Login Panel */}
          <div className="w-full max-w-md">
            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm text-black mb-1">อีเมล์</label>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm text-black mb-1">รหัสผ่าน</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black"
                />
            </div>

            {/* Remember */}
            <div className="flex justify-between items-center mb-6 text-sm">
              <label className="flex gap-2 items-center text-black">
                <input
                  type="checkbox"
                  className="

                    cursor-pointer

                    appearance-none w-4 h-4 rounded
                    bg-gray-300 border border-gray-400
                    checked:bg-[#71CE61]
                    relative
                    checked:after:content-['✓']
                    checked:after:absolute
                    checked:after:inset-0
                    checked:after:flex
                    checked:after:items-center
                    checked:after:justify-center
                    checked:after:text-white
                    checked:after:text-[10px]
                  "
                />
                จดจำฉันไว้
              </label>

              <button className="text-[#1C7D29] hover:underline cursor-pointer">
                ลืมรหัสผ่าน
              </button>
            </div>
              <button
                onClick={login}
                className="w-full py-3 bg-[#71CE61] text-white rounded-md font-semibold cursor-pointer"
              >
                เข้าสู่ระบบ
              </button>
              {error && (
                <p className="mt-3 text-sm text-red-600 text-center">
                  {error}
                </p>
              )}
              
            {/* Social */}
            <div className="mb-4 mt-4 text-center text-sm text-black">
              หรือเข้าสู่ระบบผ่าน
            </div>

            <div className="flex justify-center gap-4 mb-4">
              <button className="w-12 h-12 border rounded-full flex items-center justify-center cursor-pointer">
                <Image src="/globe.svg" alt="social" width={24} height={24} />
              </button>
              <button className="w-12 h-12 border rounded-full flex items-center justify-center cursor-pointer">
                <Image src="/globe.svg" alt="social" width={24} height={24} />
              </button>
            </div>

            <div className="text-center text-sm text-black">
              หากยังไม่มีบัญชี{" "}
              <span
                onClick={() => router.push("/register")}
                className="text-[#1C7D29] font-semibold cursor-pointer hover:underline"
              >
                สมัครสมาชิก
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Spacer */}
        <div className="h-[6vh] min-h-6" />
      </div>

      {/* Footer (Scroll to see) */}
      <Footer />
    </div>
  );
}

