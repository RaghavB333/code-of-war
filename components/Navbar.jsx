
"use client"
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-[#0a0a0a]  text-white shadow-lg">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo / Brand */}
                <div className="text-2xl font-bold">
                    <Link href="/">
                        <img src="/cow1.png" alt="Logo" className="h-16 w-auto object-cover" />
                    </Link>
                </div>



                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-6">
                    <Link href="/Signup" className="hover:text-yellow-400">
                        Signup
                    </Link>
                    <Link href="/Login" className="hover:text-yellow-400">
                        Login
                    </Link>
                    <Link href="/Playground" className="hover:text-yellow-400">
                        Playground
                    </Link>
                    <Link href="/problems" className="hover:text-yellow-400">
                        Problems
                    </Link>
                    <Link href="/Dashboard" className="hover:text-yellow-400">
                        Dashboard
                    </Link>
                    <Link href="/LeaderBoard" className="hover:text-yellow-400">
                        Leaderboard
                    </Link>

                </div>

                {/* Mobile Hamburger Icon */}
                <button
                    className="md:hidden text-yellow-400 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                        />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-[#0a0a0a]">

                    <Link href="/Signup" className=" block px-4 py-2 hover:bg-gray-700">
                        Signup
                    </Link>
                    <Link href="/Login" className=" block px-4 py-2 hover:bg-gray-700">
                        Login
                    </Link>
                    <Link href="/problems" className=" block px-4 py-2 hover:bg-gray-700">
                        Problems
                    </Link>
                    <Link href="/Playground" className=" block px-4 py-2 hover:bg-gray-700">
                        Playground
                    </Link>


                    <Link href="/Dashboard" className=" block px-4 py-2 hover:bg-gray-700">
                        Dashboard
                    </Link>
                    <Link href="/LeaderBoard" className=" block px-4 py-2 hover:bg-gray-700">
                        Leaderboard
                    </Link>

                </div>
            )}
        </nav>
    );
}
