"use client";

import Link from "next/link";
import Image from "next/image";
import { React, useEffect, useState, useContext, useRef } from "react";
import { UserDataContext } from '@/context/UserContext';
import { LobbyDataContext } from '@/context/LobbyContext';
import { useRouter } from 'next/navigation';
import localFont from "next/font/local";
import { motion } from "framer-motion";
import axios from "axios";


const customFont = localFont({
  src: "../public/fonts/GODOFWAR.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-custom",
});


export default function Home() {
  const [showMore, setShowMore] = useState(false);

  const handleLearnMore = () => {
    if (showMore) {
      setShowMore(false);
    }
    else {
      setShowMore(true)
    }
  };
  const socketid = useRef(null);

  const { user } = useContext(UserDataContext);
  const { socket} = useContext(LobbyDataContext);
  const router = useRouter();

  const storesocketid = async () => {
    const email = user.email;
    console.log(email, socketid.current);
    const data = {
      socketid: socketid.current,
      email: email
    }
    const response = await axios.post('/api/storesocketid', data);
    console.log(response.data);
  }

  useEffect(() => {
    if (user && user.email && socketid.current != null) {
      storesocketid();
    }
  }, [user && user.email]);



  useEffect(() => {
    if (socket != null) {

      const registerUser = () => {
        if (user && user.email) {
          console.log("Registering user:", user.email);
          socket.emit("register-user", { email: user.email });
        }
      };

      socket.on('connect', () => {
        console.log('Connected to server with socket ID:', socket.id);
        socketid.current = socket.id;
        registerUser(); // register on first connect
      });

      // Register again if the socket reconnects
      socket.on('reconnect', () => {
        console.log("Reconnected:", socket.id);
        registerUser();
      });

      return () => {
        socket.off("connect");
        socket.off("reconnect");
      };
    }
  }, [user, socket]);

  // useEffect(() => {
  //   if (socket != null) {

  //     const handleInvite = (data) => {
  //       console.log("received invite", data);
  //       if (confirm(`${data.inviterEmail} invited you to a lobby`)) {
  //         socket.emit('accept-invite', {
  //           lobbyId: data.lobbyId,
  //           id: user._id
  //         }, (response) => {
  //           if (response.success) {
  //             router.push(`/lobby/${response.lobbyId}`);
  //           }
  //         });
  //       }
  //     };

  //     socket.on('receive-invite', handleInvite);
  //     return () => socket.off('receive-invite', handleInvite);
  //   }
  // }, [socket, user && user.email, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* <AcceptInvite/> */}
      <main>
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="py-48 flex flex-col justify-center items-center text-center text-white mx-6 max-w-[100vw]"
        >
          <h2 className="text-5xl font-extrabold mb-4">
            Welcome to{" "}
            <span
              className={`${customFont.className} bg-clip-text text-transparent gradient-text`}
            >
              CODE OF WAR
            </span>
          </h2>
          <p className="text-xl font-bold mb-6">
            Revolutionizing Competitive Programming Forever
          </p>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              onClick={handleLearnMore}
              href="#"
              className="bg-white text-[#0a0a0a] py-2 px-6 rounded-lg text-lg font-semibold hover:bg-red-50 transition duration-300"
            >
              Learn More
            </Link>
          </motion.div>
        </motion.section>

        {/* About Section */}
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="min-h-screen bg-[#0a0a0a] py-10"
          >
            <div className="min-h-screen bg-[#0a0a0a] py-10 flex justify-center items-center text-center">
              <div className="container mx-auto px-6 lg:px-20">
                <h1 className="tracking-tight inline font-semibold from-[#6FEE8D] to-[#17c964] text-4xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-b">
                  About <span className={customFont.className}>CODE OF WAR</span>
                </h1>
                <div className="bg-[#0a0a0a] rounded-lg shadow-lg p-6 lg:p-10 bg-background">
                  <p className="text-lg text-gray-100 mb-6">
                    <span className="font-bold text-green-50">Code of War</span> is a cutting-edge competitive programming platform
                    crafted for developers, learners, and problem solvers. With real-time code execution via
                    self-hosted Judge0, cyclomatic analysis, playground to compete with friends, it’s built to give a whole new meaning to competitive programming, just like you are playing an online competitive game.
                  </p>

                  <h2 className="text-2xl font-bold text-pink-600 mb-4 text-center">What Sets Us Apart</h2>
                  <ul className="list-disc list-inside text-gray-100 mb-6 space-y-2 text-lg">
                    <li><span className="font-semibold">Self-Hosted Judge0 Engine:</span> High-performance and scalable backend for compiling and running code instantly.</li>
                    <li><span className="font-semibold">Multi-language Support:</span> Problems come with predefined wrappers for Python, JavaScript, Java, and C++.</li>
                    <li><span className="font-semibold">Test-Case Driven Evaluation:</span> Every problem supports extensive input/output test validation like LeetCode.</li>
                    <li><span className="font-semibold">Real-Time Feedback & Runtime Stats:</span> Get instant cycolmatic complexity analysis</li>
                    <li><span className="font-semibold">Playground:</span> Host or participate in scheduled coding battles with friends using a party system and track live leaderboard rankings. Can be used to create mini contests and tournaments.</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-purple-400 mb-4">Our Mission</h2>
                  <p className="text-lg text-gray-100 mb-6">
                    We aim to provide a developer-first experience that balances learning with fun and competition like a game. Whether you're
                    preparing for FAANG interviews, brushing up your DSA, or just love solving problems — this is your battlefield. So come out here, bringyour friends, and tell the world who is going to be the the Code of war champion.</p>

                  <h2 className="text-2xl font-bold text-yellow-300 mb-4">Who Is It For?</h2>
                  <p className="text-lg text-gray-100 mb-6">
                    From absolute beginners to seasoned engineers, <span className="font-semibold text-green-100">Code of War</span> provides tools,
                    structure, and thrill for every coder. Join a growing community, write better code, climb the ranks, and compete with your friends in the ultimate fun coding battles.
                  </p>

                  <p className="text-lg text-gray-100">
                    Ready to join the fight? Sharpen your mind and prove your code on the battleground. Let the war begin.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Image Section */}
        {/* <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex flex-col md:flex-row justify-center items-center relative bottom-12 gap-10 md:gap-10 md:py-10"
        >

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
            whileHover={{ scale: 1.1, y: -10 }}
            className="rounded-lg shadow-lg relative md:bottom-20 md:right-10"
          >
            <Image
              src={"/cp.png"}
              width={400}
              height={400}
              alt="Competitive Programming 1"
              className="rounded-lg shadow-lg w-full max-w-[300px] md:max-w-[400px]"
            />
          </motion.div>

          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
            whileHover={{ scale: 1.1, y: -10 }}
            className="rounded-lg shadow-lg relative md:top-4"
          >
            <Image
              src={"/cp2.webp"}
              width={400}
              height={400}
              alt="Competitive Programming 2"
              className="rounded-lg shadow-lg w-full max-w-[300px] md:max-w-[400px]"
            />
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.4 }}
            whileHover={{ scale: 1.1, x: 10 }}
            className="rounded-lg shadow-lg relative bottom-[80px] md:bottom-20 md:left-10 "
          >
            <div className="w-[300px] md:w-[400px] h-[300px] md:h-[400px] overflow-hidden rounded-lg shadow-lg">
              <Image
                src={"/cp3.jpeg"}
                width={400}
                height={400}
                alt="Competitive Programming 3"
                className="rounded-lg shadow-lg w-[350px] h-[300px] object-cover pt-20 "
              />
            </div>
          </motion.div>

        </motion.section> */}


        {/* Features Section */}
        <section
          id="features"
          className="py-16 px-6 bg-C text-foreground transition-all"
        >
          <div className="mx-auto text-center text-white">
            <h1 className="tracking-tight inline font-semibold from-[#5EA2EF] to-[#0072F5] text-4xl lg:text-5xl bg-clip-text text-transparent bg-gradient-to-b">
              Key Features
            </h1>
            <div className="grid md:grid-cols-3 gap-24 max-w-7xl mt-10 mx-10 md:ml-48">


              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-lg shadow-lg bg-[#0a0a0a] border-2 border-green-400"
              >
                <h3 className="text-2xl font-bold mb-4 text-green-400">Code execution and Analysis</h3>
                <p>
                  Each problem supports multiple languages with customized boilerplates and IO wrappers for Python, JavaScript, Java, and C++, executed on self hosted Judge0 execution engine container, and analysed for time and space comlexoties.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-lg shadow-lg bg-[#0a0a0a] border-2 border-purple-400"
              >
                <h3 className="text-2xl font-bold mb-4 text-purple-400">Playground</h3>
                <p>
                  Compete with your friends by inviting them to a self curated coding battle. Track your submission and battle history through your personalised Dashboards and Leaderboards.
                  Maintain streaks, create a code of war journey full of battles and learnings.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-lg shadow-lg bg-[#0a0a0a] border-2 border-pink-400"
              >
                <h3 className="text-2xl font-bold mb-4 text-pink-400">By developers and gamers, for developers and gamers</h3>
                <p>
                  Inspired by games like God of War and Valorant, taking design, nomenclature and Party system ideas from them, this platform is a gamified approach to otherwise mechanical looking competitive programming, while creating a collaborative and competitive environment among friends or hosting coding contests of variable scale, like esports.
                </p>
              </motion.div>


            </div>
          </div>
        </section>
        {/* Contact Section */}
        <motion.section
          id="contact"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="py-16 px-6"
        >
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="tracking-tight inline font-semibold from-[#FF705B] to-[#FFB457] text-4xl lg:text-4xl bg-clip-text text-transparent bg-gradient-to-b">Contact Us</h1>            <p className="text-lg mb-8 mt-4">
              We would love to hear from you. Whether you’re a developer,
              strategist, or enthusiast, feel free to reach out to us!
            </p>
            <a
              href="/contact"
              className="bg-gradient-to-r from-purple-600 to-purple-400  text-white py-2 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Get in Touch
            </a>


          </div>
        </motion.section>
      </main>

      <footer className="bg-[#0a0a0a] text-white py-4 text-center">
        <p>&copy; 2025 Code of War. All rights reserved.</p>
      </footer>
    </div>
  );
}



