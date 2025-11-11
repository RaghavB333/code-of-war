"use client"
import React from 'react'
import { useState, useContext } from 'react';
import axios from "axios"
import { useRouter } from 'next/navigation';
import { UserDataContext } from '@/context/UserContext';
import { signIn} from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { Mail, Lock } from 'lucide-react';
import Image from 'next/image';

const Login = () => {
    const [email, setemail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const {setUser} = useContext(UserDataContext);
    const router = useRouter();
    
    const submitHandler = async(e) => {
      e.preventDefault();
      const userData = {
       email: email,
       password: password
     };
     try{
      const response = await axios.post(`/api/userlogin`, userData, {withCredentials: true});
        if(response.status === 200){
          const data = response.data;
          setUser(data.user);
          setemail('');
          setPassword('');
          router.push('/');
        }
        else{
          setMessage(response.data.message);
        }
      }catch(error){
        if (error.response) {
          setMessage(error.response.data.message || "Something went wrong");
        } else {
        setMessage("Network error. Please try again.");
        } 
        console.log(error);
      }
  }

  const boxs = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
  
    return (
      <div className='max-h-screen relative flex flex-wrap gap-4 overflow-hidden'>
        {boxs.map((box,index)=> (
          <div key={index} className='w-9 h-9 rounded-lg border border-blue-400'></div>
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_40%,black_90%)] pointer-events-none"></div>
      <div className="min-h-screen absolute w-full bg-[#0a0a0ab3] flex items-center justify-center px-4">
      <div className="bg-[#09090b] rounded-2xl shadow-[0_0_60px_20px_rgba(0,0,0,0.8)] w-full px-8 max-w-[420px] border border-white/10">
        <div>
          <Image src='/cow1.png' alt='logo' width={220} height={100} className='mx-auto'></Image>
        </div>

        <form onSubmit={submitHandler} className="mt-8">
          <div className="space-y-1">
            <label className="text-sm font-medium text-white block">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-[#67676e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e)=>setemail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#09090b] border border-white/10 focus:border-white/80 focus:ring-2 focus:ring-white/20 transition-colors text-white placeholder:text-[#67676e]"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="space-y-1 mt-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white block">Password</label>
              <a href="#" className="text-sm text-blue-300 hover:text-blue-400">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-[#67676e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#09090b] border border-white/10 focus:border-white/80 focus:ring-2 focus:ring-white/20 transition-colors text-white placeholder:text-[#67676e]"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <p className={message == '' ? 'hidden' : 'block text-center'}>{message}</p>

          <button
            type="submit"
            className="w-full mt-6 bg-white hover:bg-white/90 text-black font-semibold py-2 rounded-lg transition-colors duration-300"
          >
            Login
          </button>
          {/* <button
            type="submit"
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors duration-300"
          >
            Login
          </button> */}
        </form>

        <div className="flex mt-3 items-center gap-3 before:h-px before:flex-1 before:bg-white/30 after:h-px after:flex-1 after:bg-white/30">
          <span className="text-xs text-muted-foreground">Or</span>
        </div>

          <button onClick={() => signIn("google", { callbackUrl: "/" })} className="w-full flex justify-center items-center mt-3 bg-[#09090b] text-white border border-white/10 font-semibold py-2 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg">
            <FcGoogle className="mr-2 size-5" />
            Continue with Google
          </button>
          {/* <button onClick={() => signIn("google", { callbackUrl: "/" })} className="w-full flex justify-center items-center mt-3 bg-white text-black border border-white font-semibold py-2 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg">
            <FcGoogle className="mr-2 size-5" />
            Continue with Google
          </button> */}

        <p className="text-center mt-6 text-[#8f8f99] pb-4">
          Don't have an account?{' '}
          <a href="/Signup" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
    </div>
    )
}

export default Login
