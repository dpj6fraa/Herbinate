"use client";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import KhaMinChan from "../constants/forherbpropertypage/KhaMinChan";

export default function HerbProperty() {
    return (
        <main className="min-h-screen flex flex-col bg-white pt-4 md:w-full">

            <Nav />
            <div className="flex-1 flex flex-col p-4 pt-12 lg:items-center">
                <KhaMinChan/>
            </div>
            <Footer />

        </main>
    )
}