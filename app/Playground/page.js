// "use client";

// import { useState,useContext } from 'react';
// import { LobbyDataContext } from '@/context/LobbyContext.jsx';
// import { UserDataContext } from "@/context/UserContext";
// import { useRouter } from "next/navigation";

// export default function CreateLobby() {
//   const { socket } = useContext(LobbyDataContext);
//   const { user } = useContext(UserDataContext);

//   const router = useRouter();


//   const handleCreateLobby = async () => {
//     try {
//       // Verify socket connection first
//       if (!socket.connected) {
//         console.error('Socket not connected!');
//         return;
//       }
  
//       console.log('Attempting to create lobby...');
      
//       socket.emit('create-lobby', { email: user.email }, (response) => {
//         if (!response) {
//           console.error('No response received from server');
//           return;
//         }
        
//         if (response.success) {
//           console.log('Lobby created successfully:', response.lobbyId);
//           router.push(`/lobby/${response.lobbyId}`);
//         } else {
//           console.error('Failed to create lobby:', response.error);
//         }
//       });
//     } catch (err) {
//       console.error('Error in handleCreateLobby:', err);
//     }
//   };


//   return (
//     <div>
//       <div>
//         <form>
//           <h3>Select number of problems</h3>
//           <select className="w-[30vw] p-2 border text-black border-gray-300 rounded-md mb-4">
//             <option hidden></option>
//             <option value="1">1</option>
//             <option value="2">2</option>
//             <option value="3">3</option>
//             <option value="4">4</option>
//             <option value="5">5</option>
//           </select>
//           <h3>Select Difficulty</h3>
//           <select className="w-[30vw] text-black p-2 border border-gray-300 rounded-md mb-4">
//             <option hidden></option>
//             <option value="Give me Story">Give me Story</option>
//             <option value="Give me Balance">Give me Balance</option>
//             <option value="Give me no Marcy">Give me no Marcy</option>
//           </select>
//           <h3>Select Time</h3>
//           <select className="w-[30vw] text-black p-2 border border-gray-300 rounded-md mb-4">
//             <option hidden></option>
//             <option value="30">30 Minutes</option>
//             <option value="45">45 Minutes</option>
//             <option value="60">60 Minutes</option>
//             <option value="90">90 Minutes</option>
//             <option value="120">120 Minutes</option>
//           </select>
//         </form>
//         <button 
//       onClick={handleCreateLobby}
//       // disabled={loading}
//       className="create-lobby-btn"
//     >
//       Create Lobby
//     </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useContext, useEffect } from 'react';
import { LobbyDataContext } from '@/context/LobbyContext.jsx';
import { UserDataContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function CreateLobby() {
  const { socket } = useContext(LobbyDataContext);
  const { user } = useContext(UserDataContext);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    problemCount: '',
    difficulty: '',
    timeLimit: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [socketStatus, setSocketStatus] = useState('checking');
  
  useEffect(() => {
    if (socket) {
      setSocketStatus(socket.connected ? 'connected' : 'disconnected');
      
      const handleConnect = () => setSocketStatus('connected');
      const handleDisconnect = () => setSocketStatus('disconnected');
      
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, [socket]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      
      socket.emit('create-lobby', { 
        email: user.email,
        settings: formData
      }, (response) => {
        setIsLoading(false);
        
        if (!response) {
          setError('No response received from server');
          return;
        }
        
        if (response.success) {
          router.push(`/lobby/${response.lobbyId}?difficulty=${formData.difficulty}&no=${formData.problemCount}`);
        } else {
          setError(`Failed to create lobby: ${response.error}`);
        }
      });
    } catch (err) {
      setIsLoading(false);
      setError(`Error creating lobby: ${err.message}`);
    }
  };

  const isFormComplete = formData.problemCount && formData.difficulty && formData.timeLimit;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gray-900 py-8 px-6">
            <h1 className="text-3xl font-bold text-white text-center">Create Coding Battle</h1>
            <p className="text-blue-100 text-center mt-2">Set up your competitive coding session</p>
          </div>
          
          <div className="p-6">
            {socketStatus !== 'connected' && (
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      {socketStatus === 'checking' ? 'Checking connection status...' : 'Not connected to server. Please refresh the page.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form className="space-y-6">
              <div>
                <label htmlFor="problemCount" className="block text-sm font-medium text-white mb-1">
                  Number of Problems
                </label>
                <div className="relative">
                  <select
                    id="problemCount"
                    name="problemCount"
                    value={formData.problemCount}
                    onChange={handleChange}
                    className="appearance-none bg-gray-700 text-white block w-full px-4 py-3 border border-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" disabled hidden>Select problem count</option>
                    <option value="1">1 Problem</option>
                    <option value="2">2 Problems</option>
                    <option value="3">3 Problems</option>
                    <option value="4">4 Problems</option>
                    <option value="5">5 Problems</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-white mb-1">
                  Difficulty Level
                </label>
                <div className="relative">
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="appearance-none block bg-gray-700 w-full px-4 py-3 border border-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  >
                    <option value="" disabled hidden>Select difficulty</option>
                    <option value="Give Me Story">Give me Story (Easy)</option>
                    <option value="Give Me Balanced">Give me Balanced (Medium)</option>
                    <option value="Give Me No Mercy">Give me no Mercy (Hard)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-white mb-1">
                  Time Limit
                </label>
                <div className="relative">
                  <select
                    id="timeLimit"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleChange}
                    className="appearance-none block bg-gray-700 w-full px-4 py-3 border border-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  >
                    <option value="" disabled hidden>Select time limit</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes (1 Hour)</option>
                    <option value="90">90 Minutes (1.5 Hours)</option>
                    <option value="120">120 Minutes (2 Hours)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          <div className="px-6 py-4 bg-gray-900">
            <button 
              onClick={handleCreateLobby}
              disabled={isLoading || !isFormComplete || socketStatus !== 'connected'}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white text-lg font-medium 
                ${isFormComplete && socketStatus === 'connected' ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800' : 'bg-gray-300 cursor-not-allowed'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Lobby
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Create a lobby to invite friends and start coding together
          </p>
        </div>
      </div>
    </div>
  );
}
