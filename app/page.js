"use client";

import Link from "next/link";
import Image from "next/image";
import { io } from "socket.io-client";
import { React, useEffect, useState, useContext, useRef } from "react";
import { UserDataContext } from '@/context/UserContext';
import { LobbyDataContext } from '@/context/LobbyContext';
import { useRouter } from 'next/navigation';
import localFont from "next/font/local";
import { motion } from "framer-motion";
import axios from "axios";
import AcceptInvite from "@/components/AcceptInvite";







const customFont = localFont({
  src: "../public/fonts/GODOFWAR.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-custom",
});


export default function Home() {
  const [showMore, setShowMore] = useState(false);

  const handleLearnMore = () => {
    setShowMore(true);
  };





  const socketid = useRef(null);

  const { user, setUser } = useContext(UserDataContext);
  const { socket, setSocket } = useContext(LobbyDataContext);
  const router = useRouter();
  const [token, setToken] = useState(null);


  useEffect(() => {
    const stored = localStorage.getItem('token');
    setToken(stored);
  }, []);

  // useEffect(() => {
  //   setSocket(socket);
  // }, [])

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


  useEffect(() => {
    if (socket != null) {

      const handleInvite = (data) => {
        console.log("received invite", data);
        if (confirm(`${data.inviterEmail} invited you to a lobby`)) {
          socket.emit('accept-invite', {
            lobbyId: data.lobbyId,
            email: user.email
          }, (response) => {
            if (response.success) {
              router.push(`/lobby/${response.lobbyId}`);
            }
          });
        }
      };

      socket.on('receive-invite', handleInvite);
      return () => socket.off('receive-invite', handleInvite);
    }
  }, [socket, user && user.email, router]);




  // useEffect(() => {
  //   // Listen for incoming requests
  //   // socket.on("receive-request", async(data) => {
  //   //   console.log("user",data);
  //   //   if(confirm(`${data.from} has Invite you`))
  //   //   {
  //   //     console.log("yes");
  //   //     const response = await axios.post('/api/acceptinvite', {member:[data.from,data.friendemail],id:data.id});
  //   //     console.log("response",response.data);
  //   //     if(response.status === 200)
  //   //     {
  //   //       socket.emit("accept-invite", data);
  //   //       router.push(`/Playground/${data.id}`)
  //   //     }
  //   //   }
  //   //   else
  //   //   {
  //   //     console.log("NO");
  //   //   }
  //   // })

  //   // return () => {
  //   //   socket.off("receive-request");
  //   // };
  // }, []);


  useEffect(() => {
    if (token == null || token == undefined || token == "") {
      console.log("token is not exist")
    }
    else {
      axios.post(`/api/profile`, {
        token
      }).then((response) => {
        if (response.status === 200) {
          const data = response.data;
          console.log(data.data);
          setUser(data.user);
        }
      })
    }


  }, [token])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <AcceptInvite/> */}
      <main>
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="py-48 flex flex-col justify-center items-center text-center text-white"
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
              <div className="container mx-auto px-6 lg:px-20 ">
                <h1 className="tracking-tight inline font-semibold from-[#6FEE8D] to-[#17c964] text-4xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-b">About <span
                  className={customFont.className}>CODE OF WAR</span></h1>
                <div className="bg-[#0a0a0a] rounded-lg shadow-lg p-6 lg:p-10 bg-background">
                  <p className="text-lg text-gray-100 mb-6">
                    Welcome to <span className="font-bold text-green-50">Code of War</span>, the ultimate online coding platform for
                    competitive programming enthusiasts, problem solvers, and coding aficionados. We aim to cultivate an engaging
                    environment where developers of all skill levels can test their mettle, sharpen their coding skills, and
                    compete against the best.
                  </p>

                  <h2 className="text-2xl font-bold text-pink-600 mb-4">Key Features</h2>
                  <ul className="list-disc list-inside text-gray-100 mb-6">
                    <li><span className="font-semibold">In-Built Code Editor and Compiler:</span> Code seamlessly in our integrated, feature-rich environment tailored for programmers.</li>
                    <li><span className="font-semibold">Competitive Tournaments:</span> Participate in exciting coding competitions and rise to the top of the leaderboard.</li>
                    <li><span className="font-semibold">Challenging Problems:</span> Solve curated problems that test your knowledge, logic, and creativity.</li>
                    <li><span className="font-semibold">Global Leaderboards:</span> Compare your performance against programmers worldwide and strive for excellence.</li>
                    <li><span className="font-semibold">Community:</span> Connect with like-minded individuals to learn, grow, and collaborate.</li>
                  </ul>

                  <h2 className="text-2xl font-bold text-purple-400 mb-4">Our Mission</h2>
                  <p className="text-lg text-gray-100 mb-6">
                    At Code of War, we believe that coding is more than just writing lines of code; it’s about solving problems,
                    thinking critically, and creating innovative solutions. Our mission is to inspire developers to push their
                    limits, learn from challenges, and become the best version of themselves.
                  </p>

                  <h2 className="text-2xl font-bold text-yellow-300 mb-4">Why Choose Us?</h2>
                  <p className="text-lg text-gray-100 mb-6">
                    Unlike other platforms, Code of War is built with the developer in mind. We prioritize simplicity, performance,
                    and accessibility to ensure that every user has an unparalleled experience. With regular updates, new challenges,
                    and exciting tournaments, there’s always something to look forward to on Code of War.
                  </p>

                  <p className="text-lg text-gray-100">
                    Whether you're a beginner looking to get started or a seasoned coder aiming for the top spot, Code of War has
                    something for you. Join us today and become part of the ultimate coding battlefield!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Image Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex justify-center items-center gap-6 py-10"
        >
          {/* First Image */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
            whileHover={{ scale: 1.1, y: -10 }}
            className="rounded-lg shadow-lg relative bottom-20 right-10"
          >
            <Image
              src={"/cp.png"}
              width={400}
              height={400}
              alt="Competitive Programming 1"
              className="rounded-lg shadow-lg"
            />
          </motion.div>

          {/* Second Image */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
            whileHover={{ scale: 1.1, y: -10 }}
            className="rounded-lg shadow-lg relative top-4"
          >
            <Image
              src={"/cp2.webp"}
              width={400}
              height={400}
              alt="Competitive Programming 2"
              className="rounded-lg shadow-lg"
            />
          </motion.div>

          {/* Third Image */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.4 }}
            whileHover={{ scale: 1.1, x: 10 }}
            className="rounded-lg shadow-lg relative bottom-20 left-10"
          >
            <Image
              src={"/cp3.jpeg"}
              width={400}
              height={400}
              alt="Competitive Programming 3"
              className="rounded-lg shadow-lg"
            />
          </motion.div>
        </motion.section>


        {/* Features Section */}
        <section
          id="features"
          className="py-16 px-6 bg-C text-foreground transition-all"
        >
          <div className="mx-auto text-center">
            <h1 className="tracking-tight inline font-semibold from-[#5EA2EF] to-[#0072F5] text-4xl lg:text-5xl bg-clip-text text-transparent bg-gradient-to-b">Key Features</h1>            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mt-10 ml-24 ">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-lg shadow-lg bg-[#0a0a0a] border-2 border-blue-400"
              >
                <h3 className="text-xl font-bold mb-4 text-red-400">Real-Time Analytics</h3>
                <p>
                  Track the progress and performance of your digital campaigns
                  in real-time with our powerful analytics tools.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-lg shadow-lg bg-[#0a0a0a] border-2 border-blue-400"
              >
                <h3 className="text-xl font-bold mb-4 text-green-400">Interactive Strategies</h3>
                <p>
                  Collaborate with your team and test out various strategies in
                  interactive simulations to optimize your tactics.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-lg shadow-lg bg-[#0a0a0a] border-2 border-blue-400"
              >
                <h3 className="text-xl font-bold mb-4 text-orange-400">Advanced AI</h3>
                <p>
                  Our platform incorporates cutting-edge AI that provides
                  actionable insights and recommendations for every move you
                  make.
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
              href="mailto:contact@codeofwar.com"
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
