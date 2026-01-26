"use client";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SearchBar from "../components/forhomepage/SearchBar";
import Tools from "../components/forhomepage/Tools";
import HomeContent from "../components/forhomepage/Homepagecontent";

export default function Home() {
    return (
        <main className="min-h-svh bg-white flex flex-col">
            <Nav />
            <SearchBar />
            <Tools />
            <HomeContent />
            <Footer />
        </main>
    )
}