"use client"
import React, { useContext, useEffect, useState } from 'react'
import { UserDataContext } from '@/context/UserContext'
import { useRouter } from 'next/navigation';
import axios from 'axios';
const UserProtectWrapper = ({
  children
}) => {
    const router = useRouter();
    const {setUser} = useContext(UserDataContext);
    const [isLoading, setIsLoading] = useState(true);

        useEffect(() => {
         const getProfile = async() => {
            try{
              const response = await axios.get('/api/profile', {withCredentials: true});
              if(response.status === 200){
                  const data = response.data;
                  console.log(data);
                  setUser(data.user);
                  setIsLoading(false);
              }
              else{
                router.push('/Login');
              }
            }catch(error){
              router.push('/Login');
              console.log(error);
            }
         }
          getProfile();
      }, []);

    if(isLoading){
        return <div>Loading...</div>
    }
  return (
    <div>
      {children}
    </div>
  )
}

export default UserProtectWrapper