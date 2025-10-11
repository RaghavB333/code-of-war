"use client"
import React from 'react'
import { useState, useEffect } from 'react'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock } from 'lucide-react';
import { signIn} from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import axios from 'axios';
const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setemail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();


            useEffect(() => {
             const getProfile = async() => {
                try{
                  const response = await axios.get('/api/profile', {withCredentials: true});
                  if(response.status === 200){
                      router.push('/');
                  }
                  else{
                    setMessage(response.data.message);
                  }
                }catch(error){
                  console.log(error);
                }
             }
              getProfile();
          }, []);
  
    const submitHandler = async(e) => {
      e.preventDefault();
      const newUser = {
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword
      };
      try{
      const response = await axios.post(`/api/user`, newUser, {withCredentials: true});
  
      if(response.status === 200){
        setUsername('');
        setemail('');
        setPassword('');
        setConfirmPassword('');
        router.push('/Login');         
      }
    }catch(error){
      setMessage(error.response.data.message);
    }
    }

    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center mx-4">
      <div className="bg-[#09090b] rounded-2xl border border-white/10 shadow-xl px-8 py-3 w-full max-w-[420px]">
        <div>
          <Image src='/cow1.png' alt='logo' width={220} height={100} className='mx-auto'></Image>
        </div>

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 block">Username</label>
            <div className="relative">
              <User className="w-5 h-5 text-[#67676e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#09090b] border border-white/10 focus:border-white/80 focus:ring-2 focus:ring-white/20 transition-colors text-white placeholder:text-[#67676e]"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 block">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-[#67676e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e)=>setemail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#09090b] border border-white/10 focus:border-white/80 focus:ring-2 focus:ring-white/20transition-colors text-white placeholder:text-[#67676e]"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 block">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-[#67676e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#09090b] border border-white/10 focus:border-white/80 focus:ring-2 focus:ring-white/20 transition-colors text-white placeholder:text-[#67676e]"
                placeholder="Create a password"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 block">Confirm Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-[#67676e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#09090b] border border-white/10 focus:border-white/80 focus:ring-2 focus:ring-white/20 transition-colors text-white placeholder:text-[#67676e]"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <p className={message == '' ? 'hidden' : 'block text-center'}>{message}</p>

          <button
            type="submit"
            className="w-full bg-white hover:bg-white/90 text-black font-semibold py-2 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Create Account
          </button>
        </form>

        <div className="flex mt-3 items-center gap-3 before:h-px before:flex-1 before:bg-white/30 after:h-px after:flex-1 after:bg-white/30">
          <span className="text-xs text-muted-foreground">Or</span>
        </div>

          <button onClick={() => signIn("google", { callbackUrl: "/" })} className="w-full flex justify-center items-center mt-3 bg-[#09090b] text-white border border-white/10 font-semibold py-2 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg">
              <FcGoogle className="mr-2 size-5" />
              Continue with Google
          </button>

        <p className="text-center mt-2 text-[#8f8f99] pb-2">
          Already have an account?{' '}
          <a href="/Login" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
    )
}

export default Signup
