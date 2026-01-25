import PopularHerbs from "../components/forhomepage/PopularHerbs";

const Herb = [
    {id: 1, name: "ขมิ้นชัน", description: "บำรุงผิวพรรณ ลดการอักเสบ", src: "/images/kha-min-chan.jpg"},
    {id: 2, name: "ขมิ้นชัน", description: "บำรุงผิวพรรณ ลดการอักเสบ", src: "/images/kha-min-chan.jpg"},
    {id: 3, name: "ขมิ้นชัน", description: "บำรุงผิวพรรณ ลดการอักเสบ", src: "/images/kha-min-chan.jpg"},
    {id: 4, name: "ขมิ้นชัน", description: "บำรุงผิวพรรณ ลดการอักเสบ", src: "/images/kha-min-chan.jpg"},
    {id: 5, name: "ขมิ้นชัน", description: "บำรุงผิวพรรณ ลดการอักเสบ", src: "/images/kha-min-chan.jpg"},
    {id: 6, name: "ขมิ้นชัน", description: "บำรุงผิวพรรณ ลดการอักเสบ", src: "/images/kha-min-chan.jpg"},
    {id: 7, name: "ขมิ้นชัน", description: "บำรุงผิวพรรณ ลดการอักเสบ", src: "/images/kha-min-chan.jpg"},
    {id: 8, name: "ขมิ้นชัน", description: "บำรุงผิวพรรณ ลดการอักเสบ", src: "/images/kha-min-chan.jpg"},
    {id: 9, name: "ขมิ้นชัน", description: "บำรุงผิวพรรณ ลดการอักเสบ", src: "/images/kha-min-chan.jpg"},
    {id: 10, name: "ขมิ้นชัน", description: "บำรุงผิวพรรณ ลดการอักเสบ", src: "/images/kha-min-chan.jpg"},
    {id: 11, name: "ขมิ้นชัน", description: "บำรุงผิวพรรณ ลดการอักเสบ", src: "/images/kha-min-chan.jpg"},
    {id: 12, name: "ขมิ้นชัน", description: "บำรุงผิวพรรณ ลดการอักเสบ", src: "/images/kha-min-chan.jpg"},
    // {id: 2, name: "ฟ้าทะลายโจร", description: "มีสรรพคุณต้านไวรัสและเสริมสร้างระบบภูมิคุ้มกัน", src: "/images/fah-ta-lai-jone.jpg"},
    // {id: 3, name: "กระชายดำ", description: "มีสรรพคุณต้านไวรัสและเสริมสร้างระบบภูมิคุ้มกัน", src: "/images/kra-chai-dum.jpg"},
    // {id: 4, name: "ว่านหางจระเข้", description: "มีสรรพคุณต้านไวรัสและเสริมสร้างระบบภูมิคุ้มกัน", src: "/images/warn-harng-jor-ra-kay.jpg"},
    // {id: 5, name: "มะขามป้อม", description: "มีสรรพคุณต้านไวรัสและเสริมสร้างระบบภูมิคุ้มกัน", src: "/images/ma-karm-porm.jpg"},
    // {id: 6, name: "ใบบัวบก", description: "มีสรรพคุณต้านไวรัสและเสริมสร้างระบบภูมิคุ้มกัน", src: "/images/bai-bua-boke.jpg"},
    // {id: 7, name: "กระเทียม", description: "มีสรรพคุณต้านไวรัสและเสริมสร้างระบบภูมิคุ้มกัน", src: "/images/kra-tieam.jpg"},
    // {id: 8, name: "ขิง", description: "มีสรรพคุณต้านไวรัสและเสริมสร้างระบบภูมิคุ้มกัน", src: "/images/khing.jpg"},
    // {id: 9, name: "รางจืด", description: "มีสรรพคุณต้านไวรัสและเสริมสร้างระบบภูมิคุ้มกัน", src: "/images/rarng-jued.jpg"},
    // {id: 10, name: "กระเจี๊ยบแดง", description: "มีสรรพคุณต้านไวรัสและเสริมสร้างระบบภูมิคุ้มกัน", src: "/images/kra-jieab-daeng.webp"},
    // {id: 11, name: "ดอกคำฝอย", description: "มีสรรพคุณต้านไวรัสและเสริมสร้างระบบภูมิคุ้มกัน", src: "/images/dork-khum-foi.webp"},
    // {id: 12, name: "ตะไคร้", description: "มีสรรพคุณต้านไวรัสและเสริมสร้างระบบภูมิคุ้มกัน", src: "/images/ta-krai.jpg"},
]

export default function HerbList() {
    return (
        <>
            <PopularHerbs data={Herb} />
        </>
    )
}