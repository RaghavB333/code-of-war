"use client"
import React from 'react'
import { useState, useEffect,useContext } from 'react';
import { UserDataContext } from '@/context/UserContext';
import UserProtectWrapper from '@/components/UserProtectWrapper'
import { Mail, User, Bell, Plus, Activity, Users, Calendar, Settings } from 'lucide-react';
import axios from 'axios';
const Dashboard = () => {
    const [friendemail, setFriendEmail] = useState('');
    const [notifications,setNotifications] = useState([]);
    const [friends,setFriends] = useState([]);

    const {user} = useContext(UserDataContext);
    console.log(user);

    const getnotifications = async()=>{
      if(user && user.email)
      {
        const response = await axios.post('/api/getnotifications',{email:user.email});
  
        const data = response.data;
        setNotifications(data.notifications);
        console.log(notifications);
      }
  }  


  const getFriends = async()=>{
    if(user && user.email)
    {
      const response = await axios.post('/api/getfriends',{email: user.email});
      const data = response.data;
      setFriends(data.friends);
    }

  }

  useEffect(() => {
    getFriends();
  }, [user && user.email])


  useEffect(() => {
    if(user && user.email)
    getnotifications();

  }, [user && user.email]);


  const handleAccept = async(senderEmail,receiverEmail) =>{
    const data = {
      senderEmail:senderEmail,
      receiverEmail:receiverEmail
    }
    const response = await axios.post('api/acceptrequest',data);
    console.log(response.data);
    getnotifications();
  }

  if(notifications){
    console.log(notifications);
  }
  


    const handlesumbit = async(e) =>{
        e.preventDefault();
        if(user && user.email)
        {
          const data = {
              email: user.email,
              friendemail:friendemail
          }
          const response = await axios.post('/api/addfriend', data);
  
          console.log(response);
          setFriendEmail('');
        }


    }

  return (
    <UserProtectWrapper>

<div className="flex min-h-screen bg-gray-900">
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Stats Section */}
          <div className="col-span-8">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Total Friends</p>
                    <h3 className="text-3xl font-bold text-white mt-2">{friends.length}</h3>
                  </div>
                  <Users className="w-12 h-12 text-emerald-100" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Activity Status</p>
                    <h3 className="text-3xl font-bold text-white mt-2">Active</h3>
                  </div>
                  <Activity className="w-12 h-12 text-blue-100" />
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center p-4 bg-gray-700 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-white">Activity Update {item}</p>
                      <p className="text-sm text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Add Friend Section */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Add Friend</h2>
              <form onSubmit={handlesumbit} className="space-y-4">
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={friendemail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter friend's email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Friend
                </button>
              </form>
            </div>

            {/* Friends List */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Friends</h2>
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-white">{friend.split('@')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications Panel */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Notifications</h2>
                <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                  {notifications.length}
                </span>
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-6">
                  <Bell className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">No new notifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map(({ id, senderEmail, receiverEmail, timestamp, type }) => (
                    <div key={id} className="bg-gray-700 rounded-lg p-4 transition-all hover:bg-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {senderEmail.split('@')[0]}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {type === 'friend_request' ? 'Sent you a friend request' : 'New notification'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => handleAccept(senderEmail, receiverEmail)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(senderEmail)}
                          className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </UserProtectWrapper>
  )
}

export default Dashboard
