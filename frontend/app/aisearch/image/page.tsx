"use client";

import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

export default function AIImagePage() {
  return (
    <main className="min-h-svh bg-white flex flex-col">
      <Nav />

      <section className="flex-1 px-4 py-6 max-w-md mx-auto">
        <h1 className="text-lg font-bold text-center mb-4">
          AI ค้นหาสมุนไพรจากภาพ
        </h1>

        <div className="border-2 border-dashed border-green-400 rounded-xl p-6 text-center">
          <p className="mb-3">อัปโหลดภาพสมุนไพร</p>
          <input type="file" accept="image/*" className="hidden" id="upload" />
          <label
            htmlFor="upload"
            className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            เลือกรูปภาพ
          </label>
        </div>
      </section>

      <Footer />
    </main>
  );
}

