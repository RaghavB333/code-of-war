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
        response = await axios.post('/api/playground/createplayground', {questionCount,difficulty,timeLimit}, {withCredentials: true});
      }
      else{
        response = await axios.post('/api/playground/createplayground', {questions, timeLimit}, {withCredentials: true});
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
