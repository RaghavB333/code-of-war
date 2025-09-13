"use client"
import React, { useState, useEffect } from 'react'
import { createContext } from 'react'
import axios from 'axios';
export const UserDataContext = createContext();


const UserContext = ({children}) => {

    const [user, setUser] = useState(null);

    const updateUser = (user) => {
      setUser(user);
  };

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
