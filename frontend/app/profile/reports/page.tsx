"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { 
  AlertTriangle, 
  Leaf, 
  BookOpen, 
  FileText, 
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight
} from "lucide-react";

// ปรับ Status ให้ตรงกับ Go (StatusPending, StatusReviewed, StatusResolved, StatusDismissed)
type ReportDetail = {
  id: string;
  target_type: "herb" | "article" | "community" | "comment";
  target_id: string;
  community_post_id?: string; // ✅ เพิ่มเพื่อรับค่า Post ID ของคอมเมนต์
  target_name: string;
  reporter_id: string;
  reason: string;
  detail: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  admin_note: string;
  created_at: string;
};

// Type สำหรับข้อมูลที่เพิ่งรับมาจาก Backend (ยังไม่ได้แปลง)
type RawReport = {
  _id?: string;
  id?: string;
  target_type: string;
  target_id: string;
  community_post_id?: string; // ✅ เพิ่มตรงนี้
  target_name: string;
  reporter_id: string;
  reason: string;
  detail: string;
  status: string;
  admin_note: string;
  created_at?: string | { $date: string };
  createdAt?: string;
};

export default function MyReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // States สำหรับ Search & Keywords
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }

  fetch("http://localhost:8080/api/reports/my-reports", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("failed to fetch reports");
      return res.json();
    })
    .then((data: RawReport[] | null) => {
      // ✅ แก้ปัญหา null ด้วยการ fallback เป็นอาร์เรย์ว่าง
      const safeData = data || []; 

    const formattedData: ReportDetail[] = safeData.map((r) => {
      const dateStr = typeof r.created_at === "string" 
        ? r.created_at 
        : (typeof r.created_at === "object" && r.created_at !== null && "$date" in r.created_at)
          ? r.created_at.$date
          : "";
    
      return {
        id: r.id || r._id || "",
        // ✅ ตรวจสอบประเภทให้แม่นยำขึ้น
        target_type: (["herb", "article", "community", "comment"].includes(r.target_type) 
          ? r.target_type 
          : "community") as "herb" | "article" | "community" | "comment",
        target_id: r.target_id || "",
        community_post_id: r.community_post_id || "",
        target_name: r.target_name || "ไม่มีชื่อระบุ",
        reporter_id: r.reporter_id || "",
        reason: r.reason || "ไม่ระบุเหตุผล",
        detail: r.detail || "",
        status: (["pending", "reviewed", "resolved", "dismissed"].includes(r.status) 
          ? r.status 
          : "pending") as "pending" | "reviewed" | "resolved" | "dismissed",
        admin_note: r.admin_note || "",
        created_at: dateStr,
      };
    });
      
      setReports(formattedData);
    })
    .catch((error) => {
      console.error("Fetch Error:", error);
      setReports([]); // ถ้า Error ให้เซ็ตเป็นว่างเพื่อหยุด Loading
    })
    .finally(() => setLoading(false));
}, [router]);
  
  // ปิด Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addKeyword = (keyword: string) => {
    if (!selectedKeywords.includes(keyword)) {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const removeKeyword = (keywordToRemove: string) => {
    setSelectedKeywords(selectedKeywords.filter(k => k !== keywordToRemove));
  };

  // 🌟 Helper Functions สำหรับจัดหน้าตา UI ตามประเภทและสถานะ
    const getStatusUI = (status: string) => {
      switch (status.toLowerCase()) {
        case "resolved":
          return { text: "แก้ไขเรียบร้อย", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 };
        case "reviewed":
          return { text: "กำลังตรวจสอบ", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock };
        case "dismissed":
          return { text: "ยกเลิกการรายงาน", color: "bg-gray-100 text-gray-500 border-gray-200", icon: XCircle };
        case "pending":
        default:
          return { text: "รอดำเนินการ", color: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock };
      }
    };

    const getTargetTypeUI = (type: string) => {
      switch (type.toLowerCase()) {
        case "herb": return { text: "สมุนไพร", icon: Leaf, color: "text-emerald-600 bg-emerald-50" };
        case "article": return { text: "บทความ", icon: BookOpen, color: "text-blue-600 bg-blue-50" };
        case "community": return { text: "โพสต์ชุมชน", icon: FileText, color: "text-purple-600 bg-purple-50" };
        case "comment": return { text: "ความเห็น", icon: MessageSquare, color: "text-pink-600 bg-pink-50" }; // ✅ เพิ่มไอคอนความเห็น
        default: return { text: "อื่นๆ", icon: AlertTriangle, color: "text-gray-600 bg-gray-100" };
      }
    };

  // กรองข้อมูล
  const filteredReports = reports.filter(report => {
    const textToSearch = `${report.target_name} ${report.reason} ${report.detail} ${getTargetTypeUI(report.target_type).text}`.toLowerCase();
    const matchesSearch = searchQuery === "" || textToSearch.includes(searchQuery.toLowerCase());
    const matchesKeywords = selectedKeywords.length === 0 || selectedKeywords.every(k => textToSearch.includes(k.toLowerCase()));
    return matchesSearch && matchesKeywords;
  });

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 pt-4 md:w-full relative">
      <Nav />

      <div className="flex-1 flex flex-col pt-4 lg:items-center w-full pb-10">
        <div className="flex flex-col items-center justify-center px-4 md:px-6 w-full max-w-2xl">

          {/* Header */}
          <div className="flex items-center justify-start w-full gap-3 mb-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer text-gray-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-[20px] md:text-[24px] text-black font-bold">ติดตามการรายงาน</h1>
          </div>

          {/* 🌟 ก้อนค้นหาอัจฉริยะ (Smart Search Box) */}
          <div className="relative w-full mt-2" ref={dropdownRef}>
            <div className={`flex flex-wrap items-center gap-2 w-full min-h-[48px] p-2 rounded-2xl md:rounded-full bg-white border-2 transition-colors shadow-sm ${isDropdownOpen ? 'border-[#71CE61]' : 'border-gray-200 focus-within:border-[#71CE61]'}`}>
              <span className="text-gray-400 pl-2 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>

              {selectedKeywords.map((keyword) => (
                <span key={keyword} className="flex items-center gap-1 bg-[#E1F7DB] text-[#1C7D29] border border-[#71CE61] px-3 py-1 rounded-full text-xs font-semibold animate-in zoom-in duration-200">
                  {keyword}
                  <button onClick={() => removeKeyword(keyword)} className="hover:text-red-500 hover:bg-white rounded-full p-0.5 ml-1 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim() !== "") addKeyword(searchQuery.trim());
                  if (e.key === "Backspace" && searchQuery === "" && selectedKeywords.length > 0) removeKeyword(selectedKeywords[selectedKeywords.length - 1]);
                }}
                placeholder={selectedKeywords.length === 0 ? "ค้นหาจากชื่อหัวข้อ, เหตุผล หรือสถานะ..." : "พิมพ์แล้วกด Enter..."}
                className="flex-1 min-w-[120px] bg-transparent text-sm md:text-base text-gray-800 outline-none px-1"
              />

              {(searchQuery || selectedKeywords.length > 0) && (
                <button
                  onClick={() => { setSearchQuery(""); setSelectedKeywords([]); }}
                  className="text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors p-1.5 mr-1 cursor-pointer shrink-0"
                  title="ล้างทั้งหมด"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              )}
            </div>
            
            {isDropdownOpen && searchQuery.trim() !== "" && (
               <div className="absolute top-[110%] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div 
                    onClick={() => addKeyword(searchQuery.trim())}
                    className="px-4 py-3 hover:bg-[#EEFFE5] cursor-pointer text-sm font-medium text-gray-700 flex items-center justify-between transition-colors"
                  >
                    <span>ค้นหาคำว่า <span className="text-[#1C7D29] font-bold">&ldquo;{searchQuery}&rdquo;</span></span>
                    <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded bg-gray-50">กด Enter</span>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* --- ส่วนแสดงผลการ์ดการรายงาน --- */}
        <div className="flex flex-col gap-4 mt-6 mb-12 px-4 md:px-6 w-full max-w-2xl">
          {loading ? (
            <div className="w-full flex flex-col items-center my-10">
              <div className="w-8 h-8 border-[3px] border-green-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500 text-sm animate-pulse">กำลังโหลดข้อมูลการรายงาน...</p>
            </div>
          ) : filteredReports.length > 0 ? (
            filteredReports.map(report => {
              const statusUI = getStatusUI(report.status);
              const typeUI = getTargetTypeUI(report.target_type);
              const TypeIcon = typeUI.icon;
              const StatusIcon = statusUI.icon;

              return (
                <div
                  key={report.id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                >
                  {/* Header การ์ด (สถานะ & ประเภท) */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${typeUI.color}`}>
                        <TypeIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[13px] font-bold text-gray-700">{typeUI.text}</span>
                    </div>

                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusUI.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusUI.text}
                    </div>
                  </div>

                  {/* Body การ์ด (เนื้อหาที่รายงาน) */}
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 font-semibold mb-0.5">หัวข้อที่รายงาน</span>
                      <div 
                        className="font-bold text-gray-800 text-[15px] flex items-center justify-between cursor-pointer hover:text-green-600 transition-colors"
                        onClick={() => {
                          if (report.target_type === 'herb') {
                            router.push(`/herbs/${report.target_id}`);
                          } else if (report.target_type === 'article') {
                            router.push(`/articles/${report.target_id}`);
                          } else if (report.target_type === 'community') {
                            // ถ้าเป็นโพสต์ ใช้ target_id ได้เลย
                            router.push(`/post/${report.target_id}`);
                          } else if (report.target_type === 'comment') {
                            // ✅ ถ้าเป็นคอมเมนต์ ให้ใช้ community_post_id ที่ Backend หามาให้
                            // หากหาไม่เจอ (โพสต์โดนลบ) ก็ให้ไปที่ target_id เดิมเพื่อโชว์หน้า Error สวยๆ
                            const postId = report.community_post_id || report.target_id;
                            router.push(`/post/${postId}`);
                          }
                        }}
                      >
                        <span className="truncate pr-2">{report.target_name || "ไม่มีชื่อระบุ"}</span>
                        <ChevronRight className="w-4 h-4 shrink-0 text-gray-300" />
                      </div>
                    </div>

                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-3 mt-1">
                      <span className="text-[12px] font-bold text-red-600 flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        เหตุผล: {report.reason}
                      </span>
                      {report.detail && (
                        <p className="text-[13px] text-gray-600 leading-relaxed pl-5">
                          &ldquo;{report.detail}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer การ์ด (Admin Note & Date) */}
                  <div className="px-4 py-3 bg-gray-50 flex flex-col gap-2 border-t border-gray-100">
                    {/* แสดงข้อความจากแอดมินถ้ามี */}
                    {report.admin_note ? (
                      <div className="flex gap-2">
                        <div className="w-1 bg-green-400 rounded-full shrink-0"></div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-gray-500 mb-0.5">ข้อความจากผู้ดูแลระบบ:</span>
                          <span className="text-[13px] text-gray-800 font-medium">{report.admin_note}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[12px] text-gray-400 italic">
                        {report.status === 'pending' ? "แอดมินกำลังตรวจสอบรายงานของคุณ..." : "ไม่มีข้อความเพิ่มเติมจากผู้ดูแลระบบ"}
                      </span>
                    )}

                    <div className="flex justify-end">
                      <span className="text-[10px] text-gray-400 font-medium">
                        ส่งรายงานเมื่อ: {new Date(report.created_at).toLocaleString("th-TH")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-full text-center my-16 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                <AlertTriangle className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-700 text-lg font-bold">ไม่มีประวัติการรายงาน</p>
              <p className="text-gray-500 text-sm mt-1">ยอดเยี่ยม! คุณยังไม่พบปัญหาใดๆ ในระบบ</p>
              {(searchQuery || selectedKeywords.length > 0) && (
                <button
                  onClick={() => { setSearchQuery(""); setSelectedKeywords([]); }}
                  className="mt-5 px-6 py-2.5 bg-[#71CE61] text-white rounded-full text-sm font-semibold hover:bg-[#60b552] transition-colors shadow-md"
                >
                  ล้างการค้นหาทั้งหมด
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}