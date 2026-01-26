"use client";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SearchBar from "../components/forhomepage/SearchBar";
import Tools from "../components/forhomepage/Tools";
import HerbList from "../constants/forhomepage/HerbsList";
import NewsList from "../constants/forhomepage/NewsList";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col pt-6 md:w-full lg:pt-full bg-white">
            <Nav />

            <section className="flex-1">

                <SearchBar />

                <Tools />

                <HerbList/>

                <NewsList/>

            </section>

            <Footer />

        </main>
    )
}