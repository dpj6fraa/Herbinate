"use client";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import FocusDetailPage from "../components/focusontumeric/FocusDetailPage";

const Info = [
    {src: "/images/Jor-Rueak-Kha-Min-Chan-2.png",name: "เจาะลึก 'ขมิ้นชัน' ราชินีสมุนไพรต้านอักเสบ",author: "อาชวิน", description: `"ขมิ้นชัน (Tumeric) เป็นพืชสมุนไพรตระกูลขิงที่มีเหง้าอยู่ใตดินเนื้อในของเหง้ามีสีเหลืองเข้มจนถึงสีแสด มีกลิ่นหหอมเฉพาะตัว เป็นสมุนไพรที่คนไทยคุ้นเคยกันดีทั้งในการนำมาปรุงอาหารและการใช้เป็นยารักษาโรค", "สารสำคัญที่สุดในขมิ้นชันคือ 'เคอร์คิวมินอยด์' (Curcuminoid) ซึ่งเป็ฯสารต้านอนุมูลอิสระที่มีประสิทธิภาพสูง มีฤทธิ์ในการลดการอักเสบ ช่วยบรรเทาอาการปวดข้อ และช่วยเสริมสร้างภูมิต้านทานให้กับร่างกาย", "นอกจากนี้ขมิ้นชันยังมีสรรพคุณโดดเด่นในการรักษาระบบทางเดินอาหาร ช่วยขับลม แก้ท้องอืด ท้องเฟ้อ และช่วยสมานแผลในกระเพาะอาหาร \n การรับประทานขมิ้นชันเป็นประจำในปริมาณที่เหมาะสมจึงช่วยบำรุงตับและระบบย่อยอาหารให้ทำงานได้อย่างมีประสิทธิภาพ"`, reference: "สำนักงานข้อมูฃสมุนไพร คณะเภสัชศาสตร์ มหาวิทยาลัยมหิดล. (2566). \n สมุนไพรน่ารู้: ขมิ้นชันกับประโยชน์ทางดารแพทย์. \n เข้าถึงได้จาก ", link: `http://www.medplant.mahidol.ac.th`},
]

export default function FocusOnTumeric() {
    return (
        <main className="min-h-svh bg-white flex flex-col">
            <Nav />
            <div className="flex-1 flex flex-col pt-4 lg:items-center">
                <FocusDetailPage data={Info[0]}/>
            </div>
            <Footer />
        </main>
    )
}