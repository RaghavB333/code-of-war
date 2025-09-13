"use client"
import React from 'react'
import { useState, useContext } from 'react';
import axios from "axios"
import { useRouter } from 'next/navigation';
import { UserDataContext } from '@/context/UserContext';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
    const [email, setemail] = useState('');
    const [password, setPassword] = useState('');
    // const [userData, setUserData] = useState({});
  
    const {user, setUser} = useContext(UserDataContext);
    const router = useRouter();
    
    const submitHandler = async(e) => {
      e.preventDefault();
     const userData = {
       email: email,
       password: password
     };
     const response = await axios.post(`/api/userlogin`, userData, {withCredentials: true});
      if(response.status === 200){
        const data = response.data;
        setUser(data.user);
        console.log(data);
        localStorage.setItem('token', data.token);
        setemail('');
        setPassword('');
        router.push('/');
    }
  }
  
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl shadow-black/50 p-8 w-full max-w-md border border-gray-800">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-100">Welcome Back</h2>
          <p className="text-slate-400 mt-2">Please sign in to continue</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 block">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e)=>setemail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-slate-100 placeholder:text-slate-500"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-300 block">Password</label>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-slate-100 placeholder:text-slate-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-slate-100 font-semibold py-3 rounded-lg transition-colors duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400">
          Don't have an account?{' '}
          <a href="/Signup" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
    )
}

export default Login
