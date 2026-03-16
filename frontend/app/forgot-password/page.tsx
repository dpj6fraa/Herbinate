"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Footer from "@/app/components/Footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function requestReset() {
    setError("");

    if (!email.trim()) {
      setError("กรุณากรอกอีเมล์");
      return;
    }

    setLoading(true);
    try {
      // ⚠️ ต้องไปสร้าง API เส้นนี้ใน Backend ด้วยนะครับ
      const res = await fetch("http://localhost:8080/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "ไม่พบอีเมล์นี้ในระบบ หรือเกิดข้อผิดพลาด");
        setLoading(false);
        return;
      }

      // ✅ ส่ง OTP สำเร็จ พาไปหน้าตั้งรหัสใหม่
      router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-svh bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-between px-6 sm:px-10">
        <div className="h-[10vh] min-h-16" />

        <div className="flex flex-col items-center">
          <h1 className="text-5xl text-black font-bold mb-6 tracking-wide">
            Herbinate
          </h1>

          <h2 className="text-2xl text-black font-semibold mb-2">
            ลืมรหัสผ่าน?
          </h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            กรุณากรอกอีเมล์ของคุณ เราจะส่งรหัส OTP <br />
            เพื่อใช้ในการตั้งรหัสผ่านใหม่
          </p>

          <div className="w-full max-w-md">
            <div className="mb-6">
              <label className="block text-sm text-black mb-1">อีเมล์</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black"
                placeholder="example@mail.com"
              />
            </div>

            <button
              onClick={requestReset}
              disabled={loading}
              className="w-full py-3 bg-[#71CE61] text-white rounded-md font-semibold cursor-pointer disabled:opacity-50"
            >
              {loading ? "กำลังส่งข้อมูล..." : "ส่งรหัส OTP"}
            </button>

            {error && (
              <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
            )}

            <div className="text-center text-black mt-6 text-sm">
              นึกรหัสผ่านออกแล้ว?{" "}
              <span
                onClick={() => router.push("/login")}
                className="text-[#1C7D29] font-semibold cursor-pointer hover:underline"
              >
                กลับไปเข้าสู่ระบบ
              </span>
            </div>
          </div>
        </div>

        <div className="h-[6vh] min-h-6" />
      </div>

      <Footer />
    </div>
  );
}