import HerbsNews from "@/app/components/forhomepage/HerbsNews"

const News = [
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
]

export default function NewsList() {
    return (
        <>
            <HerbsNews data={News} />
        </>
    )
}