"use client";
import { useEffect,useContext } from 'react';
import { useRouter } from 'next/navigation';
import { LobbyDataContext } from '@/context/LobbyContext';
import { UserDataContext } from '@/context/UserContext';
import io from 'socket.io-client';




export default function AcceptInvite() {
  const router = useRouter();
  const { socket } = useContext(LobbyDataContext);
  const { user, setUser } = useContext(UserDataContext);

  // useEffect(() => {
  //   const handleInvite = (data) => {
  //       console.log("received invite", data);
  //     if (confirm(`${data.inviterEmail} invited you to a lobby`)) {
  //       socket.emit('accept-invite', { 
  //         lobbyId: data.lobbyId, 
  //         email: user.email 
  //       }, (response) => {
  //         if (response.success) {
  //           router.push(`/lobby/${response.lobbyId}`);
  //         }
  //       });
  //     }
  //   };

  //   socket.on('receive-invite', handleInvite);
  //   return () => socket.off('receive-invite', handleInvite);
  // }, [socket, user && user.email, router]);

  return null;
}