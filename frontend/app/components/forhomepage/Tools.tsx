"use client";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function Tools() {
    return (
        <div className="w-full bg-white sm:px-6">
            <div className="bg-white border-b border-gray-200/50">
                <div className="max-w-150 mx-auto px-4 py-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-700">
                        เครื่องมือ
                    </h2>
                    <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                        <Menu className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="bg-white py-4">
                <div className="max-w-150 mx-auto px-4">
                    <div className="grid grid-cols-2 gap-2.5">
                        <Link href="/aisearch/image" className="flex flex-col justify-center border border-gray-300 p-3 rounded-xl bg-green-50/50 hover:bg-green-50 transition-colors duration-200">
                            <div className="flex justify-start items-center gap-2">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M2 7V3C2 2.44772 2.44772 2 3 2H7" stroke="black" strokeWidth={2} strokeLinecap="round" />
                                    <path d="M17 2H21C21.5523 2 22 2.44772 22 3V7" stroke="black" strokeWidth={2} strokeLinecap="round" />
                                    <path d="M2 17V21C2 21.5523 2.44772 22 3 22H7" stroke="black" strokeWidth={2} strokeLinecap="round" />
                                    <path d="M17 22H21C21.5523 22 22 21.5523 22 21V17" stroke="black" strokeWidth={2} strokeLinecap="round" />
                                    <path d="M11.8 19C11.8 19 5.5 17.5 5 13C4.5 9.5 9 9 11.8 14" fill="black" />
                                    <path d="M12.2 19C12.2 19 18.5 17.5 19 13C19.5 9.5 15 9 12.2 14" fill="black" />
                                    <path d="M12 16C14 14 15 11 12 5C9 11 10 14 12 16Z" fill="black" />
                                </svg>
                                <h3 className="text-xs text-gray-800 font-medium">AI Scanner</h3>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-1.5">ถ่ายรูประบุสมุนไพร</p>
                        </Link>

                        <Link href="/aisearch/text" className="flex flex-col justify-center border border-gray-300 p-3 rounded-xl bg-green-50/50 hover:bg-green-50 transition-colors duration-200">
                            <div className="flex justify-start items-center gap-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 3H16.82C16.4 1.84 15.3 1 14 1H10C8.7 1 7.6 1.84 7.18 3H5C3.9 3 3 3.9 3 5V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V5C21 3.9 20.1 3 19 3Z" fill="black" />
                                    <path d="M14 3H10V5H14V3Z" fill="white" />
                                    <path d="M9 8H7V10H5V12H7V14H9V12H11V10H9V8Z" fill="white" />
                                    <path d="M5.5 18L8 20.5L12 15.5L10.5 14L8 17.5L6.5 16L5.5 18Z" fill="white" />
                                    <rect x="14" y="9" width="4" height="2" rx="0.5" fill="white" />
                                    <rect x="14" y="13" width="4" height="2" rx="0.5" fill="white" />
                                    <rect x="14" y="17" width="4" height="2" rx="0.5" fill="white" />
                                </svg>
                                <h3 className="text-xs text-gray-800 font-medium">AI Checker</h3>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-1.5">แนะนำสมุนไพรตามอาการ</p>
                        </Link>
                        <div className="flex flex-col justify-center border border-gray-300 p-3 rounded-xl bg-green-50/50 hover:bg-green-50 transition-colors duration-200">
                            <div className="flex justify-start items-center gap-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                <h3 className="text-xs text-gray-800 font-medium">Community</h3>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-1.5">ชุมชนผู้ใช้สมุนไพร</p>
                        </div>
                        <div className="flex flex-col justify-center border border-gray-300 p-3 rounded-xl bg-green-50/50 hover:bg-green-50 transition-colors duration-200">
                            <div className="flex justify-start items-center gap-2">
                                <svg width="18" height="18" viewBox="0 0 400 450" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g transform="scale(1.2) translate(-35, -20)">
                                        <path d="M200 180V300M150 380L200 300L250 380H150Z" stroke="black" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="black" />
                                        <rect x="70" y="240" width="260" height="12" rx="6" fill="black" />
                                        <path d="M70 310C70 345 100 370 135 370C170 370 200 345 200 310H70Z" fill="black" transform="translate(0, -50)" />
                                        <circle cx="135" cy="150" r="70" fill="black" />
                                        <path d="M135 60C135 60 115 80 115 100C115 120 135 130 135 130C135 130 155 120 155 100C155 80 135 60 135 60Z" fill="white" transform="translate(0, 40)" />
                                        <path d="M105 105C105 105 90 115 90 130C90 145 105 150 115 150C125 150 135 135 135 135C130 120 105 105 105 105Z" fill="white" transform="translate(0, 40)" />
                                        <path d="M165 105C165 105 180 115 180 130C180 145 165 150 155 150C145 150 135 135 135 135C140 120 165 105 165 105Z" fill="white" transform="translate(0, 40)" />
                                        <path d="M200 310C200 345 230 370 265 370C300 370 330 345 330 310H200Z" fill="black" transform="translate(0, -50)" />
                                        <circle cx="265" cy="150" r="70" fill="black" />
                                        <path d="M265 140V70M265 140L230 85M265 140L300 85" stroke="white" strokeWidth="10" strokeLinecap="round" transform="translate(0, 40)" />
                                    </g>
                                </svg>
                                <h3 className="text-xs text-gray-800 font-medium">Compare</h3>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-1.5">เปรียบเทียบสรรพคุณ</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}