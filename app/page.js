import Image from "next/image";
import Link from "next/link";

import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      <main>
        {/* Hero Section */}
        <section className="py-48  flex flex-col justify-center items-center text-center text-white">
          <h2 className="text-4xl font-extrabold mb-4">Welcome to Code of War</h2>
          <p className="text-lg mb-6">A revolutionary project for the future of digital warfare.</p>
          <Link href="/About" className="bg-white text-[#0a0a0a] py-2 px-6 rounded-lg text-lg font-semibold hover:bg-red-50 transition duration-300">Learn More</Link>
        </section>

     
        {/* Features Section */}
        <section id="features" className=" py-16 px-6 bg-[#0a0a0a] text-foreground">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-6">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className=" p-6 rounded-lg shadow-lg bg-[#0a0a0a]">
                <h3 className="text-xl font-bold mb-4">Real-Time Analytics</h3>
                <p>Track the progress and performance of your digital campaigns in real-time with our powerful analytics tools.</p>
              </div>
              <div className=" p-6 rounded-lg shadow-lg bg-[#0a0a0a]">
                <h3 className="text-xl font-bold mb-4">Interactive Strategies</h3>
                <p>Collaborate with your team and test out various strategies in interactive simulations to optimize your tactics.</p>
              </div>
              <div className=" p-6 rounded-lg shadow-lg bg-[#0a0a0a]">
                <h3 className="text-xl font-bold mb-4">Advanced AI</h3>
                <p>Our platform incorporates cutting-edge AI that provides actionable insights and recommendations for every move you make.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-6">Contact Us</h2>
            <p className="text-lg mb-8">We would love to hear from you. Whether you’re a developer, strategist, or enthusiast, feel free to reach out to us!</p>
            <a href="mailto:contact@codeofwar.com" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300">Get in Touch</a>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-4 text-center">
        <p>&copy; 2025 Code of War. All rights reserved.</p>
      </footer>
    </div>
  );
}
