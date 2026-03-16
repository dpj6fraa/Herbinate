"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/app/components/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // 🌟 เพิ่ม State สำหรับ Loading
  const router = useRouter();

  async function login() {
    setError("");
    setLoading(true); // 🌟 เริ่มโหลดเมื่อกดปุ่ม

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // ❌ Email/Password ผิด
      if (res.status === 401) {
        setError("อีเมล์หรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false); // 🌟 หยุดโหลดเมื่อเจอ Error
        return;
      }

      // ⚠️ ยังไม่ Verify → พาไปหน้า OTP
      if (res.status === 403) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาดบางอย่าง");
        setLoading(false); // 🌟 หยุดโหลดเมื่อเจอ Error
        return;
      }

      // ✅ Login สำเร็จ
      localStorage.setItem("token", data.token);
      window.location.href = "/homepage";
      // 🌟 ไม่ต้องใส่ setLoading(false) ตรงนี้ ปล่อยให้ปุ่มค้างสถานะโหลดไว้ระหว่างรอเปลี่ยนหน้า
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      setLoading(false); // 🌟 หยุดโหลดเมื่อเชื่อมต่อไม่ได้
    }
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
                disabled={loading} // ล็อคช่องพิมพ์ตอนกำลังโหลด
                className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black outline-none transition-shadow disabled:opacity-70"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm text-black mb-1">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading} // ล็อคช่องพิมพ์ตอนกำลังโหลด
                className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black outline-none transition-shadow disabled:opacity-70"
              />
            </div>

            {/* Remember */}
            <div className="flex justify-between items-center mb-6 text-sm">
              <label className="flex gap-2 items-center text-black cursor-pointer group">
                <input
                  type="checkbox"
                  disabled={loading}
                  className="
                    cursor-pointer
                    appearance-none w-4 h-4 rounded
                    bg-gray-300 border border-gray-400
                    checked:bg-[#71CE61] checked:border-[#71CE61]
                    relative
                    checked:after:content-['✓']
                    checked:after:absolute
                    checked:after:inset-0
                    checked:after:flex
                    checked:after:items-center
                    checked:after:justify-center
                    checked:after:text-white
                    checked:after:text-[10px]
                    transition-colors
                    disabled:cursor-not-allowed
                  "
                />
                <span className="group-hover:text-gray-700 transition-colors">จดจำฉันไว้</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-[#1C7D29] hover:underline cursor-pointer transition-colors"
              >
                ลืมรหัสผ่าน
              </Link>
            </div>

            {/* 🌟 ปุ่ม Login ที่เพิ่มสถานะ Loading และ Effect ต่างๆ */}
            <button
              onClick={login}
              disabled={loading}
              className="w-full py-3 bg-[#71CE61] hover:bg-[#60b552] text-white rounded-md font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>

            {/* 🌟 Error Message แบบเด้งกระพริบเบาๆ */}
            {error && (
              <p className="mt-3 text-sm text-red-600 text-center animate-pulse">
                {error}
              </p>
            )}

            {/* Social */}
            <div className="mb-4 mt-6 text-center text-sm text-black">
              หรือเข้าสู่ระบบผ่าน
            </div>

            <div className="flex justify-center gap-4 mb-4">
              {/* 🌟 ปุ่ม Social เพิ่ม Hover Effect */}
              <button className="w-12 h-12 border border-gray-300 hover:bg-gray-50 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                <Image src="/globe.svg" alt="social" width={24} height={24} />
              </button>
              <button className="w-12 h-12 border border-gray-300 hover:bg-gray-50 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                <Image src="/globe.svg" alt="social" width={24} height={24} />
              </button>
            </div>

            <div className="text-center text-sm text-black mt-4">
              หากยังไม่มีบัญชี{" "}
              <span
                onClick={() => router.push("/register")}
                className="text-[#1C7D29] font-semibold cursor-pointer hover:underline transition-colors"
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