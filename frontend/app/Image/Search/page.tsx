'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export default function AiImagePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_AI_IMAGE_URL || "http://localhost:8000";
      const apiresult = process.env.NEXT_PUBLIC_AI_RESULT_URL || "http://localhost:888899";
      const formData = new FormData();
      formData.append('file', selectedFile);
      const token = localStorage.getItem("token");
      if (token) formData.append('token', token);

      const response = await fetch(`${apiUrl}/predict/`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('การอัปโหลดล้มเหลว');
      const data = await response.json();

      if (data.predictions?.length > 0) {
        try {
          const aiResponse = await fetch(`${apiresult}/api/herb-info`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ herb_name_en: data.predictions[0].class_name })
          });
          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            if (aiData.status === 'success' && aiData.data) data.ai_properties = aiData.data;
          }
        } catch (e) {
          console.error("Failed to fetch ai properties", e);
        }
      }

      sessionStorage.setItem('herbResult', JSON.stringify(data));
      router.push('/Image/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Nav />

      <div className="flex-1 flex items-start sm:items-center justify-center px-4 pt-6 pb-10 sm:py-8">
        <div className="w-full max-w-xl">

          {/* Header — เหมือน AI Text */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-50 border border-green-100 mb-4">
              <svg className="w-6 h-6 text-[#65B741]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1.5">
              AI ค้นหาสมุนไพรจากภาพ
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              อัปโหลดภาพสมุนไพร แล้วให้ AI ช่วยวิเคราะห์และแนะนำ
            </p>
          </div>

          {isUploading ? (
            /* Loading State — เหมือน AI Text */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 flex flex-col items-center text-center">
              <div className="relative w-16 h-16 mb-5">
                <div className="absolute inset-0 border-4 border-green-100 rounded-full"/>
                <div className="absolute inset-0 border-4 border-[#71CE61] border-t-transparent rounded-full animate-spin"/>
                <div className="absolute inset-0 flex items-center justify-center text-[#71CE61]">
                  <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-800 mb-2">กำลังวิเคราะห์ภาพ...</p>
              <p className="text-sm text-gray-400 mb-4">อาจใช้เวลาสักครู่</p>
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-xl border-2 border-green-100"/>
              )}
            </div>

          ) : (
            <>
              {/* Drop zone */}
              <div
                className="bg-white rounded-2xl border-2 border-dashed border-green-200 shadow-lg overflow-hidden mb-3 cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  /* มีรูปแล้ว — แสดง preview */
                  <div className="p-4 flex items-center gap-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-xl border-2 border-green-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{selectedFile?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB' : ''}
                      </p>
                      <p className="text-xs text-green-600 mt-1.5">แตะเพื่อเปลี่ยนรูป</p>
                    </div>
                  </div>
                ) : (
                  /* ยังไม่มีรูป — แสดง empty state */
                  <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-[#65B741]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <p className="text-gray-700 font-medium text-sm mb-1">แตะเพื่อเลือกภาพ</p>
                    <p className="text-gray-400 text-xs">JPG, PNG, JPEG · ไม่เกิน 10MB</p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-3">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* ปุ่ม Upload — แสดงเมื่อเลือกไฟล์แล้ว */}
              {selectedFile && (
                <button
                  onClick={handleUpload}
                  className="w-full bg-[#71CE61] hover:bg-[#5da84d] text-white font-bold py-3 rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 text-sm mb-3"
                >
                  วิเคราะห์ภาพนี้
                </button>
              )}

              {/* Info card — เหมือน suggested symptoms card ของ AI Text */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  เคล็ดลับการถ่ายภาพ
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707", text: "ถ่ายในที่แสงสว่างเพียงพอ" },
                    { icon: "M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", text: "โฟกัสที่ใบ ดอก หรือผลให้ชัด" },
                    { icon: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", text: "ถ่ายให้เห็นลักษณะเด่นของสมุนไพร" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-[#65B741]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={icon}/>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-center text-xs text-gray-400 mt-4 px-2 leading-relaxed">
                ระบบ AI วิเคราะห์จากภาพเบื้องต้นจากฐานข้อมูล<br/>
                <span className="italic">* ควรปรึกษาแพทย์หรือผู้เชี่ยวชาญก่อนใช้งานจริง</span>
              </p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}