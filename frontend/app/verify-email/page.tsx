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

  async function verify() {
    setError("");

    if (!otp.trim()) {
      setError("กรุณากรอกรหัส OTP");
      return;
    }

    const res = await fetch("http://localhost:8080/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (!res.ok) {
      setError("OTP ไม่ถูกต้องหรือหมดอายุ");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  async function resend() {
    await fetch("http://localhost:8080/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    alert("ส่ง OTP ใหม่แล้ว");
  }

  if (!email) {
    return <p className="p-8 text-red-600">invalid link</p>;
  }

  return (
    <div className="min-h-svh bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <h1 className="text-3xl text-black font-bold mb-4">ยืนยันอีเมล</h1>

        <p className="text-sm text-black mb-4">
          กรุณากรอกรหัส OTP ที่ส่งไปยังอีเมลของคุณ
        </p>

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full max-w-xs px-4 py-2 text-center text-lg tracking-widest
                     bg-[#CFF3C5] text-black rounded-md focus:ring-2 focus:ring-[#71CE61]"
          placeholder="123456"
        />

        <button
          onClick={verify}
          className="mt-4 w-full max-w-xs py-3 bg-[#71CE61] text-white rounded-md font-semibold"
        >
          ยืนยัน
        </button>

        <button
          onClick={resend}
          className="mt-2 text-sm text-[#1C7D29] underline"
        >
          ส่ง OTP ใหม่
        </button>

        {error && <p className="mt-3 text-red-600">{error}</p>}
        {success && <p className="mt-3 text-green-600">ยืนยันสำเร็จ 🎉</p>}
      </div>

      <Footer />
    </div>
  );
}
