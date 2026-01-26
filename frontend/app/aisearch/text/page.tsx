"use client";

import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

export default function AITextPage() {
  return (
    <main className="min-h-svh bg-white flex flex-col">
      <Nav />

      <section className="flex-1 px-4 py-6 max-w-md mx-auto">
        <h1 className="text-lg font-bold text-center mb-4">
          AI ค้นหาสมุนไพรจากอาการ
        </h1>

        <input
          type="text"
          placeholder="พิมพ์อาการ เช่น ปวดหัว ไอ เจ็บคอ"
          className="w-full border rounded-xl px-4 py-3 mb-3"
        />

        <button className="w-full bg-green-500 text-white py-3 rounded-xl">
          ค้นหา
        </button>
      </section>

      <Footer />
    </main>
  );
}
