"use client";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SearchBar from "../components/forhomepage/SearchBar";
import Tools from "../components/forhomepage/Tools";
import HerbList from "../constants/HerbsList";
import NewsList from "../constants/NewsList";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col pt-35 lg:pt-full">
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