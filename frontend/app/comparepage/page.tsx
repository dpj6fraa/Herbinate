"use client";

import Nav from "../components/Nav";
import Footer from "../components/Footer";
import FindHerbs from "../components/forcomparepage/FindHerbs";
import AllHerbsList from "../constants/forcomparepage/AllHerbsList";

export default function ComparePage() {
    return (
        <main className="min-h-screen flex flex-col bg-white pt-4 md:w-full">

            <Nav />

            <div className="flex-1 flex flex-col pt-4 lg:items-center">

                <FindHerbs/>

                <AllHerbsList />

            </div>

            <Footer />

        </main>
    )
}