import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-svh bg-white flex flex-col">
      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-between px-6 sm:px-10">
        {/* Top Spacer */}
        <div className="h-[10vh] min-h-16" />

        {/* Main Content */}
        <div className="flex flex-col items-center">
          {/* Brand */}
          <h1 className="text-5xl text-black font-bold mb-6 tracking-wide">
            Herbinate
          </h1>

          <h2 className="text-2xl text-black font-semibold mb-8">
            เข้าสู่ระบบ
          </h2>

          {/* Login Panel */}
          <div className="w-full max-w-md">
            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm text-black mb-1">อีเมล์</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm text-black mb-1">รหัสผ่าน</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-md bg-[#CFF3C5] focus:ring-2 focus:ring-[#71CE61] text-black"
              />
            </div>

            {/* Remember */}
            <div className="flex justify-between items-center mb-6 text-sm">
              <label className="flex gap-2 items-center text-black">
                <input
                  type="checkbox"
                  className="appearance-none w-4 h-4 bg-gray-300 rounded checked:bg-[#71CE61]
                    checked:after:content-['✓']
                    checked:after:absolute
                    checked:after:text-white
                    checked:after:text-xs
                    relative"
                />
                จดจำฉันไว้
              </label>

              <button className="text-[#1C7D29] hover:underline">
                ลืมรหัสผ่าน
              </button>
            </div>

            <button className="w-full py-3 bg-[#71CE61] text-white rounded-md font-semibold">
              เข้าสู่ระบบ
            </button>

            {/* Social */}
            <div className="my-6 text-center text-sm text-gray-500">
              หรือเข้าสู่ระบบผ่าน
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button className="w-12 h-12 border rounded-full flex items-center justify-center">
                <Image src="/globe.svg" alt="social" width={24} height={24} />
              </button>
              <button className="w-12 h-12 border rounded-full flex items-center justify-center">
                <Image src="/globe.svg" alt="social" width={24} height={24} />
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              หากยังไม่มีบัญชี{" "}
              <span className="text-[#1C7D29] font-semibold cursor-pointer">
                สมัครสมาชิก
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Spacer */}
        <div className="h-[6vh] min-h-6" />
      </div>

      {/* Footer (Scroll to see) */}
      <footer className="bg-gray-800 text-gray-300 text-sm text-center py-4">
        © 2026 Brand Name
      </footer>
    </div>
  );
}
