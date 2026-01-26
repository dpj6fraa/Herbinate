"use client";

export default function FindHerbs() {
    return (
        <div className="flex flex-col items-center justify-center px-6">
            <h1 className="text-[24px] text-black w-full">สมุนไพรทั้งหมด</h1>
            <div className="relative max-w-lg mx-25 w-full">
                <input
                    type="text"
                    placeholder="ค้นหาสมุนไพร..."
                    className="w-full py-0.5 px-6 rounded-full text-gray-400 text-center focus:outline-none border-2 border-gray-500 my-4"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-black cursor-pointer"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg></span>
            </div>

            <div className="flex justify-start items-center w-full text-black">
                <a className=" flex pr-4 cursor-pointer">
                    <div className="flex justify-center items-center border-2 border-gray-500 px-3 py-1 rounded-2xl">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4H20L14 12V18L10 21V12L4 4Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        ทุกหมวดหมู่
                    </div>
                </a>
                <a className="pr-4 cursor-pointer">
                    <div className="flex justify-center border-2 border-gray-500 px-3 py-1 rounded-2xl">ระบบย่อยอาหาร</div>
                </a>
                <a className="pr-4 cursor-pointer">
                    <div className="flex justify-center border-2 border-gray-500 px-3 py-1 rounded-2xl">เสริมภูมิคุ้มกัน</div>
                </a>
                <a className="pr-4 cursor-pointer">
                    <div className="flex justify-center border-2 border-gray-500 px-3 py-1 rounded-2xl">บำรุงหัวใจ</div>
                </a>
            </div>

        </div>
    )
}