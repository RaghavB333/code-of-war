"use client"
import React, { useState, useEffect } from 'react'
import { createContext } from 'react'
import { io } from 'socket.io-client';

export const LobbyDataContext = createContext();


const LobbyContext = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [currentLobby, setCurrentLobby] = useState(null);
  const [lobbyMembers, setLobbyMembers] = useState([]);
  const [lobbyStatus, setLobbyStatus] = useState('waiting');

  useEffect(() => {
    const newSocket = io("https://code-of-war-1.onrender.com/");
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
  }, []);

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