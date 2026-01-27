import HerbDetailPage from "@/app/components/forherbpropertypage/HerbDetailPage";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const Info = [
    { id: 1, thaiName: "ขมิ้นชัน", engName: "Curcuma longa L.", properties: ["ต้านอักเสบ", "ต้านอนุมูลอิสระ", "บรรเทาอาการปวด", "บำรุงตับ"], description: "ขมิ้นชันเป็นสมุนไพรที่มีสรรพคุณทางยาหลากหลาย โดยเฉพาะเหง้าของขมิ้นที่มีสารเคอร์คิวมินอยด์ เป็นสารสำคัญที่มีคุณวมบัติในการต้านอักเสบ ต้านอนุมูลอิสระ และช่วยบรรเทาอาการปวด นอกจากนี้ยังช่วยบำรุงตับ และระบบย่อยอาหาร", method: ["นำเหง้าขมิ้นมาต้มกับน้ำ ดื่มเป็นชาขมิ้น วันละ 1-2 แก้ว", "บดเป็นผงผสมกับน้ำผึ้ง รับประทานก่อนอาหาร", "ใช้ภายนอกทาแผล หรือผิวหนังที่มีปัญหา", "นำมาปรุงอาหารเพื่อให้สีและกลิ่นหอม"], warning: "ไม่ควรใช้ในปริมาณมากเกินไปในหญิงมีครรภ์ ผู้ที่มีปัญหาเรื่องนิ่วในถุงน้ำดี และผู้ที่กำลังรับประทานยาต้านการแข็งตัวของเลือด ควรปรึกษาแพทย์ก่อนใช้", references: ["ตำราการแพทย์แผนไทย", "กระทรวงสาธารณสุขสมุนไพรไทยในระบบการดูแลสุขภาพ", "ข้อมูลจากสถาบันวิจัยสมุนไพร"], src: "/images/kha-min-chan.jpg" }
]

export default function HerbData() {
    return (
        <main className="min-h-svh bg-white flex flex-col">
            <Nav />
            <div className="flex-1 flex flex-col pt-4 lg:items-center">
                <HerbDetailPage data={Info[0]} />
            </div>
            <Footer />
        </main>
    )
}