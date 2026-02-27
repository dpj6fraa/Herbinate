"use client";

import React, { useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import CreatePostModal from "../components/forcommunity/CreatePostModal";
import ReportPostModal from "../components/forcommunity/ReportPostModal";
import {
    Search,
    Filter,
    Heart,
    MessageCircle,
    Upload,
    ArrowLeft,
    Plus,
    Edit,
} from "lucide-react";

// Fallbacks for Siren if needed. Wait, Lucide React ^0.563.0 has Siren. I'll use Siren.
import { Siren } from "lucide-react";

type CommentType = {
    id: number;
    avatar: string;
    name: string;
    text: string;
};

type PostType = {
    id: number;
    userAvatar: string;
    userName: string;
    time: string;
    title: string;
    snippet: string;
    fullDesc: string;
    image: string | null;
    likes: number;
    commentsCount: number;
    shares: number;
    isMine: boolean;
    comments?: CommentType[];
};

const POSTS_DATA: PostType[] = [
    {
        id: 1,
        userAvatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=150",
        userName: "สมจิตร จิตสงบ",
        time: "50 นาทีที่แล้ว",
        title: "ประโยชน์ของชาคาโมมายล์ต่อการนอน",
        snippet: "แค่อยากมาแชร์ประสบการณ์เกี่ยว กับชาคาโมมายล์ค่ะ ฉันดื่มมันก่อนนอนมา 2 สัปดาห์แล้ว และคุณภาพการนอนของฉันดีขึ้น...",
        fullDesc: "แค่อยากมาแชร์ประสบการณ์เกี่ยว\nกับชาคาโมมายล์ค่ะ\nฉันดื่มมันก่อนนอนมา 2\nสัปดาห์แล้ว\nและคุณภาพการนอนของฉันดีขึ้น\nอย่างมาก\nเคล็ดลับคือควรแช่ชาไว้อย่างน้อย\n5 นาทีเพื่อให้ได้ประโยชน์เต็มที่",
        image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=400",
        likes: 24,
        commentsCount: 5,
        shares: 2,
        isMine: false,
        comments: [
            { id: 101, avatar: "https://images.unsplash.com/photo-1614027164847-1b28cfe1bc60?auto=format&fit=crop&q=80", name: "แสนชัย สุขเกษม", text: "ถ้าเติมลาเวนเดอร์ลงไปนิดหน่อยด้วย! ได้ผลดีมากๆ เลย กลิ่นหอมผ่อนคลายสุดๆ" },
            { id: 102, avatar: "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?auto=format&fit=crop&q=80", name: "ดารินทร์ รักสุขภาพ", text: "ดื่มทุกวันเหมือนกันค่ะ แต่แนะนำว่าอย่าแช่ถุงชานานเกินไป รสชาติจะขม แช่แค่ 3-5 นาทีก็พอดีค่ะ" },
            { id: 103, avatar: "https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&q=80", name: "นพดล คนนอนดึก", text: "หาซื้อดอกคาโมมายล์แห้งได้ที่ไหนบ้างครับ? ปกติซื้อแต่แบบของในห้าง อยากลองแบบดอกตูมๆ บ้าง" },
            { id: 104, avatar: "https://images.unsplash.com/photo-1558913993-3bdf7a48d8a7?auto=format&fit=crop&q=80", name: "อารี มีน้ำใจ", text: "@นพดล คนนอนดึก ร้านสมุนไพรแถวเยาวราชมีขายเยอะเลยค่ะ หรือสั่งในแอปส้มก็ได้ มีหลายร้านเลย" }
        ]
    },
    {
        id: 2,
        userAvatar: "https://images.unsplash.com/photo-1425082661705-1834bfd08dca?auto=format&fit=crop&q=80&w=150",
        userName: "สมศักดิ์ มั่นคง",
        time: "2 ชั่วโมงที่แล้ว",
        title: "แบ่งปันสูตรยา",
        snippet: "แจกสูตรน้ำต้มสมุนไพรแก้ร้อนในครับ ใช้รากบัว เก๊กฮวย และหล่อฮังก๊วย ต้มรวมกัน ดื่มแบบเย็นชื่นใจมาก ใครสนใจสูตร...",
        fullDesc: "แจกสูตรน้ำต้มสมุนไพรแก้ร้อนในครับ ใช้รากบัว เก๊กฮวย และหล่อฮังก๊วย ต้มรวมกัน ดื่มแบบเย็นชื่นใจมาก ใครสนใจสูตรละเอียดทักมาได้เลย!",
        image: "https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=400",
        likes: 128,
        commentsCount: 15,
        shares: 20,
        isMine: true,
        comments: [
            { id: 201, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80", name: "มาลี ใจดี", text: "สูตรดีมากเลยค่ะ ลองทำตามแล้วสดชื่นจริงๆ" }
        ]
    },
    {
        id: 3,
        userAvatar: "https://images.unsplash.com/photo-1531685250784-afb34fb7c6f4?auto=format&fit=crop&q=80&w=150",
        userName: "วิชัย ใจกล้า",
        time: "1 วันที่แล้ว",
        title: "ขอคำแนะนำ",
        snippet: "ช่วยด้วยครับ! ต้นฟ้าทะลายโจรที่ปลูกไว้ใบเริ่มเหลืองเป็นจุดๆ ไม่แน่ใจว่าเป็นเพราะรดน้ำเยอะไปหรือเปล่า มีวิธีแก้เบื้องต้นไหมครับ?",
        fullDesc: "ช่วยด้วยครับ! ต้นฟ้าทะลายโจรที่ปลูกไว้ใบเริ่มเหลืองเป็นจุดๆ ไม่แน่ใจว่าเป็นเพราะรดน้ำเยอะไปหรือเปล่า มีวิธีแก้เบื้องต้นไหมครับ? ลองเปลี่ยนดินแล้วก็ยังไม่ค่อยดีขึ้น",
        image: null,
        likes: 31,
        commentsCount: 1,
        shares: 4,
        isMine: false,
        comments: [
            { id: 301, avatar: "https://images.unsplash.com/photo-1614027164847-1b28cfe1bc60?auto=format&fit=crop&q=80", name: "สมจิตร จิตสงบ", text: "อาจจะโดนแดดจัดเกินไปค่ะ ลองย้ายไปที่ร่มรำไรดูนะคะ" }
        ]
    },
    {
        id: 4,
        userAvatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=150",
        userName: "เพชรทนงค์",
        time: "2 วันที่แล้ว",
        title: "ขิงช่วยแก้อาการคลื่นไส้ — มันได้ผล!",
        snippet: "ตอนแรกฉันกังขาอยู่นะ แต่ชาขิงสดช่วยให้ท้องของฉันสงบลงได้จริง ๆ ตอนที่ฉันตั้งครรภ์ ฉันหั่นขิงสด แช่ทิ้งไว้ 10 นาที...",
        fullDesc: "ตอนแรกฉันกังขาอยู่นะ แต่ชาขิงสดช่วยให้ท้องของฉันสงบลงได้จริง ๆ ตอนที่ฉันตั้งครรภ์ ฉันหั่นขิงสด แช่ทิ้งไว้ 10 นาที แล้วเติมน้ำผึ้งลงไป เปลี่ยนเกมเลย!",
        image: null,
        likes: 20,
        commentsCount: 1,
        shares: 3,
        isMine: true,
        comments: []
    }
];

export default function CommunityPage() {
    const [activePost, setActivePost] = useState<PostType | null>(null);
    const [modalType, setModalType] = useState<"none" | "create" | "edit" | "report">("none");

    // Render lists of posts
    const renderPostCard = (post: PostType) => (
        <div key={post.id} className="mx-4 mb-4 border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white flex flex-col">
            {/* Header */}
            <div className="bg-[#D9F2C7] px-4 py-3 flex items-center gap-3">
                <img src={post.userAvatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex flex-col">
                    <span className="font-bold text-black text-[15px]">{post.userName}</span>
                    <span className="text-green-600 font-medium text-xs">{post.time}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex gap-3 cursor-pointer" onClick={() => setActivePost(post)}>
                {post.image && (
                    <img src={post.image} alt="thumbnail" className="w-[84px] h-[84px] object-cover rounded-md flex-shrink-0" />
                )}
                <div className="flex flex-col flex-1">
                    <h3 className="font-bold text-green-600 mb-1 leading-tight text-[15px]">{post.title}</h3>
                    <p className="text-[13px] text-gray-700 leading-snug break-words">
                        {post.snippet}
                    </p>
                </div>
            </div>

            {/* Footer Options */}
            <div className="border-t border-gray-100 bg-white px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer">
                    <Heart className="w-[18px] h-[18px] text-gray-400 fill-gray-400" />
                    <span className="text-green-600 font-bold text-sm">{post.likes}</span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer">
                    <MessageCircle className="w-[18px] h-[18px] text-gray-400 fill-gray-400" />
                    <span className="text-green-600 font-bold text-sm">{post.commentsCount}</span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer">
                    <Upload className="w-[18px] h-[18px] text-gray-400" />
                    <span className="text-green-600 font-bold text-sm">{post.shares}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white md:bg-[#FAFAFA] flex flex-col w-full relative">

            {/* Main Nav - Full width */}
            <div className={`w-full sticky top-0 z-50 shadow-sm bg-white ${activePost ? 'hidden' : 'block'}`}>
                <Nav />
            </div>

            {/* --- MAIN COMMUNITY LIST VIEW --- */}
            {!activePost && (
                <main className="w-full max-w-md mx-auto bg-white flex-1 flex flex-col relative shadow-sm min-h-full pb-6 border-l border-r border-gray-100">
                    {/* Search and Filter */}
                    <div className="flex px-4 py-4 gap-2 items-center">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="ค้นหาโพสต์"
                                className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-1.5 text-sm text-gray-700 outline-none focus:border-gray-400"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-black w-4 h-4" />
                        </div>
                        <button className="border border-gray-300 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700 whitespace-nowrap bg-white">
                            <Filter className="w-[14px] h-[14px]" /> ทุกหมวดหมู่
                        </button>
                    </div>

                    {/* Posts List */}
                    <div className="flex-1 overflow-y-auto">
                        {POSTS_DATA.map(renderPostCard)}
                    </div>
                </main>
            )}

            {/* FAB + Post (Sticky on window, NOT inside relative container) */}
            {!activePost && (
                <button
                    onClick={() => setModalType("create")}
                    className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-[#27272A] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50"
                >
                    <Plus className="w-8 h-8" />
                </button>
            )}

            {/* --- POST DETAIL VIEW --- */}
            {activePost && (
                <div className="w-full flex-1 flex flex-col z-10 relative bg-white md:bg-[#FAFAFA]">
                    {/* Full width Nav for Detail View */}
                    <div className="sticky top-0 w-full bg-white z-50 shadow-sm border-b-2 border-b-[#97DB8B]">
                        <Nav />
                    </div>

                    <div className="w-full max-w-md mx-auto flex flex-col relative pb-10 flex-1 bg-[#f8fcf5] shadow-sm border-l border-r border-[#e8f5e1]">
                        <div className="sticky top-[72px] bg-[#f8fcf5] z-40 px-4 pt-4 flex items-center justify-between pb-3">
                            <button onClick={() => setActivePost(null)} className="p-1 -ml-1 text-black">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div className="flex gap-4">
                                {!activePost.isMine ? (
                                    <button onClick={() => setModalType("report")} className="text-red-500">
                                        <Siren className="w-6 h-6" />
                                    </button>
                                ) : (
                                    <button onClick={() => setModalType("edit")} className="text-black">
                                        <Edit className="w-6 h-6" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Post full content */}
                        <div className="px-4 py-2 flex items-center gap-3">
                            <img src={activePost.userAvatar} alt="avatar" className="w-11 h-11 rounded-full object-cover" />
                            <div className="flex flex-col leading-tight">
                                <span className="font-bold text-[16px] text-black">
                                    {activePost.userName}
                                </span>
                                <span className="text-green-600 font-medium text-[13px]">
                                    {activePost.time}
                                </span>
                            </div>
                        </div>

                        <div className="px-4 mt-2">
                            <h2 className="text-[18px] font-bold text-green-600 mb-3">{activePost.title}</h2>
                            {activePost.image && (
                                <img src={activePost.image} alt="post full" className="w-full h-[220px] object-cover rounded-xl mb-4" />
                            )}
                            <p className="text-gray-800 text-[14px] leading-relaxed whitespace-pre-wrap font-medium">
                                {activePost.fullDesc}
                            </p>
                        </div>

                        {/* Likes and shares details */}
                        <div className="px-4 mt-6">
                            <div className="border-t border-b border-gray-200 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Heart className="w-4 h-4 text-gray-400 fill-gray-400" />
                                    <span className="text-green-600 font-bold text-sm">{activePost.likes} ถูกใจ</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Upload className="w-4 h-4 text-gray-400" />
                                    <span className="text-green-600 font-bold text-sm">{activePost.shares} แชร์</span>
                                </div>
                            </div>
                        </div>

                        {/* Comments Input */}
                        <div className="px-4 py-4 flex gap-2 w-full">
                            <input
                                type="text"
                                placeholder="เพิ่มคอมเมนต์ของคุณ ..."
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none w-full shadow-sm"
                            />
                            <button className="bg-[#6BB75B] text-white px-4 rounded-md font-bold text-sm shadow-sm whitespace-nowrap">
                                คอมเมนต์
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="px-4 pb-8 flex-1">
                            <h3 className="font-bold text-green-600 mb-3 text-[15px]">คอมเมนต์ ({activePost.comments?.length || 0})</h3>
                            <div className="flex flex-col gap-2">
                                {activePost.comments?.map(c => (
                                    <div key={c.id} className="bg-[#D9F2C7] rounded-md p-3 flex gap-3 items-start">
                                        <img src={c.avatar} alt="commenter" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-green-800 text-[14px]">{c.name}</span>
                                            <p className="text-gray-800 text-[13px] leading-snug mt-0.5">{c.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Main Footer - Full width */}
            {!activePost && (
                <div className="w-full mt-auto">
                    <Footer />
                </div>
            )}

            {/* ================= MODALS ================= */}

            {/* CREATE / EDIT POST MODAL */}
            {(modalType === "create" || modalType === "edit") && (
                <CreatePostModal
                    modalType={modalType}
                    onClose={() => setModalType("none")}
                />
            )}

            {/* REPORT POST MODAL */}
            {modalType === "report" && (
                <ReportPostModal
                    postTitle={activePost?.title}
                    onClose={() => setModalType("none")}
                />
            )}

        </div>
    );
}
