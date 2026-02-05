"use client";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import FindArticles from "../components/forherbarticlespage/FindArticles";
import AllHerbsArticles from "../constants/forarticlespage/AllHerbArticles";

export default function HerbArticles() {
    return (
        <main className="min-h-screen flex flex-col bg-white pt-4 md:w-full">

            <Nav />
            <div className="flex-1 flex flex-col pt-4 lg:items-center">
                <FindArticles />
                <AllHerbsArticles />
            </div>
            <Footer />

        </main>
    )
}