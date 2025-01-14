"use client"
import React from 'react'
import { useEffect, useState,useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { UserDataContext } from '@/context/UserContext';
import UserProtectWrapper from '@/components/UserProtectWrapper'


const socket = io('http://localhost:4000');

const Playground = () => {

  const [friendId, setFriendId] = useState('');
  const [friends,setFriends] = useState([]);

  const router = useRouter();
  const {user} = useContext(UserDataContext);

  

  const sendRequest = () => {
    socket.emit('send-request', { to: friendId});
  };

  const getFriends = async()=>{
    const response = await axios.post('/api/getfriends',{email: user.email});
    const data = response.data;
    setFriends(data.friends);

  }

  useEffect(() => {
    getFriends();
  }, [user && user.email])

  const getfriendsocketid = async(email) =>{
    const response = await axios.post('api/getsocketid',{email});
    setFriendId(response.data.id);
    console.log(response.data);
    sendRequest();
  }
  



  return (
    <UserProtectWrapper>
    <div>
      <div className='flex justify-center items-center gap-10 w-full h-screen'>

      <div className='w-96 h-96 border'>

      </div>


      <div className='w-96 h-96 border'>
      {friends && friends.map((friend) => (
  <div key={friend} className='flex items-center justify-between border-b p-2'>
    <div className='text-white'>{friend}</div>
    <button onClick={()=>getfriendsocketid(friend)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
      Add +
    </button>
  </div>
))}
        </div>

      </div>
    </div>
    </UserProtectWrapper>
  )
}

export default Playground
