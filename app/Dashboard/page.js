"use client"
import React from 'react'
import { useState, useEffect, useContext } from 'react';
import { UserDataContext } from '@/context/UserContext';
import { LobbyDataContext } from '@/context/LobbyContext';
import UserProtectWrapper from '@/components/UserProtectWrapper'
import { Mail, User, Bell, Plus, Activity, Users, Calendar, Settings, Trophy, Target, Zap, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import Heatmap from '@/components/Heatmap';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Dashboard = () => {
    const [friendemail, setFriendEmail] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [friends, setFriends] = useState([]);

    const { user } = useContext(UserDataContext);
    const {socket} = useContext(LobbyDataContext);

    const getnotifications = async () => {
        if (user && user.email) {
            const response = await axios.post('/api/getnotifications', { email: user.email });
            const data = response.data;
            setNotifications(data.notifications);
            console.log(notifications);
        }
    }

    const getFriends = async () => {
        if (user && user.email) {
            const response = await axios.get('/api/getfriends', {withCredentials:true});
            const data = response.data;
            setFriends(data.friends);
        }
    }

    useEffect(() => {
        getFriends();
    }, [user && user.email])

    useEffect(() => {
        if (user && user.email)
            getnotifications();
    }, [user && user.email]);

    const handleAccept = async (senderEmail, receiverEmail) => {
        const data = {
            senderEmail: senderEmail,
            receiverEmail: receiverEmail
        }
        const response = await axios.post('/api/acceptrequest', data);
        console.log(response.data);
        getFriends();
        getnotifications();
    }

    const handleDeny = async(senderEmail) => {
        try{
            const response = await axios.put('/api/denyrequest', {senderEmail: senderEmail}, {withCredentials:true});
            if(response.status == 200){
                console.log(response.data);
                getFriends();
                getnotifications();
            }
        }catch(error){
            console.log(error);
        }
    }

    const handlesumbit = async (e) => {
        e.preventDefault();
        if (user && user.email) {
            const data = {
                email: user.email,
                friendemail: friendemail
            }
            socket.emit('add-friend', {data});
            setFriendEmail('');
        }
    }

    const totalProblems = user ? user.easyproblemssolved + user.mediumproblemssolved + user.hardproblemssolved : 0;

    return (
        <UserProtectWrapper>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                {/* Header */}
                <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                                    <p className="text-sm text-gray-400">Welcome back, {user && user.username}!</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Bell className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                                    {notifications.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {notifications.length}
                                        </span>
                                    )}
                                </div>
                                <Settings className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-12 gap-8">
                        {/* Main Content */}
                        <div className="col-span-12 lg:col-span-8 space-y-8">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {/* Profile Card */}
                                <div className="md:col-span-2 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 rounded-2xl shadow-xl border border-emerald-400/20">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{user && user.username}</h3>
                                                    <p className="text-emerald-100 text-sm">@{user && user.email.split('@')[0]}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/10 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Zap className="w-4 h-4 text-yellow-300" />
                                                <p className="text-emerald-100 text-sm font-medium">Current Streak</p>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{user && user.streak.current}</p>
                                        </div>
                                        <div className="bg-white/10 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Trophy className="w-4 h-4 text-orange-300" />
                                                <p className="text-emerald-100 text-sm font-medium">Best Streak</p>
                                            </div>
                                            <p className="text-2xl font-bold text-white">{user && user.streak.max}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Problems */}
                                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-2xl shadow-xl border border-blue-400/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <Target className="w-8 h-8 text-blue-100" />
                                        <div className="text-right">
                                            <p className="text-blue-100 text-sm font-medium">Total Solved</p>
                                            <p className="text-3xl font-bold text-white">{totalProblems}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Friends Count */}
                                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl shadow-xl border border-purple-400/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <Users className="w-8 h-8 text-purple-100" />
                                        <div className="text-right">
                                            <p className="text-purple-100 text-sm font-medium">Friends</p>
                                            <p className="text-3xl font-bold text-white">{friends?.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Problems Breakdown */}
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                    <Activity className="w-6 h-6 mr-3 text-blue-400" />
                                    Problem Statistics
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-green-400 font-medium">Easy</span>
                                            <span className="text-green-300 text-sm">●</span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">{user && user.easyproblemssolved}</p>
                                        <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                                            <div 
                                                className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                                                style={{ width: `${totalProblems > 0 ? (user.easyproblemssolved / totalProblems) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-yellow-400 font-medium">Medium</span>
                                            <span className="text-yellow-300 text-sm">●</span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">{user && user.mediumproblemssolved}</p>
                                        <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                                            <div 
                                                className="bg-yellow-500 h-2 rounded-full transition-all duration-1000" 
                                                style={{ width: `${totalProblems > 0 ? (user.mediumproblemssolved / totalProblems) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-red-400 font-medium">Hard</span>
                                            <span className="text-red-300 text-sm">●</span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">{user && user.hardproblemssolved}</p>
                                        <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                                            <div 
                                                className="bg-red-500 h-2 rounded-full transition-all duration-1000" 
                                                style={{ width: `${totalProblems > 0 ? (user.hardproblemssolved / totalProblems) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Heatmap */}
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
                                <Heatmap />
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                    <Calendar className="w-6 h-6 mr-3 text-green-400" />
                                    Recent Activity
                                </h2>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="flex items-center p-4 bg-gray-700/50 hover:bg-gray-700/70 rounded-xl transition-colors border border-gray-600/30">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                                                <Calendar className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium">Solved Problem #{item * 123}</p>
                                                <p className="text-sm text-gray-400">2 hours ago • Medium difficulty</p>
                                            </div>
                                            <div className="text-green-400 text-sm font-medium">+10 XP</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            {/* Add Friend Section */}
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                    <Plus className="w-6 h-6 mr-3 text-blue-400" />
                                    Add Friend
                                </h2>
                                <form onSubmit={handlesumbit} className="space-y-4">
                                    <div className="relative">
                                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            value={friendemail}
                                            onChange={(e) => setFriendEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                                            placeholder="Enter friend's email"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-blue-500/25"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add Friend
                                    </button>
                                </form>
                            </div>

                            {/* Friends List */}
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center justify-between">
                                    <span className="flex items-center">
                                        <Users className="w-6 h-6 mr-3 text-purple-400" />
                                        Friends
                                    </span>
                                    <span className="bg-purple-500/20 text-purple-300 text-sm px-3 py-1 rounded-full">
                                        {friends?.length}
                                    </span>
                                </h2>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {friends?.length <= 0 ? (
                                        <div className="text-center py-8">
                                            <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                                            <p className="text-gray-400">No friends added yet</p>
                                        </div>
                                    ) : (
                                       friends?.length > 0 && friends.map((friend, index) => (
                                            <div key={index} className="flex items-center p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl transition-colors border border-gray-600/20">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-white font-medium">{friend.split('@')[0]}</span>
                                                    <p className="text-sm text-gray-400">{friend}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Notifications Panel */}
<div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
    <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
            <Bell className="w-6 h-6 mr-3 text-yellow-400" />
            Notifications
        </h2>
        <span className="bg-yellow-500/20 text-yellow-300 text-sm px-3 py-1 rounded-full">
            {notifications.length}
        </span>
    </div>
    
    {notifications.length === 0 ? (
        <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No new notifications</p>
        </div>
    ) : (
        <div className="relative overflow-hidden">
            {/* Navigation Buttons */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
                <button className="notifications-prev bg-gray-800/90 hover:bg-gray-700 rounded-full p-2 shadow-lg transition-all duration-200">
                    <ChevronLeft className="w-4 h-4 text-white" />
                </button>
            </div>
            
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
                <button className="notifications-next bg-gray-800/90 hover:bg-gray-700 rounded-full p-2 shadow-lg transition-all duration-200">
                    <ChevronRight className="w-4 h-4 text-white" />
                </button>
            </div>

            {/* Swiper Container */}
            <div className="px-2"> {/* Added padding for nav buttons */}
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={20}
                    slidesPerView={1}
                    navigation={{
                        prevEl: '.notifications-prev',
                        nextEl: '.notifications-next',
                    }}
                    pagination={{
                        el: '.notifications-pagination',
                        clickable: true,
                        dynamicBullets: true,
                    }}
                    loop={notifications.length > 1}
                    className="w-full"
                    style={{ 
                        height: 'auto',
                        overflow: 'visible'
                    }}
                >

                    <style jsx>{`
    .swiper {
        width: 100%;
        height: auto;
    }
    
    .swiper-slide {
        width: 100% !important;
        flex-shrink: 0;
    }
    
    .swiper-wrapper {
        display: flex;
    }
    
    .notifications-pagination .swiper-pagination-bullet {
        background: #6b7280;
        opacity: 0.5;
    }
    
    .notifications-pagination .swiper-pagination-bullet-active {
        background: #3b82f6;
        opacity: 1;
    }
`}</style>


                    {notifications.map(({ _id, senderEmail, receiverEmail, createdAt, type }) => (
                        <SwiperSlide key={_id}>
                            <div className="bg-gray-700/30 hover:bg-gray-700/50 rounded-xl p-4 transition-all border border-gray-600/20 w-full">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <p className="text-white font-medium">{senderEmail.split('@')[0]}</p>
                                        </div>
                                        <p className="text-sm text-gray-300 ml-10">{senderEmail}</p>
                                        <p className="text-sm text-gray-300 ml-10">
                                            {type === 'friend_request' ? 'Sent you a friend request' : 'New Friend Request'}
                                        </p>
                                        <p className="text-xs text-gray-500 ml-10 mt-1">
                                            {new Date(createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleAccept(senderEmail, receiverEmail)}
                                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleDeny(senderEmail)}
                                        className="flex-1 bg-gray-600/50 hover:bg-gray-600/70 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-gray-500/30"
                                    >
                                        Deny
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            
            {/* Pagination dots */}
            {/* <div className="notifications-pagination mt-4 text-center"></div> */}
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