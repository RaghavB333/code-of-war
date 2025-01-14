"use client"
import React, { useState } from 'react'
import { createContext } from 'react'
export const UserDataContext = createContext();


const UserContext = ({children}) => {

    const [user, setUser] = useState(null);

    const updateUser = (user) => {
      setUser(user);
  };

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
