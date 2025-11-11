// "use client";
// import { useState, useContext, useEffect } from 'react';
// import { LobbyDataContext } from '@/context/LobbyContext.jsx';
// import { UserDataContext } from "@/context/UserContext";
// import UserProtectWrapper from '@/components/UserProtectWrapper'
// import { useRouter } from "next/navigation";

// export default function CreateLobby() {
//   const { socket } = useContext(LobbyDataContext);
//   const { user } = useContext(UserDataContext);
//   const router = useRouter();
  
//   const [formData, setFormData] = useState({
//     problemCount: '',
//     difficulty: '',
//     timeLimit: ''
//   });
  
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [socketStatus, setSocketStatus] = useState('checking');
  
//   useEffect(() => {
//     if (socket) {
//       setSocketStatus(socket.connected ? 'connected' : 'disconnected');
      
//       const handleConnect = () => setSocketStatus('connected');
//       const handleDisconnect = () => setSocketStatus('disconnected');
      
//       socket.on('connect', handleConnect);
//       socket.on('disconnect', handleDisconnect);
      
//       return () => {
//         socket.off('connect', handleConnect);
//         socket.off('disconnect', handleDisconnect);
//       };
//     }
//   }, [socket]);
  
//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleCreateLobby = async () => {
//     console.log('Email : ', user?.email);
//     try {
//       // Verify socket connection first
//       if (!socket.connected) {
//         setError('Socket not connected! Please refresh the page and try again.');
//         return;
//       }

      
      
//       setIsLoading(true);
//       setError('');
//       socket.emit('create-lobby', { 
//         email: user.email,
//         settings: formData
//       }, (response) => {
//         setIsLoading(false);
        
//         if (!response) {
//           setError('No response received from server');
//           return;
//         }
        
//         if (response.success) {
//           router.push(`/lobby/${response.lobbyId}?difficulty=${formData.difficulty}&no=${formData.problemCount}`);
//         } else {
//           setError(`Failed to create lobby: ${response.error}`);
//         }
//       });
//     } catch (err) {
//       setIsLoading(false);
//       setError(`Error creating lobby: ${err.message}`);
//     }
//   };

//   const isFormComplete = formData.problemCount && formData.difficulty && formData.timeLimit;

//   return (
//     <UserProtectWrapper>
//     <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-lg mx-auto">
//         <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
//           <div className="bg-gray-900 py-8 px-6">
//             <h1 className="text-3xl font-bold text-white text-center">Create Coding Battle</h1>
//             <p className="text-blue-100 text-center mt-2">Set up your competitive coding session</p>
//           </div>
          
//           <div className="p-6">
//             {socketStatus !== 'connected' && (
//               <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0">
//                     <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <div className="ml-3">
//                     <p className="text-sm text-yellow-700">
//                       {socketStatus === 'checking' ? 'Checking connection status...' : 'Not connected to server. Please refresh the page.'}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {error && (
//               <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
//                 <div className="flex">
//                   <div className="flex-shrink-0">
//                     <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <div className="ml-3">
//                     <p className="text-sm text-red-700">{error}</p>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             <form className="space-y-6">
//               <div>
//                 <label htmlFor="problemCount" className="block text-sm font-medium text-white mb-1">
//                   Number of Problems
//                 </label>
//                 <div className="relative">
//                   <select
//                     id="problemCount"
//                     name="problemCount"
//                     value={formData.problemCount}
//                     onChange={handleChange}
//                     className="appearance-none bg-gray-700 text-white block w-full px-4 py-3 border border-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     <option value="" disabled hidden>Select problem count</option>
//                     <option value="1">1 Problem</option>
//                     <option value="2">2 Problems</option>
//                     <option value="3">3 Problems</option>
//                     <option value="4">4 Problems</option>
//                     <option value="5">5 Problems</option>
//                   </select>
//                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
//                     <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                 </div>
//               </div>
              
//               <div>
//                 <label htmlFor="difficulty" className="block text-sm font-medium text-white mb-1">
//                   Difficulty Level
//                 </label>
//                 <div className="relative">
//                   <select
//                     id="difficulty"
//                     name="difficulty"
//                     value={formData.difficulty}
//                     onChange={handleChange}
//                     className="appearance-none block bg-gray-700 w-full px-4 py-3 border border-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
//                   >
//                     <option value="" disabled hidden>Select difficulty</option>
//                     <option value="Give Me Story">Give me Story (Easy)</option>
//                     <option value="Give Me Balanced">Give me Balanced (Medium)</option>
//                     <option value="Give Me No Mercy">Give me no Mercy (Hard)</option>
//                   </select>
//                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
//                     <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                 </div>
//               </div>
              
//               <div>
//                 <label htmlFor="timeLimit" className="block text-sm font-medium text-white mb-1">
//                   Time Limit
//                 </label>
//                 <div className="relative">
//                   <select
//                     id="timeLimit"
//                     name="timeLimit"
//                     value={formData.timeLimit}
//                     onChange={handleChange}
//                     className="appearance-none block bg-gray-700 w-full px-4 py-3 border border-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
//                   >
//                     <option value="" disabled hidden>Select time limit</option>
//                     <option value="30">30 Minutes</option>
//                     <option value="45">45 Minutes</option>
//                     <option value="60">60 Minutes (1 Hour)</option>
//                     <option value="90">90 Minutes (1.5 Hours)</option>
//                     <option value="120">120 Minutes (2 Hours)</option>
//                   </select>
//                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
//                     <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                 </div>
//               </div>
//             </form>
//           </div>
          
//           <div className="px-6 py-4 bg-gray-900">
//             <button 
//               onClick={handleCreateLobby}
//               disabled={isLoading || !isFormComplete || socketStatus !== 'connected'}
//               className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white text-lg font-medium 
//                 ${isFormComplete && socketStatus === 'connected' ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800' : 'bg-gray-300 cursor-not-allowed'}
//                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]`}
//             >
//               {isLoading ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                   </svg>
//                   Create Lobby
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
        
//         <div className="mt-6 text-center">
//           <p className="text-gray-600 text-sm">
//             Create a lobby to invite friends and start coding together
//           </p>
//         </div>
//       </div>
//     </div>
//     </UserProtectWrapper>
//   );
// }


"use client"

import React, { useEffect, useState, useContext } from 'react';
import { Search, X, Swords, Clock, Zap, Shield, ChevronDown } from 'lucide-react';
import { LobbyDataContext } from '@/context/LobbyContext';
import UserProtectWrapper from '@/components/UserProtectWrapper';
import { useRouter } from "next/navigation";
import axios from 'axios';

const CreateLobby = () => {
  const {socket} = useContext(LobbyDataContext);
  const router = useRouter();
  const [selectionMode, setSelectionMode] = useState('automatic');
  const [questionCount, setQuestionCount] = useState(3);
  const [difficulty, setDifficulty] = useState('easy');
  const [timeLimit, setTimeLimit] = useState(30);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [problems, setProblems] = useState([]);


  useEffect(()=>{
    const fetchProblems = async() => {
      const response = await axios.get('/api/problems');
      setProblems(response.data);
      console.log(response.data);
    }
    fetchProblems();
  },[]);


  const filteredQuestions = problems.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedQuestions.find(sq => sq._id === q._id)
  );

  const addQuestion = (question) => {
    setSelectedQuestions([...selectedQuestions, question]);
  };

  const removeQuestion = (id) => {
    setSelectedQuestions(selectedQuestions.filter(q => q._id !== id));
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'easy': return 'text-emerald-400';
      case 'medium': return 'text-amber-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

    const handleCreateLobby = async () => {
    try {
      // Verify socket connection first
      if (!socket.connected) {
        setError('Socket not connected! Please refresh the page and try again.');
        return;
      }
      setIsLoading(true);
      setError('');

      let questions = [];
      if(selectedQuestions.length > 0){
        selectedQuestions.forEach((q)=> questions.push(q._id));
      }
      
      let response;
      if(selectionMode == 'automatic'){
        response = await axios.post('/api/createplayground', {questionCount,difficulty,timeLimit}, {withCredentials: true});
      }
      else{
        response = await axios.post('/api/createplayground', {questions, timeLimit}, {withCredentials: true});
      }

      if(response.status === 200){
        setIsLoading(false);
        router.push(`/lobby/${response.data.playground._id}`)
      }

    } catch (err) {
      setIsLoading(false);
      setError(`Error creating lobby: ${err.message}`);
      console.log("error", err);
    }
  };
  
  return (
    <UserProtectWrapper>
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-4 md:p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[#0a0a0a] pointer-events-none" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-800/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Swords className="w-10 h-10 md:w-12 md:h-12 text-blue-300" />
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-blue-300">
              CREATE LOBBY
            </h1>
            <Swords className="w-10 h-10 md:w-12 md:h-12 text-blue-300 rotate-180" />
          </div>
          <p className="text-gray-400 text-sm md:text-base">Prepare your battle of knowledge</p>
        </div>

        {/* Selection Mode Toggle */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-950/30 to-gray-900/30 backdrop-blur-sm border border-blue-900/30 rounded-lg p-1 inline-flex gap-1 shadow-2xl">
            <button
              onClick={() => setSelectionMode('automatic')}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-md font-semibold transition-all duration-300 flex items-center gap-2 ${
                selectionMode === 'automatic'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span className="hidden sm:inline">Quick Select</span>
            </button>
            <button
              onClick={() => setSelectionMode('manual')}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-md font-semibold transition-all duration-300 flex items-center gap-2 ${
                selectionMode === 'manual'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="hidden sm:inline">Custom Select</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          {/* Automatic Selection Panel */}
          {selectionMode === 'automatic' && (
            <div className="lg:col-span-2 bg-[#0a0a0a] backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-blue-300 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Quick Selection
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Question Count */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">NUMBER OF QUESTIONS</label>
                  <div className="relative">
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full bg-[#0a0a0a] border-2 border-white/10 rounded-lg px-4 py-4 text-white appearance-none cursor-pointer focus:border-white focus:outline-none transition-colors"
                    >
                      {[3, 5, 7, 10, 15, 20].map(num => (
                        <option key={num} value={num}>{num} Questions</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">DIFFICULTY LEVEL</label>
                  <div className="relative">
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-[#0a0a0a] border-2 border-white/10 rounded-lg px-4 py-4 text-white appearance-none cursor-pointer focus:border-white focus:outline-none transition-colors"
                    >
                      <option value="easy">Give Me Story</option>
                      <option value="medium">Give Me Balanced</option>
                      <option value="hard">Give Me Mercy</option>
                      <option value="mixed">Mixed</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Time Limit */}
              <div className="mt-6">
                <label className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  TIME LIMIT (MINUTES)
                </label>
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3">
                  {[30, 45, 60, 90, 120].map(time => (
                    <button
                      key={time}
                      onClick={() => setTimeLimit(time)}
                      className={`px-4 md:px-6 py-3 rounded-lg font-bold transition-all duration-300 border-2 ${
                        timeLimit === time
                          ? 'bg-white border-white/10 shadow-lg shadow-blue-900/50 text-black scale-105'
                          : 'bg-[#0a0a0a] border-white/10 hover:border-white hover:bg-white/90 hover:text-black'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Manual Selection Panel */}
          {selectionMode === 'manual' && (
            <>
              {/* Search and Available Questions */}
              {/* <div className="bg-gradient-to-br from-gray-900/50 to-blue-950/20 backdrop-blur-sm border border-blue-900/30 rounded-xl p-6 md:p-8 shadow-2xl"> */}
              <div className="backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Available Questions
                </h2>
                
                {/* Search Bar */}
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0a0a0a] border-2 border-white/10 rounded-lg pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                {/* Questions List */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredQuestions.map(question => (
                    <div
                      key={question._id}
                      onClick={() => addQuestion(question)}
                      className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 hover:border-white hover:bg-white cursor-pointer transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-gray-200 group-hover:text-black transition-colors">{question.title}</p>
                          <span className={`text-xs font-semibold uppercase ${getDifficultyColor(question.difficulty)} mt-1 inline-block`}>
                            {question.difficulty == 'easy' ? 'Give Me Story' : question.difficulty == 'medium' ? 'Give Me Balanced' : 'Give Me No Mercy'}
                          </span>
                        </div>
                        <button className="px-4 py-2 bg-white text-black rounded-md text-sm font-semibold group-hover:bg-[#0a0a0a] group-hover:text-white transition-all">
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Questions */}
              <div className="bg-[#0a0a0a] backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-white">
                  Selected Questions ({selectedQuestions.length})
                </h2>
                
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedQuestions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No questions selected yet</p>
                    </div>
                  ) : (
                    selectedQuestions.map(question => (
                      <div
                        key={question._id}
                        className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 hover:border-white hover:bg-white hover:text-black transition-all duration-300 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-gray-200 group-hover:text-black">{question.title}</p>
                            <span className={`text-xs font-semibold uppercase ${getDifficultyColor(question.difficulty)} mt-1 inline-block`}>
                              {question.difficulty == 'easy' ? 'Give Me Story' : question.difficulty == 'medium' ? 'Give Me Balanced' : 'Give Me No Mercy'}
                            </span>
                          </div>
                          <button
                            onClick={() => removeQuestion(question._id)}
                            className="p-2 bg-white text-black rounded-md group-hover:bg-black group-hover:text-white transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Time Limit for Manual */}
                {selectedQuestions.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/30">
                    <label className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      TIME LIMIT (MINUTES)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[30, 45, 60, 90, 120].map(time => (
                        <button
                          key={time}
                          onClick={() => setTimeLimit(time)}
                          className={`px-3 py-2 rounded-lg font-bold transition-all duration-300 border-2 text-sm ${
                            timeLimit === time
                              ? 'bg-white border-white/30 text-black shadow-lg shadow-white/10'
                              : 'bg-black/30 border-gray-700 hover:border-white/80 hover:bg-white/90 hover:text-black'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Create Lobby Button */}
        <div className="text-center">
          <button onClick={handleCreateLobby} className="group relative px-12 md:px-16 py-5 md:py-6 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white text-xl md:text-2xl font-bold rounded-xl shadow-2xl shadow-blue-900/50 hover:shadow-blue-900/80 transition-all duration-300 hover:scale-105 border-2 border-blue-500 overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-3">
              <Swords className="w-6 h-6 md:w-7 md:h-7" />
              CREATE LOBBY
              <Swords className="w-6 h-6 md:w-7 md:h-7 rotate-180" />
            </span>
          </button>
          <p className="mt-4 text-gray-500 text-sm">Begin your quest</p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: white;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: white;
        }
      `}</style>
    </div>
    </UserProtectWrapper>
  );
};

export default CreateLobby;
