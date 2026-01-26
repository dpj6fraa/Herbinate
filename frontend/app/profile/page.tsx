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
  const [email, setEmail] = useState("");

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


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

  const res = await fetch("http://localhost:8080/users/profile-image", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  setProfileImage(data.profile_image_url);

  window.dispatchEvent(new Event("profile-updated"));
}
async function saveUsername() {
  if (!username.trim()) return;

  setSaving(true);
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:8080/users/username", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username }),
  });

  setSaving(false);

  if (res.ok) {
    window.dispatchEvent(new Event("profile-updated"));
  }
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

<div
  onClick={() => fileInputRef.current?.click()}
  className="relative w-20 h-20 rounded-full cursor-pointer group"
>
  <img
    src={
      profileImage
        ? `http://localhost:8080${profileImage}`
        : "/default_profile_picture.png"
    }
    className="w-full h-full rounded-full object-cover"
  />

  {/* Green highlight */}
  <div className="absolute inset-0 rounded-full ring-0 group-hover:ring-4 ring-[#71CE61] transition"></div>
</div>

<input
  type="file"
  accept="image/*"
  ref={fileInputRef}
  onChange={handleImageChange}
  className="hidden"
/>


              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    value={username}
                    autoFocus
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={() => {
                      setIsEditing(false);
                      saveUsername();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsEditing(false);
                        saveUsername();
                      }
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
