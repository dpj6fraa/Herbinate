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
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_AI_IMAGE_URL || "http://localhost:8888";
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem("token");
      if (token) {
        formData.append('token', token);
      }

      const response = await fetch(`${apiUrl}/predict/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('การอัพโหลดล้มเหลว');
      }

      const data = await response.json();

      // Store result
      sessionStorage.setItem('herbResult', JSON.stringify(data));
      router.push('/Image/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setIsUploading(false);
    }
  };

  return (
    <>
      <Nav />
      {/* 1. แก้พื้นหลังให้เป็นขาว (ลบ bg-gradient และ from/to green ออก) */}
      <div className="min-h-screen bg-white flex items-start justify-center p-4 pt-20">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              AI ค้นหาสมุนไพรจากภาพ
            </h1>
            <p className="text-gray-600 text-lg">
              อัพโหลดภาพสมุนไพรที่คุณไม่รู้จักเพื่อให้ AI ช่วยวิเคราะห์
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="border-4 border-dashed border-green-200 rounded-xl p-12 text-center bg-green-50/30 hover:bg-green-50/50 transition-colors">
              {/* Upload Icon */}
              {!previewUrl && !isUploading && (
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-md">
                    <svg
                      className="w-12 h-12 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Upload Text */}
              {!previewUrl && !isUploading && (
                <p className="text-gray-700 text-lg mb-6 font-medium">
                  อัพโหลดภาพสมุนไพรที่คุณไม่รู้จักได้เลย
                </p>
              )}

              {/* Preview Image with Loading Spinner */}
              {previewUrl && (
                <div className="mb-6 relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                      <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <svg
                          className="animate-spin h-10 w-10 text-lime-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  )}
                  {!isUploading && (
                    <p className="mt-2 text-sm text-gray-600">{selectedFile?.name}</p>
                  )}
                </div>
              )}

              {/* Loading Text */}
              {isUploading && (
                <p className="text-gray-700 text-lg mb-6 font-medium">
                  กำลังประมวลผล...
                </p>
              )}

              {/* Error Message */}
              {error && (
                <p className="text-red-600 text-sm mb-4">
                  {error}
                </p>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />

              {/* Buttons */}
              {!isUploading && (
                <div className="flex justify-center gap-4">
                  {/* 3. เปลี่ยนสีปุ่มเป็นเขียวอ่อน (lime) */}
                  <button
                    onClick={handleButtonClick}
                    className="bg-[#71CE61] hover:bg-[#5da84d]  text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    {selectedFile ? 'เลือกใหม่' : 'เลือกไฟล์'}
                  </button>

                  {/* Upload Button (shown when file is selected) */}
                  {selectedFile && (
                    /* 3. เปลี่ยนสีปุ่มอัพโหลดเป็นเขียวที่เข้มขึ้น (emerald) แต่ไม่เขียวเข้ม */
                    <button
                      onClick={handleUpload}
                      className="bg-[#71CE61] hover:bg-[#5da84d]  text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                      อัพโหลด
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>รองรับไฟล์: JPG, PNG, JPEG</p>
              <p className="mt-1">ขนาดไฟล์ไม่เกิน 10MB</p>
            </div>
          </div>

          {/* 2. เอาปุ่ม "กลับ" ออก (ลบโค้ดส่วน Back Button ทั้งหมด) */}
          
        </div>
      </div>
      <Footer />
    </>
  );
}