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

async function register() {
  setError("");

  if (!username.trim()) {
    setError("กรุณากรอกชื่อผู้ใช้");
    return;
  }

  if (!email.trim()) {
    setError("กรุณากรอกอีเมล์");
    return;
  }

  if (password !== confirmPassword) {
    setError("รหัสผ่านไม่ตรงกัน");
    return;
  }

  if (!accepted) {
    setError("กรุณายอมรับเงื่อนไขการใช้งาน");
    return;
  }

  const payload = {
    email: email.trim(),
    password,
    username: username.trim(),
  };

  console.log("Sending payload:", payload); // Debug

  try {
    const res = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("Response status:", res.status); // Debug

    if (!res.ok) {
      const errorText = await res.text();
      console.log("Error response:", errorText); // Debug
      setError(errorText || "เกิดข้อผิดพลาด");
      return;
    }

    router.push("/login");
  } catch (err) {
    console.error("Fetch error:", err);
    setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
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
                className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black"
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
                className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black"
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
                  className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black"
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
                  className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black"
                />
              </div>
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-2 mb-4 text-sm text-black">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="

                  cursor-pointer

                  mt-0.5
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
              <span>
                ฉันยอมรับ{" "}
                <span className="text-[#1C7D29] underline cursor-pointer">
                  เงื่อนไขการใช้งาน
                </span>
              </span>
            </label>

            <button
              onClick={register}
              className="w-full py-3 bg-[#71CE61] text-white rounded-md font-semibold cursor-pointer"
            >
              สมัครสมาชิก
            </button>

            {error && (
              <p className="mt-3 text-center text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <div className="text-center text-black mt-6 text-sm">
            มีบัญชีอยู่แล้ว?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-[#1C7D29] font-semibold cursor-pointer hover:underline"
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
