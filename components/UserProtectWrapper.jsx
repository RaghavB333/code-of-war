"use client"
import React, { useContext, useEffect, useState } from 'react'
import { UserDataContext } from '@/context/UserContext'
import axios from 'axios';
import AccessModal from './AccessModal';
import HexLoader from './HexLoader';
const UserProtectWrapper = ({
  children
}) => {
    const {setUser} = useContext(UserDataContext);
    const [isUnauthorized, setIsUnauthorized] = useState(false);
    const [showLoader, setShowLoader] = useState(true);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const getProfile = async() => {
        try{
          const response = await axios.get('/api/profile', {withCredentials: true});
          if(response.status === 200){
              const data = response.data;
              console.log(data);
              setUser(data.user);
              setLoading(false);
              setShowLoader(false);
          }
          else{
            setIsUnauthorized(true);
          }
        }catch(error){
          setIsUnauthorized(true);
          setShowLoader(false);
          console.log(error);
        }
      }
      getProfile();
  }, []);
    
  return (
    <div>
        {showLoader && (
          <HexLoader
            isLoading={loading}
            progress={progress}
            onFinish={() => setShowLoader(false)}
          />
        )}
        {isUnauthorized ? <AccessModal/> :  children}
       
    </div>
  )
}

export default UserProtectWrapper