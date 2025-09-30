"use client"
import React, { useState, useEffect, useContext } from 'react'
import { createContext } from 'react'
import { io } from 'socket.io-client';
import { UserDataContext } from './UserContext';

export const LobbyDataContext = createContext();


const LobbyContext = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [currentLobby, setCurrentLobby] = useState(null);
  const [lobbyMembers, setLobbyMembers] = useState([]);
  const [lobbyStatus, setLobbyStatus] = useState('waiting');

  const {user} = useContext(UserDataContext);

  useEffect(() => {
    if(user && user.email !== '' && user.email !== null){
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    // Setup event listeners
    newSocket.on('lobby-created', (data) => {
      console.log('Lobby created:', data);
      setCurrentLobby(data.lobbyId);
    });

    newSocket.on('lobby-updated', (data) => {
      setLobbyMembers(data.members);
    });

    newSocket.on('playground-started', (data) => {
      setLobbyStatus('active');
    });

    newSocket.on('lobby-error', (error) => {
      console.error('Lobby error:', error.message);
    });

    
    return () => {
      newSocket.disconnect();
    };
  }
  }, [user && user.email]);


    useEffect(() => {
      if (socket != null) {
        const registerUser = () => {
          if (user && user.email) {
            console.log("Registering user:", user.email);
            socket.emit("register-user", { email: user.email });
          }
        };
  
        socket.on('connect', () => {
          console.log('Connected to server with socket ID:', socket.id);
          registerUser(); // register on first connect
        });
  
        // Register again if the socket reconnects
        socket.on('reconnect', () => {
          console.log("Reconnected:", socket.id);
          registerUser();
        });
  
        return () => {
          socket.off("connect");
          socket.off("reconnect");
        };
      }
    }, [user, socket]);



  const updateLobby = (lobbyData) => {
    if (lobbyData.id) setCurrentLobby(lobbyData.id);
    if (lobbyData.members) setLobbyMembers(lobbyData.members);
    if (lobbyData.status) setLobbyStatus(lobbyData.status);
  };

  const value = {
    socket,
    setSocket,
    currentLobby,
    lobbyMembers,
    lobbyStatus,
    setCurrentLobby,
    setLobbyMembers,
    setLobbyStatus,
    updateLobby
  };

  return (
    <div>
      <LobbyDataContext.Provider value={value}>
        {children}
      </LobbyDataContext.Provider>
    </div>
  );
};

export default LobbyContext;