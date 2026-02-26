"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Footer from "@/app/components/Footer";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // 🌟 เพิ่ม State Loading

  async function register() {
    setError("");

    // ตรวจสอบข้อมูลพื้นฐาน
    if (!username.trim()) return setError("กรุณากรอกชื่อผู้ใช้");
    if (!email.trim()) return setError("กรุณากรอกอีเมล์");
    if (password !== confirmPassword) return setError("รหัสผ่านไม่ตรงกัน");
    if (!accepted) return setError("กรุณายอมรับเงื่อนไขการใช้งาน");

    setLoading(true); // 🌟 เริ่มโหลด

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          username: username.trim(),
        }),
      });

      const data = await res.json();

      // ❌ สมัครซ้ำ และ verified แล้ว
      if (res.status === 409) {
        setError("อีเมลนี้ถูกใช้งานแล้ว");
        setLoading(false); // 🌟 ปลดสถานะโหลดเมื่อเกิดข้อผิดพลาด
        return;
      }

      if (!res.ok) {
        setError(data.error || "สมัครไม่สำเร็จ");
        setLoading(false); // 🌟 ปลดสถานะโหลดเมื่อเกิดข้อผิดพลาด
        return;
      }

      // ✅ สมัครใหม่ หรือ สมัครซ้ำแต่ยังไม่ verify
      // ไม่ต้อง setLoading(false) ตรงนี้ เพื่อให้ปุ่มค้างสถานะโหลดไว้ ป้องกันหน้าจอกระพริบก่อนเปลี่ยนหน้า
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);

    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      setLoading(false); // 🌟 ปลดสถานะโหลดเมื่อเกิดข้อผิดพลาด
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

          <h2 className="text-2xl text-black font-semibold mb-5">
            สมัครสมาชิก
          </h2>

          <div className="w-full max-w-md">
            {/* Username */}
            <div className="mb-4">
              <label className="block text-sm text-black mb-1">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black outline-none transition-shadow"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm text-black mb-1">
                อีเมล์
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black outline-none transition-shadow"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-black mb-1">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm text-black mb-1">
                  ยืนยันรหัสผ่าน
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black outline-none transition-shadow"
                />
              </div>
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-2 mb-6 text-sm text-black cursor-pointer group">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="
                  cursor-pointer
                  mt-0.5
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
                "
              />
              <span className="group-hover:text-gray-700 transition-colors">
                ฉันยอมรับ{" "}
                <span className="text-[#1C7D29] hover:text-green-800 underline transition-colors">
                  เงื่อนไขการใช้งาน
                </span>
              </span>
            </label>

            <button
              onClick={register}
              disabled={loading} // 🌟 ปิดการใช้งานปุ่มเมื่อกำลังโหลด
              className="w-full py-3 bg-[#71CE61] hover:bg-[#60b552] text-white rounded-md font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </button>

            {error && (
              <p className="mt-3 text-center text-sm text-red-600 animate-pulse">
                {error}
              </p>
            )}
          </div>

          <div className="text-center text-black mt-6 text-sm">
            มีบัญชีอยู่แล้ว?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-[#1C7D29] font-semibold cursor-pointer hover:underline transition-all"
            >
              เข้าสู่ระบบ
            </span>
          </div>
        </div>

        <div className="h-[6vh] min-h-6" />
      </div>

      <Footer />
    </div>
  );
}