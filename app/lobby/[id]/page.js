"use client";
import { useSearchParams, useRouter,useParams } from 'next/navigation';
import { useState, useEffect, useContext } from 'react';
import { UserDataContext } from '@/context/UserContext';
import { LobbyDataContext } from '@/context/LobbyContext';
import { io } from "socket.io-client";
import axios from 'axios';

export default function LobbyPage() {
  const { id: lobbyId } = useParams();
  console.log(lobbyId);
  const router = useRouter();
  const { socket } = useContext(LobbyDataContext);
  const { user, setUser } = useContext(UserDataContext);
  const [lobby, setLobby] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const usesearchParams = useSearchParams();

  const difficulty = usesearchParams.get("difficulty");
  const no = usesearchParams.get("no");
  console.log(difficulty,no);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    setToken(stored);
  }, []);

  useEffect(() => {
    if (!token) {
      console.log("token does not exist");
    } else {
      axios.post(`/api/profile`, { token })
        .then(async(response) => {
          if (response.status === 200) {
            const data = response.data;
            setUser(data.user);
          }
        })
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, [token, setUser]);

  const getFriends = async () => {
    if (user && user.email) {
      try {
        const response = await axios.post("/api/getfriends", {
          email: user.email,
        });
        const data = response.data;
        setFriends(data.friends);
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    }
  };

  useEffect(() => {
    if (user && user.email) {
      getFriends();
    }
  }, [user]);

  useEffect(() => {
    const getPlaygroundMembers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/createplayground?id=${lobbyId}`);
        const data = response.data;
        setLobby(data.lobby);
      } catch (err) {
        console.error("Error fetching lobby data:", err);
      } finally {
        setLoading(false);
      }
    };
    getPlaygroundMembers();
  }, [lobbyId]);

  // Socket events
  useEffect(() => {
    if(socket != null)
    {

      socket.on('lobby-updated', (updatedLobby) => {
        setLobby(updatedLobby);
      });
      
      socket.on('lobby-started', ({ redirectTo }) => {
        router.push(redirectTo);
      });
      
      return () => {
        socket.off('lobby-updated');
        socket.off('lobby-started');
      };
    }
  }, [socket, router]);

  const getfriendsocketid = async (email) => {
    try {
      console.log("Getting friend's socket ID for:", email);
      const response = await axios.post("/api/getsocketid", { email });
      const friendsocketdata = await response.data;
      return friendsocketdata.id;
    } catch (err) {
      console.error("Error getting friend's socket ID:", err);
      return null;
    }
  };

  const inviteFriend = async (friendEmail) => {
    console.log("Inviting friend:", friendEmail);
    const friendSocketId = await getfriendsocketid(friendEmail);
    if (friendSocketId) {
      socket.emit('send-invite', {
        lobbyId,
        friendEmail,
        friendSocketId,
        senderSokcketId: user.socketId,
        inviterEmail: user.email,
      });
    }
  };

  const startLobby = () => {
    socket.emit('start-lobby', {
      lobbyId,
      email: user.email,
      difficulty,
      no
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading lobby...</p>
        </div>
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6 bg-background rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Lobby Not Found</h2>
          <p className="text-white mb-4">We couldn't find the lobby you're looking for.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#0a0a0a] rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r bg-[#0a0a0a]">
            <h2 className="text-3xl font-bold text-white">
              Lobby: {lobbyId.substring(0, 8)}...
            </h2>
            <p className="text-blue-100 mt-2">
              Host: {lobby.owner}
            </p>
          </div>
          
          <div className="p-6 text-white">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Members Section */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Members ({lobby.members.length})
                </h3>
                <div className="bg-[#0a0a0a] rounded-lg p-4 max-h-64 overflow-y-auto">
                  <ul className="space-y-2">
                    {lobby.members.map((member, index) => (
                      <li key={index} className="flex items-center p-3 bg-[#0a0a0a] rounded-lg shadow-sm">
                        <div className="bg-[#0a0a0a] rounded-full p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-white">{member.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            {member.name === user?.email && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">You</span>
                            )}
                            {member.name === lobby.owner && (
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">Host</span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Friends Section */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Invite Friends
                </h3>
                <div className="bg-[#0a0a0a] rounded-lg p-4 max-h-64 overflow-y-auto">
                  {friends.filter(friend => !lobby.members.includes(friend)).length === 0 ? (
                    <div className="text-center p-4 text-white">
                      All your friends are already in the lobby or you have no friends to invite.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {friends
                        .filter(friend => !lobby.members.includes(friend))
                        .map((friend, index) => (
                          <li key={index} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg shadow-sm">
                            <div className="flex items-center">
                              <div className="bg-[#0a0a0a] rounded-full p-2 mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <span className="font-medium text-white">{friend}</span>
                            </div>
                            <button 
                              onClick={() => inviteFriend(friend)}
                              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all transform hover:scale-105 flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Invite
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
            {/* Host Controls */}
            {lobby.owner === user.email && (
              <div className="mt-8 text-center">
                <button 
                  onClick={startLobby} 
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Coding Session
                </button>
              </div>
            )}
            
            {/* Non-host message */}
            {lobby.owner !== user.email && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-blue-700">
                  Waiting for the host to start the coding session...
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom card with lobby info */}
        <div className="bg-white p-4 rounded-xl shadow-md text-center">
          <p className="text-gray-500 text-sm">
            Lobby ID: {lobbyId}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Share this ID with friends to join directly
          </p>
        </div>
      </div>
    </div>
  );
}