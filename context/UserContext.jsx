"use client"
import React, { useState, useEffect } from 'react'
import { createContext } from 'react'
import axios from 'axios';
import { useSession } from "next-auth/react";
export const UserDataContext = createContext();


const UserContext = ({children}) => {

    const [user, setUser] = useState(null);

    const updateUser = (user) => {
      setUser(user);
  };

    const { data: session } = useSession();
  
    const googleRegister = async(session) => {
      try{
        const res = await axios.post(`/api/googlelogin`, {
            username: session.user.name,
            email: session.user.email,
          }, {withCredentials: true});
          if(res.status === 200){
            setUser(res.data.user);
          }
      }catch{
        console.log("Google Signin Error");
      }
    }
  
      useEffect(() => {
      if (session?.user) {
        googleRegister(session);
      }
    }, [session]);

    useEffect(() => {
     const getProfile = async() => {
        try{
          const response = await axios.get('/api/profile', {withCredentials: true});
          if(response.status === 200){
              const data = response.data;
              console.log(data);
              setUser(data.user);
          }
        }catch(error){
          console.log(error);
        }
     }
      getProfile();
  }, []);

    const value = {
        user,
        setUser,
        updateUser
    }
  return (
    <div>
      <UserDataContext.Provider value={value}>
        {children}
        </UserDataContext.Provider>
    </div>
  )
}

export default UserContext
