"use client";


interface Herb {
    id: number;
    name: string;
    author: string;
    src: string;
}


export default function ArticleCards({ data }: { data: Herb[] }) {
    return (
        <>
            {
                data?.map((item) => {
                    return (
                        <div key={item.id} className="shrink-0 w-fit snap-start rounded-2xl overflow-hidden shadow-2xl md:w-fit">
                            <div className="border w-75 flex flex-col items-center text-center rounded-2xl overflow-hidden bg-[#F7FFF7] md:w-80 lg:w-80">
                                <div className="w-full h-24 rounded-t-2xl overflow-hidden shadow-md bg-white lg:h-36">
                                    <img
                                        src={item.src}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="py-2">
                                    <h2 className="text-[16px] text-black pb-4">{item.name}</h2>
                                    <h3 className="text-[14px] text-gray-300">By {item.author}</h3>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </>
    )
}