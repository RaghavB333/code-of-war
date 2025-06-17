"use client"
import React,{useContext, useEffect,useState} from 'react'
import { UserDataContext } from '@/context/UserContext'
import { useRouter } from 'next/navigation';
import axios from 'axios';
const UserProtectWrapper = ({
    children
}) => {
    const token = localStorage.getItem('token');
    const router = useRouter();
    const {user, setUser} = useContext(UserDataContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("token",token);
        if(!token){
            router.push('/Login');
        }

        axios.post(`/api/profile`, {token
      }).then((response) => {
        if(response.status === 200){
            const data = response.data;
            console.log(data);
            setUser(data.user);
            setIsLoading(false);
        }
      }).catch((error) => {
        console.log(error);
        localStorage.removeItem('token');
        router.push('/Login');
      });

    }, [token])

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