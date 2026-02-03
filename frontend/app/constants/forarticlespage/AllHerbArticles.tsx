import ArticleCards from "@/app/components/forherbarticlespage/ArticleCards";

const Article = [
    {id: 1,name: "เจาะลึก 'ขมิ้นชัน' ราชินีสมุนไพรต้านอักเสบ",author: "อาชวิน",src: "/images/kha-min-chan.jpg"},
    {id: 2,name: "เจาะลึก 'ขมิ้นชัน' ราชินีสมุนไพรต้านอักเสบ",author: "อาชวิน",src: "/images/kha-min-chan.jpg"},
    {id: 3,name: "เจาะลึก 'ขมิ้นชัน' ราชินีสมุนไพรต้านอักเสบ",author: "อาชวิน",src: "/images/kha-min-chan.jpg"},
    {id: 4,name: "เจาะลึก 'ขมิ้นชัน' ราชินีสมุนไพรต้านอักเสบ",author: "อาชวิน",src: "/images/kha-min-chan.jpg"},
    {id: 5,name: "เจาะลึก 'ขมิ้นชัน' ราชินีสมุนไพรต้านอักเสบ",author: "อาชวิน",src: "/images/kha-min-chan.jpg"},
    {id: 6,name: "เจาะลึก 'ขมิ้นชัน' ราชินีสมุนไพรต้านอักเสบ",author: "อาชวิน",src: "/images/kha-min-chan.jpg"},
    {id: 7,name: "เจาะลึก 'ขมิ้นชัน' ราชินีสมุนไพรต้านอักเสบ",author: "อาชวิน",src: "/images/kha-min-chan.jpg"},
    {id: 8,name: "เจาะลึก 'ขมิ้นชัน' ราชินีสมุนไพรต้านอักเสบ",author: "อาชวิน",src: "/images/kha-min-chan.jpg"},
    {id: 9,name: "เจาะลึก 'ขมิ้นชัน' ราชินีสมุนไพรต้านอักเสบ",author: "อาชวิน",src: "/images/kha-min-chan.jpg"},
    {id: 10,name: "เจาะลึก 'ขมิ้นชัน' ราชินีสมุนไพรต้านอักเสบ",author: "อาชวิน",src: "/images/kha-min-chan.jpg"},
    {id: 11,name: "เจาะลึก 'ขมิ้นชัน' ราชินีสมุนไพรต้านอักเสบ",author: "อาชวิน",src: "/images/kha-min-chan.jpg"},
    {id: 12,name: "เจาะลึก 'ขมิ้นชัน' ราชินีสมุนไพรต้านอักเสบ",author: "อาชวิน",src: "/images/kha-min-chan.jpg"},
]

export default function AllHerbsArticles() {
    return (
        <div className="grid grid-cols-3 place-items-center m-6 gap-y-5 gap-x-6 md:w-fit sm:grid-cols-2">
            <ArticleCards data={Article}/>
        </div>
    )
}