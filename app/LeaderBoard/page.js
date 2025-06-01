"use client"
import React from 'react'
import axios from 'axios'
import { useState, useEffect, useContext } from 'react'
import { UserDataContext } from '@/context/UserContext';
import UserProtectWrapper from '@/components/UserProtectWrapper'
import { useRouter } from 'next/navigation';

const LeaderBoard = () => {
    const { user } = useContext(UserDataContext);
    const [playground, setPlayground] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const router = useRouter();

    const getPlaygrounds = async () => {
        try {
            setLoading(true);
            setError(null);
            if (user && user.email) {
                const response = await axios.get(`/api/createplayground?id=${user.email}`);
                const data = response.data;
                console.log("playground : ", data.lobby);
                setPlayground(data.lobby || []);
            }
        } catch (err) {
            console.error("Error fetching lobby data:", err);
            setError("Failed to fetch playgrounds. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getPlaygrounds();
    }, [user?.email]);

    const handleClick = (id) => {
        router.push(`/LeaderBoard/${id}`);
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
            })
        };
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }

    if (loading) {
        return (
            <UserProtectWrapper>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your playgrounds...</p>
                    </div>
                </div>
            </UserProtectWrapper>
        );
    }

    return (
        <UserProtectWrapper>
            <div className="min-h-screen bg-background py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                            🎮 Your Playgrounds
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Welcome back, {user?.name || user?.email}! Here are your game environments.
                        </p>
                        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-4 rounded-full"></div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                            <div className="flex items-center">
                                <span className="text-red-500 text-xl mr-3">⚠️</span>
                                <div>
                                    <h3 className="text-red-800 font-semibold">Error Loading Playgrounds</h3>
                                    <p className="text-red-600">{error}</p>
                                </div>
                            </div>
                            <button 
                                onClick={getPlaygrounds}
                                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Playgrounds Grid */}
                    {playground.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {playground.map((item, index) => {
                                const formattedDate = formatDate(item.createdAt);
                                return (
                                    <div
                                        key={item._id || index}
                                        className="bg-white backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                                        onClick={() => handleClick(item.id)}
                                    >
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3">
                                                    {(item.id || item._id || 'P').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                                        Playground #{(item.id || item._id || '').substring(0, 8)}
                                                    </h3>
                                                    {item.status && (
                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                                            {item.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-purple-500 group-hover:text-purple-700 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="space-y-3">
                                            <div className="flex items-center text-gray-600">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="text-sm">
                                                    Owner: <span className="font-medium">{item.owner || 'Unknown'}</span>
                                                </span>
                                            </div>

                                            <div className="flex items-center text-gray-600">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <div className="text-sm">
                                                    <div className="font-medium">{formattedDate.date}</div>
                                                    <div className="text-xs text-gray-500">{formattedDate.time}</div>
                                                </div>
                                            </div>

                                            {item.members && (
                                                <div className="flex items-center text-gray-600">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <span className="text-sm">
                                                        {Array.isArray(item.members) ? item.members.length : 0} Players
                                                    </span>
                                                </div>
                                            )}

                                            {item.sessionend && (
                                                <div className="flex items-center text-gray-600">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm">
                                                        Duration: {item.sessionend} min
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer */}
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    Click to view leaderboard
                                                </span>
                                                <div className="flex items-center space-x-1 text-purple-500 group-hover:text-purple-700 transition-colors">
                                                    <span className="text-xs font-medium">View Details</span>
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-12">
                            <div className="text-6xl mb-6">🎮</div>
                            <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Playgrounds Yet</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                You haven't created any playgrounds yet. Create your first playground to start competing with friends!
                            </p>
                            <button 
                                onClick={() => router.push('/Playground')}
                                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-1 shadow-lg"
                            >
                                Create Your First Playground
                            </button>
                        </div>
                    )}

                    {/* Stats Summary */}
                    {playground.length > 0 && (
                        <div className="mt-12 bg-white backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">📊 Your Stats</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                <div>
                                    <h4 className="text-2xl font-bold text-purple-600">{playground.length}</h4>
                                    <p className="text-gray-600">Total Playgrounds</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-blue-600">
                                        {playground.filter(p => p.status === 'active').length}
                                    </h4>
                                    <p className="text-gray-600">Active Games</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-green-600">
                                        {playground.reduce((total, p) => total + (Array.isArray(p.members) ? p.members.length : 0), 0)}
                                    </h4>
                                    <p className="text-gray-600">Total Players</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </UserProtectWrapper>
    );
};

export default LeaderBoard;
