"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "@/app/components/Footer";
import Nav from "../components/Nav";
import { useRouter } from "next/navigation";
import { 
  Bookmark, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  AlertTriangle,
  PencilLine
} from "lucide-react"; // 🌟 Import Icons สไตล์ Minimal

// 🌟 อัปเดตรายการเมนูตามที่คุณต้องการ
const menuItems = [
  { label: "สมุนไพรที่บันทึก", icon: Bookmark, path: "/profile/saved-herbs", count: 0 },
  { label: "บทความที่บันทึก", icon: BookOpen, path: "/profile/saved-articles", count: 0 },
  { label: "โพสต์ที่บันทึก", icon: FileText, path: "/profile/saved-posts", count: 0 },
  { label: "ประวัติคอมเมนต์", icon: MessageSquare, path: "/profile/comments", count: 0 },
  { label: "การรายงาน", icon: AlertTriangle, path: "/profile/reports", count: 0 },
];

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState(""); 
  const [email, setEmail] = useState("");

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 
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
        setOriginalUsername(data.username); 
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
    if (!username.trim() || username === originalUsername) {
      setUsername(originalUsername);
      setIsEditing(false);
      setErrorMsg("");
      return;
    }

    setSaving(true);
    setErrorMsg(""); 
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
        setErrorMsg(data.error || "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว");
        setUsername(originalUsername); 
        setIsEditing(false); 
      } else if (!res.ok) {
        setErrorMsg("ไม่สามารถเปลี่ยนชื่อได้");
        setUsername(originalUsername);
        setIsEditing(false);
      } else {
        setOriginalUsername(username.trim()); 
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

  const startEditing = () => {
    setErrorMsg("");
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center text-gray-600 bg-white">
        <div className="w-8 h-8 border-[3px] border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-gray-50 flex flex-col">
      <Nav />

      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            บัญชีของฉัน
          </h1>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 flex flex-col items-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-28 h-28 mb-5 rounded-full cursor-pointer group"
            >
              <img
                src={
                  profileImage
                    ? `http://localhost:8080${profileImage}`
                    : "/default_profile_picture.png"
                }
                className="w-full h-full rounded-full object-cover shadow-sm border-4 border-green-50"
                alt="Profile"
              />
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
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

            <div className="flex flex-col items-center w-full">
              <div className="flex items-center justify-center gap-2 w-full h-8 mb-1">
                {isEditing ? (
                  <input
                    value={username}
                    autoFocus
                    disabled={saving}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={saveUsername}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveUsername();
                      if (e.key === "Escape") {
                        setUsername(originalUsername);
                        setIsEditing(false);
                      }
                    }}
                    className="
                      text-lg text-black font-bold text-center
                      bg-green-50 px-3 py-1.5 rounded-lg
                      border border-green-400 outline-none
                      focus:ring-2 focus:ring-green-200 w-3/4
                      disabled:opacity-50 transition-all
                    "
                  />
                ) : (
                  <div className="flex items-center gap-2 group">
                    <span className={`text-xl font-bold text-gray-800 tracking-tight ${saving ? 'opacity-50 animate-pulse' : ''}`}>
                      {saving ? "กำลังบันทึก..." : username}
                    </span>
                    {!saving && (
                      <button
                        onClick={startEditing}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all"
                        title="แก้ไขชื่อผู้ใช้"
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Error Message */}
              <div className="h-5">
                {errorMsg && (
                  <span className="text-xs text-red-500 font-medium">
                    {errorMsg}
                  </span>
                )}
              </div>

              <div className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full mt-2">
                {email}
              </div>
            </div>
          </div>

          {/* Account Menu */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden mb-8">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  onClick={() => {
                    if (item.path) router.push(item.path);
                  }}
                  className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer transition-all active:scale-[0.99] ${
                    index !== menuItems.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[15px] font-semibold text-gray-700">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.count > 0 && (
                      <span className="px-2.5 py-0.5 text-xs font-bold text-white bg-green-500 rounded-full shadow-sm">
                        {item.count}
                      </span>
                    )}
                    <span className="text-gray-300 font-bold">{">"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full py-3.5 bg-white border-2 border-red-100 text-red-500 rounded-2xl text-[15px] font-bold shadow-sm hover:bg-red-50 hover:border-red-200 active:scale-[0.98] transition-all duration-200 mb-8"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}