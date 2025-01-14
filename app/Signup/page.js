"use client"
import React from 'react'
import { useState,useContext } from 'react'
import { useRouter } from 'next/navigation';
import { UserDataContext } from '@/context/UserContext';
import { User, Mail, Lock } from 'lucide-react';
import axios from 'axios';
const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setemail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const router = useRouter();
  
    const {user, setUser} = useContext(UserDataContext);
    const submitHandler = async(e) => {
      e.preventDefault();
      const newUser = {
        username: username,
        email: email,
        password: password,
        confirmPassword: confirmPassword
      };
  
      const response = await axios.post(`/api/user`, newUser );
  
      if(response.status === 201){
        const data = response.data;
        setUser(data.user);
        console.log(data.token);
        localStorage.setItem('token', data.token);
        router.push('/Login');
      }
  
      setUsername('');
      setemail('');
      setPassword('');
      setConfirmPassword('');
    }
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-100">Create Account</h2>
          <p className="text-slate-400 mt-2">Join us today and get started</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 block">Username</label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-slate-100 placeholder:text-slate-500"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 block">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
            <label className="text-sm font-medium text-slate-300 block">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-slate-100 placeholder:text-slate-500"
                placeholder="Create a password"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 block">Confirm Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-slate-100 placeholder:text-slate-500"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Create Account
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <a href="/Login" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>



    )
}

export default Signup
