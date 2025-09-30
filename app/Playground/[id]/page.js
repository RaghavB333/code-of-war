"use client";
import React from "react";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { UserDataContext } from "@/context/UserContext";
import { LobbyDataContext } from "@/context/LobbyContext";
import UserProtectWrapper from "@/components/UserProtectWrapper";

// const socket = io("https://code-of-war-1.onrender.com/");

const Playground = ({params}) => {
  const [friendId, setFriendId] = useState("");
  const [friends, setFriends] = useState([]);
  const [members,setMembers] = useState([]);
  

  const { id } = React.use(params);
  console.log("plaground id:", id);

  const router = useRouter();
  const { user } = useContext(UserDataContext);
  const {socket} = useContext(LobbyDataContext);

  const sendRequest = (email) => {
    socket.emit("send-request", { to: friendId, friendemail:email, from: user.email, sendersocketid: user.socketId,id:id });
  };

  const getFriends = async () => {
    if (user && user.email) {
      const response = await axios.post("/api/getfriends", {
        email: user.email,
      });
      const data = response.data;
      setFriends(data.friends);
    }
  };

  useEffect(() => {
    getFriends();
  }, [user && user.email]);

  const getfriendsocketid = async (email) => {
    const response = await axios.post("/api/getsocketid", { email });
    setFriendId(response.data.id);
    console.log(response.data);
    sendRequest(email);
  };

  const getplaygroundmembers = async()=>{
    const response = await axios.get(`/api/createplayground?id=${id}`);
    const data = response.data;
    setMembers(data.members);
    console.log(response);
  }


  useEffect(() => {
    const handleRequestAccepted = (data) => {
      console.log("Friend accepted invite:", data);
      getplaygroundmembers();
    };
  
    socket.on("request-accepted", handleRequestAccepted);
  
    return () => {
      socket.off("request-accepted", handleRequestAccepted);
    };
  }, []);

  const startplayground = async () => {
    console.log("start");
    try {
      // First get all socket IDs
      const socketIds = await Promise.all(
        members.map(async (member) => {
          const response = await axios.post("/api/getsocketid", { email: member });
          return response.data.id;
        })
      );
      
      // Then emit to all of them
      socketIds.forEach(socketid => {
        if (socketid) {
          socket.emit('joinLobby', { lobbyid: id, socketid: socketid });
        }
      });
      
      // Also navigate the current user
      router.push(`/problems/${id}`);
    } catch (error) {
      console.error("Error starting playground:", error);
    }
  };

 

  useEffect(() => {
    getplaygroundmembers();
  }, [])

  useEffect(() => {
    const handleRouteChange = (data) => {
      console.log('Change Route Event Received:', data);
      router.push(`/problems/${data.id}`);
    };
    socket.on('changeRoute', handleRouteChange);

    return () => {
      socket.off('changeRoute', handleRouteChange); // Cleanup the event listener
    };
  }, [])
  
  

  return (
    <UserProtectWrapper>
      <div className="animate-slideIn">
          <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Send Invite to your Friends
          </h1>
          <div className="flex flex-col items-center gap-10 w-full">
            <div className="flex gap-8 flex-wrap justify-center">
              <div className="w-96 bg-gray-800/50 rounded-xl shadow-xl backdrop-blur-sm border border-gray-700">
                <h2 className="text-xl font-semibold p-4 border-b border-gray-700">Members</h2>
                <div className="h-96 overflow-y-auto">
                  {members?.map((member) => (
                    <div
                      key={member}
                      className="flex items-center justify-between p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                    >
                      <div className="text-gray-200">{member}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-96 bg-gray-800/50 rounded-xl shadow-xl backdrop-blur-sm border border-gray-700">
                <h2 className="text-xl font-semibold p-4 border-b border-gray-700">Friends</h2>
                <div className="h-96 overflow-y-auto">
                  {friends?.map((friend) => (
                    <div
                      key={friend}
                      className="flex items-center justify-between p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                    >
                      <div className="text-gray-200">{friend}</div>
                      <button
                        onClick={() => getfriendsocketid(friend)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        Add +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <button 
              onClick={startplayground}
              className="transform hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-2xl text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-blue-500/25 mb-8"
            >
              Start Playground
            </button>
          </div>
        </div>
    </UserProtectWrapper>
  );
};

export default Playground;
