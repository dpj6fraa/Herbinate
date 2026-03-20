"use client";

import { useEffect, useRef, useState } from "react";
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
  const [originalUsername, setOriginalUsername] = useState(""); // เก็บชื่อเดิมไว้เผื่อต้อง Reset ถ้า Error
  const [email, setEmail] = useState("");

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // 🌟 เพิ่ม State สำหรับเก็บข้อความ Error ชื่อซ้ำ
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:8080/api/me", {
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
        setOriginalUsername(data.username); // จำชื่อตั้งต้นไว้
        setEmail(data.email);
        setProfileImage(data.profile_image_url);
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

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("token");

    // โชว์ Loading ตรงรูปโปรไฟล์ได้ถ้าต้องการ (หรือเปลี่ยนรูปเป็นสีเทาๆ)
    const res = await fetch("http://localhost:8080/api/users/profile-image", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    setProfileImage(data.profile_image_url);

    window.dispatchEvent(new Event("profile-updated"));
  }

  async function saveUsername() {
    // ถ้าไม่ได้แก้ หรือลบจนว่าง ให้คืนค่ากลับเป็นชื่อเดิม
    if (!username.trim() || username === originalUsername) {
      setUsername(originalUsername);
      setIsEditing(false);
      setErrorMsg("");
      return;
    }

    setSaving(true);
    setErrorMsg(""); // ล้าง Error เก่าก่อน
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8080/api/users/username", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // ❌ ชื่อซ้ำ
        setErrorMsg(data.error || "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว");
        setUsername(originalUsername); // คืนค่าชื่อเดิมกลับมาโชว์
        setIsEditing(false); // ปิดโหมดแก้ไข
      } else if (!res.ok) {
        // ❌ Error อื่นๆ
        setErrorMsg("ไม่สามารถเปลี่ยนชื่อได้");
        setUsername(originalUsername);
        setIsEditing(false);
      } else {
        // ✅ เปลี่ยนสำเร็จ
        setOriginalUsername(username.trim()); // อัปเดตชื่อเดิมให้เป็นชื่อใหม่
        setIsEditing(false);
        window.dispatchEvent(new Event("profile-updated"));
      }
    } catch {
      setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      setUsername(originalUsername);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  // เคลียร์ Error เวลากดเริ่มแก้ไขใหม่
  const startEditing = () => {
    setErrorMsg("");
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center text-gray-600">
        <div className="w-8 h-8 border-[3px] border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-white flex flex-col">
      <Nav />

      <div className="flex-1 px-4 py-4">
        <div className="max-w-sm mx-auto mt-4">
          <h1 className="text-xl font-semibold text-black mb-4">
            บัญชีของฉัน
          </h1>

          {/* Profile Card */}
          <div className="bg-[#EEFFE5] rounded-xl p-6 mb-4 shadow-sm border border-green-50">
            <div className="flex flex-col items-center text-center">

              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 mb-4 rounded-full cursor-pointer group"
              >
                <img
                  src={
                    profileImage
                      ? `http://localhost:8080${profileImage}`
                      : "/default_profile_picture.png"
                  }
                  className="w-full h-full rounded-full object-cover shadow-md"
                  alt="Profile"
                />

                {/* Green highlight & Overlay text */}
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 ring-0 group-hover:ring-4 ring-[#71CE61] transition-all flex items-center justify-center">
                   <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md font-medium">เปลี่ยนรูป</span>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-1 w-full relative">
                <div className="flex items-center justify-center gap-2 w-full h-8">
                  {isEditing ? (
                    <input
                      value={username}
                      autoFocus
                      disabled={saving}
                      onChange={(e) => setUsername(e.target.value)}
                      onBlur={saveUsername} // บันทึกเมื่อคลิกที่อื่น
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveUsername();
                        if (e.key === "Escape") {
                          setUsername(originalUsername); // กดยกเลิก
                          setIsEditing(false);
                        }
                      }}
                      className="
                        text-base text-black font-semibold text-center
                        bg-[#CFF3C5] px-2 py-1 rounded-md
                        border border-[#71CE61] outline-none
                        focus:ring-2 focus:ring-[#71CE61] w-3/4
                        disabled:opacity-50 transition-all
                      "
                    />
                  ) : (
                    <>
                      <span className={`text-lg font-semibold text-black ${saving ? 'opacity-50 animate-pulse' : ''}`}>
                        {saving ? "กำลังบันทึก..." : username}
                      </span>
                      {!saving && (
                        <button
                          onClick={startEditing}
                          className="w-5 h-5 opacity-40 hover:opacity-100 cursor-pointer transition-opacity flex items-center justify-center"
                          title="แก้ไขชื่อผู้ใช้"
                        >
                          <Image src="/globe.svg" alt="edit" width={14} height={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* 🌟 แสดง Error Message สีแดงถ้าชื่อซ้ำ */}
                <div className="h-4 mt-1">
                  {errorMsg && (
                    <span className="text-xs text-red-500 font-medium animate-pulse">
                      {errorMsg}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-1 bg-white/50 px-3 py-1 rounded-full">{email}</div>
            </div>
          </div>

          {/* Account Data (ยังไม่ต่อ DB) */}
          <div className="bg-[#EEFFE5] border border-green-50 shadow-sm rounded-xl overflow-hidden mb-5">
            {items.map((item, index) => (
              <div
                key={item.label}
                onClick={() => {
                  if (item.label === "บทความที่บันทึก") {
                    router.push("/profile/saved-articles");
                  }
                }}
                className={`flex items-center justify-between px-4 py-3.5 hover:bg-green-50/50 cursor-pointer transition-colors ${
                  index !== items.length - 1 ? "border-b border-green-100" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#CFF3C5] flex items-center justify-center">
                    <Image src="/globe.svg" alt="icon" width={16} height={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 text-xs font-semibold text-white bg-[#1C7D29] rounded-full shadow-sm">
                    {item.count}
                  </span>
                  <span className="text-gray-400 text-lg font-light">{">"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full py-3 bg-[#71CE61] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-red-500 hover:shadow-md cursor-pointer transition-all duration-300 mb-8"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}