"use client";


interface Herb {
    id: number;
    thaiName: string;
    engName: string;
    property: string;
    src: string;
}


export default function HerbCards({ data }: { data: Herb[] }) {
    return (
        <>
            {
                data?.map((item) => {
                    return (
                        <div key={item.id} className="shrink-0 w-fit snap-start rounded-2xl overflow-hidden shadow-2xl md:w-fit cursor-pointer">
                            <div className="border w-45 flex flex-col items-center text-center rounded-2xl overflow-hidden bg-[#F7FFF7] md:w-50 lg:w-80">
                                <div className="w-full h-24 rounded-t-2xl overflow-hidden shadow-md bg-white lg:h-36">
                                    <img
                                        src={item.src}
                                        alt={item.engName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="py-2">
                                    <h2 className="text-[16px] text-black">{item.thaiName}</h2>
                                    <h3 className="text-[14px] text-gray-300">{item.engName}</h3>
                                    <h2 className="text-[16px] text-black">{item.property}</h2>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </>
    )
}