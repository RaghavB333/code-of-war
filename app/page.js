"use client";
import Link from "next/link";
import { io } from "socket.io-client";
import { React, useEffect, useState, useContext,useRef } from "react";
import { UserDataContext } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import axios from "axios";

const socket = io("http://localhost:4000");


export default function Home() {
  const [receivedRequest, setReceivedRequest] = useState(null);
  const [notifications, setNotificatins] = useState("helodjfkdjs");
  // const [socketid,setSocketid] = useState(null);
  const socketid = useRef(null);

  const {user, setUser} = useContext(UserDataContext);
  const router = useRouter();

  const token = localStorage.getItem('token');

  const storesocketid = async()=>{
    const email = user.email
    console.log(email,socketid.current);
    const data = {
      socketid:socketid.current,
      email: email
    }
    const response = await axios.post('/api/storesocketid',data);
    console.log(response.data);
  }
  
    useEffect(() => {
      if(user && user.email && socketid.current != null)
      {
        storesocketid();
      }
    }, [user && user.email]);
    


  useEffect(() => {
      socket.on('connect', async() => {
        console.log('Connected to server:', socket.id);
        // setSocketid(socket.id);
        socketid.current = socket.id;
  
      });


    // Listen for incoming requests
    socket.on("receive-request", (data) => {
      setReceivedRequest(data);
      confirm("You have a new request");
      setNotificatins(data);
      console.log(data);
      console.log(receivedRequest);
    })

    return () => {
      socket.off("receive-request");
    };
  }, []);


  useEffect(() => {
    if(!token){
      console.log("token is not exist")
  }
  else{
    axios.post(`/api/profile`, {token
  }).then((response) => {
    if(response.status === 200){
        const data = response.data;
        console.log(data.data);
        setUser(data.user);
    }
  })
  }

    
  }, [token])
  


  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <main>
        {/* Hero Section */}
        
        <section className="py-48  flex flex-col justify-center items-center text-center text-white">
          <h2 className="text-4xl font-extrabold mb-4">
            Welcome to Code of War
          </h2>
          <p className="text-lg mb-6">
            A revolutionary project for the future of digital warfare.
          </p>
          <Link
            href="/About"
            className="bg-white text-[#0a0a0a] py-2 px-6 rounded-lg text-lg font-semibold hover:bg-red-50 transition duration-300"
          >
            Learn More
          </Link>
        </section>

        {/* Features Section */}
        <section id="features" className=" py-16 px-6 bg-C text-foreground">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-6">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className=" p-6 rounded-lg shadow-lg bg-[#0a0a0a]">
                <h3 className="text-xl font-bold mb-4">Real-Time Analytics</h3>
                <p>
                  Track the progress and performance of your digital campaigns
                  in real-time with our powerful analytics tools.
                </p>
              </div>
              <div className=" p-6 rounded-lg shadow-lg bg-[#0a0a0a]">
                <h3 className="text-xl font-bold mb-4">
                  Interactive Strategies
                </h3>
                <p>
                  Collaborate with your team and test out various strategies in
                  interactive simulations to optimize your tactics.
                </p>
              </div>
              <div className=" p-6 rounded-lg shadow-lg bg-[#0a0a0a]">
                <h3 className="text-xl font-bold mb-4">Advanced AI</h3>
                <p>
                  Our platform incorporates cutting-edge AI that provides
                  actionable insights and recommendations for every move you
                  make.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-6">Contact Us</h2>
            <p className="text-lg mb-8">
              We would love to hear from you. Whether you’re a developer,
              strategist, or enthusiast, feel free to reach out to us!
            </p>
            <a
              href="mailto:contact@codeofwar.com"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
            >
              Get in Touch
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-4 text-center">
        <p>&copy; 2025 Code of War. All rights reserved.</p>
      </footer>
    </div>
  );
}
