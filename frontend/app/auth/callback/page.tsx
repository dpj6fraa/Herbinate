"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/homepage";
    } else {
      // ไม่มี token → กลับหน้า login
      router.replace("/login");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-500 text-sm animate-pulse">กำลังเข้าสู่ระบบ...</p>
    </div>
  );
}