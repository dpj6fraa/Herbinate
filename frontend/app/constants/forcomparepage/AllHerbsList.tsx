import HerbCards from "@/app/components/forcomparepage/HerbCards";

const Herbs = [
    {id: 1, thaiName: "ขมิ้นชัน", engName: "Curcuma longa", property: "ระบบย่อยอาหาร", src: "/images/kha-min-chan.jpg"},
    {id: 2, thaiName: "ฟ้าทะลายโจร", engName: "Andrographis paniculata", property: "เสริมภูมิคุ้มกัน", src: "/images/fah-ta-lai-jone.jpg"},
    {id: 3, thaiName: "กระชายดำ", engName: "Kaempferia parviflora", property: "บำรุงหัวใจ", src: "/images/kra-chai-dum.jpg"},
    {id: 4, thaiName: "ว่านหางจระเข้", engName: "Aloe vera", property: "สมานแผล บำรุงผิว", src: "/images/warn-harng-jor-ra-kay.jpg"},
    {id: 5, thaiName: "มะขามป้อม", engName: "Phyllanthus emblica", property: "แก้ไอ ขับเสมหะ", src: "/images/ma-karm-porm.jpg"},
    {id: 6, thaiName: "ใบบัวบก", engName: "Centella asiatica", property: "แก้ช้ำใน บำรุงสมอง", src: "/images/bai-bua-boke.jpg"},
    {id: 7, thaiName: "กระเทียม", engName: "Allium sativum", property: "ลดไขมันในเลือด", src: "/images/kra-tieam.jpg"},
    {id: 8, thaiName: "ขิง", engName: "Zingiber officinale", property: "ขับลม แก้ท้องอืด", src: "/images/khing.jpg"},
    {id: 9, thaiName: "รางจืด", engName: "Thunbergia laurifolia", property: "ถอนพิษไข้", src: "/images/rarng-jued.jpg"},
    {id: 10, thaiName: "กระเจี๊ยบแดง", engName: "Hibiscus sabdariffa", property: "ขับปัสสาวะ ลดความดัน", src: "/images/kra-jieab-daeng.webp"},
    {id: 11, thaiName: "ดอกคำฝอย", engName: "Carthamus tinctorius", property: "บำรุงโลหิต", src: "/images/dork-khum-foi.webp"},
    {id: 12, thaiName: "ตะไคร้", engName: "Cymbopogon citratus", property: "เจริญอาหาร ขับเหงื่อ", src: "/images/ta-krai.jpg"},
]

export default function AllHerbsList() {
    return (
        <div className="grid grid-cols-3 place-items-center m-6 gap-y-5 md:w-fit gap-x-15">
            <HerbCards data={Herbs}/>
        </div>
    )
}