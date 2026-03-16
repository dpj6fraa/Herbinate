// hooks/useReport.ts
// Hook กลางสำหรับส่ง Report ทุกประเภท
// ใช้ร่วมกันได้ทั้ง HerbReportModal, ArticleReportModal, CommunityReportModal

const API = "http://localhost:8080";

export type TargetType = "herb" | "article" | "community";

export interface ReportPayload {
  target_type: TargetType;
  target_id: string;
  target_name: string;
  reason: string;
  detail?: string;
}

export interface UseReportResult {
  submitReport: (payload: ReportPayload) => Promise<{ ok: boolean; message: string }>;
}

export function useReport(): UseReportResult {
  const submitReport = async (
    payload: ReportPayload
  ): Promise<{ ok: boolean; message: string }> => {
    const token = localStorage.getItem("token");

    if (!token) {
      return { ok: false, message: "กรุณา Login ก่อนรายงานเนื้อหา" };
    }

    try {
      const res = await fetch(`${API}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // 409 = เคย report ไว้แล้ว
        return { ok: false, message: data.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่" };
      }

      return { ok: true, message: data.message ?? "ส่งรายงานเรียบร้อย" };
    } catch {
      return { ok: false, message: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" };
    }
  };

  return { submitReport };
}