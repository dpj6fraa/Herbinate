"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Footer from "@/app/components/Footer";
import Nav from "../components/Nav";
import { useRouter } from "next/navigation";

const items = [
  { label: "บทความที่บันทึก", count: 0 },
  { label: "ประวัติโพสในชุมชนที่ถูกใจ", count: 0 },
  { label: "จัดการความคิดเห็น", count: 0 },
  { label: "ประวัติการค้นหาสรรพคุณสมุนไพร", count: 0 },
  { label: "ประวัติการค้นหาสมุนไพร", count: 0 },
];

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:8080/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("unauthorized");
        return res.json();
      })
      .then((data) => {
        setUsername(data.username);
        setEmail(data.email);
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center text-gray-600">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-white flex flex-col">
      <Nav />

      <div className="flex-1 px-4 py-4">
        <div className="max-w-sm mx-auto">
          <h1 className="text-xl font-semibold text-black mb-4">
            บัญชีของฉัน
          </h1>

          {/* Profile Card */}
          <div className="bg-[#EEFFE5] rounded-xl p-4 mb-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-2">
                <Image src="/globe.svg" alt="profile" width={40} height={40} />
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    value={username}
                    autoFocus
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setIsEditing(false);
                    }}
                    className="
                      text-sm text-black font-semibold
                      bg-[#CFF3C5]
                      px-1 py-0
                      rounded
                      border-none
                      outline-none
                      focus:ring-1 focus:ring-[#71CE61]
                    "
                  />
                ) : (
                  <>
                    <span className="text-base font-semibold text-black">
                      {username}
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-4 h-4 opacity-60 hover:opacity-100"
                    >
                      <Image src="/globe.svg" alt="edit" width={14} height={14} />
                    </button>
                  </>
                )}
              </div>

              <div className="text-xs text-gray-700 mt-1">{email}</div>
            </div>
          </div>

          {/* Account Data (ยังไม่ต่อ DB) */}
          <div className="bg-[#EEFFE5] border rounded-xl overflow-hidden mb-5">
            {items.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center justify-between px-3 py-3 ${
                  index !== items.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#CFF3C5] flex items-center justify-center">
                    <Image src="/globe.svg" alt="icon" width={14} height={14} />
                  </div>
                  <span className="text-xs text-black">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] text-white bg-[#1C7D29] rounded-full">
                    {item.count}
                  </span>
                  <span className="text-gray-400 text-sm">{">"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full py-2.5 bg-[#71CE61] text-white rounded-md text-sm font-semibold hover:bg-red-600 transition"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
