"use client"
import React, { useContext, useEffect, useState } from 'react'
import { UserDataContext } from '@/context/UserContext'
import { useRouter } from 'next/navigation';
import axios from 'axios';
const UserProtectWrapper = ({
  children
}) => {
  const [token, setToken] = useState(null);
  const router = useRouter();
  const { user, setUser } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/Login');
      return;
    }

    setToken(storedToken); // Safe, only in client

    axios.post(`/api/profile`, { token: storedToken })
      .then((response) => {
        if (response.status === 200) {
          setUser(response.data.user);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        localStorage.removeItem('token');
        router.push('/Login');
      });
  }, [router, setUser]);

  if (isLoading) {
    return <div>Loading...</div>
  }
  return (
    <div>
      {children}
    </div>
  )
}

export default UserProtectWrapper