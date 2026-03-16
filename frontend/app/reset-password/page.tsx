"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Footer from "@/app/components/Footer";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    setError("");

    if (!otp.trim()) return setError("กรุณากรอกรหัส OTP");
    if (!newPassword.trim()) return setError("กรุณากรอกรหัสผ่านใหม่");
    if (newPassword !== confirmPassword) return setError("รหัสผ่านไม่ตรงกัน");

    setLoading(true);
    try {
      // ⚠️ ต้องไปสร้าง API เส้นนี้ใน Backend ด้วยนะครับ
      const res = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "OTP ไม่ถูกต้องหรือหมดอายุ");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      setLoading(false);
    }
  }

  if (!email) {
    return <p className="p-8 text-red-600 text-center">Invalid link. Please go back.</p>;
  }

  return (
    <div className="min-h-svh bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-10">
        <h1 className="text-3xl text-black font-bold mb-2">ตั้งรหัสผ่านใหม่</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          กรุณากรอกรหัส OTP ที่ส่งไปยัง <br />
          <span className="font-semibold text-black">{email}</span>
        </p>

        <div className="w-full max-w-sm">
          <div className="mb-4">
            <label className="block text-sm text-black mb-1">รหัส OTP 6 หลัก</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 text-center text-lg tracking-widest bg-[#CFF3C5] text-black rounded-md focus:ring-2 focus:ring-[#71CE61]"
              placeholder="123456"
              maxLength={6}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-black mb-1">รหัสผ่านใหม่</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-black mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black"
            />
          </div>

          <button
            onClick={handleResetPassword}
            disabled={loading || success}
            className="w-full py-3 bg-[#71CE61] text-white rounded-md font-semibold cursor-pointer disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
          </button>

          {error && <p className="mt-3 text-sm text-red-600 text-center">{error}</p>}
          {success && (
            <p className="mt-3 text-sm text-green-600 text-center">
              เปลี่ยนรหัสผ่านสำเร็จ! กำลังพากลับไปหน้าเข้าสู่ระบบ...
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}