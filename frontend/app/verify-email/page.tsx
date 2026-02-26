"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Footer from "@/app/components/Footer";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // 🌟 State สำหรับปุ่มยืนยัน
  const [resending, setResending] = useState(false); // 🌟 State สำหรับปุ่มส่ง OTP ใหม่
  const [resendMsg, setResendMsg] = useState(""); // 🌟 ข้อความแจ้งเตือนเวลาส่ง OTP ใหม่สำเร็จ

  async function verify() {
    setError("");
    setResendMsg("");

    if (!otp.trim()) {
      setError("กรุณากรอกรหัส OTP");
      return;
    }

    setLoading(true); // 🌟 เริ่มโหลด
    try {
      const res = await fetch("http://localhost:8080/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) {
        setError("OTP ไม่ถูกต้องหรือหมดอายุ");
        setLoading(false); // 🌟 หยุดโหลดเมื่อ error
        return;
      }

      setSuccess(true);
      // ไม่ต้อง setLoading(false) ปล่อยปุ่มค้างไว้ระหว่างรอเปลี่ยนหน้า
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      setLoading(false);
    }
  }

  async function resend() {
    setError("");
    setResendMsg("");
    setResending(true); // 🌟 เริ่มโหลดตอนขอ OTP ใหม่

    try {
      const res = await fetch("http://localhost:8080/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setResendMsg("ส่ง OTP ใหม่สำเร็จ! โปรดเช็คอีเมลของคุณ");
      } else {
        setError("เกิดข้อผิดพลาดในการส่ง OTP ใหม่");
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setResending(false); // 🌟 หยุดโหลดไม่ว่าจะสำเร็จหรือพัง
    }
  }

  if (!email) {
    return (
      <div className="min-h-svh bg-white flex items-center justify-center">
        <p className="p-8 text-red-600 bg-red-50 rounded-md border border-red-200">
          Invalid link. ไม่พบอีเมลที่ต้องการยืนยัน
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <h1 className="text-3xl text-black font-bold mb-2 tracking-wide">
          ยืนยันอีเมล
        </h1>

        <p className="text-sm text-gray-600 mb-6 text-center leading-relaxed">
          กรุณากรอกรหัส OTP ที่ส่งไปยัง <br />
          <span className="font-semibold text-black">{email}</span>
        </p>

        <div className="w-full max-w-xs flex flex-col items-center">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={success || loading}
            className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-medium
                       bg-[#CFF3C5] text-black rounded-md outline-none focus:ring-2 focus:ring-[#71CE61] transition-shadow
                       disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="123456"
            maxLength={6}
          />

          <button
            onClick={verify}
            disabled={loading || success || otp.length < 6} // 🌟 บังคับว่าต้องพิมพ์ให้ครบ 6 ตัวถึงจะกดได้
            className="mt-6 w-full py-3 bg-[#71CE61] hover:bg-[#60b552] text-white rounded-md font-semibold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังตรวจสอบ..." : success ? "ยืนยันสำเร็จ!" : "ยืนยัน"}
          </button>

          <button
            onClick={resend}
            disabled={resending || success || loading} // 🌟 ปิดปุ่มถ้าระบบทำงานอย่างอื่นอยู่
            className="mt-4 text-sm text-[#1C7D29] hover:text-green-800 transition-colors cursor-pointer disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
          >
            {resending ? "กำลังส่ง OTP..." : "ส่ง OTP ใหม่"}
          </button>

          {/* แจ้งเตือน Error / Success / Resend Msg */}
          <div className="mt-4 min-h-[1.5rem] text-center text-sm font-medium">
            {error && <p className="text-red-600 animate-pulse">{error}</p>}
            {success && <p className="text-green-600 animate-pulse">กำลังพากลับไปหน้าเข้าสู่ระบบ...</p>}
            {resendMsg && !success && !error && <p className="text-[#1C7D29] animate-pulse">{resendMsg}</p>}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}