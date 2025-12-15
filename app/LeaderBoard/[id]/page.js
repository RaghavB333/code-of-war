"use client"
import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import UserProtectWrapper from '@/components/UserProtectWrapper'

const LeaderBoard = ({ params }) => {
    const [playground, setPlayground] = useState(null);
    const [loading, setLoading] = useState(true);

    const { id } = React.use(params);

    const getPlayground = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/playground/createplayground?id=${id}`);
            const data = response.data;
            setPlayground(data.lobby);
            console.log("playground : ", data.lobby);
        } catch (err) {
            console.error("Error fetching lobby data:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getPlayground();
    }, [id]);

    // Sort members by totalPoints in descending order
    const sortedMembers = playground?.members 
        ? [...playground.members].sort((a, b) => b.totalPoints - a.totalPoints)
        : [];

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return "🏆";
            case 2: return "🥈";
            case 3: return "🥉";
            default: return "🎯";
        }
    };

    const getRankStyle = (rank) => {
        switch (rank) {
            case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg transform scale-105";
            case 2: return "bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-md";
            case 3: return "bg-gradient-to-r from-orange-300 to-orange-500 text-white shadow-md";
            default: return "bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 hover:from-blue-100 hover:to-blue-200";
        }
    };

    if (loading) {
        return (
            <UserProtectWrapper>
                <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </UserProtectWrapper>
        );
    }

    return (
        <UserProtectWrapper>
            <div className="min-h-screen bg-background py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                            🏆 LeaderBoard
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-4 rounded-full"></div>
                    </div>

                    {/* Leaderboard */}
                    <div className="space-y-4">
                        {sortedMembers.length > 0 ? (
                            sortedMembers.map((member, index) => {
                                const rank = index + 1;
                                return (
                                    <div
                                        key={member._id}
                                        className={`${getRankStyle(rank)} rounded-xl p-6 transition-all duration-300 hover:shadow-xl border border-white/20`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-3xl">
                                                    {getRankIcon(rank)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-3">
                                                        <span className={`text-2xl font-bold ${rank <= 3 ? 'text-white' : 'text-gray-800'}`}>
                                                            #{rank}
                                                        </span>
                                                        <h3 className={`text-xl font-semibold ${rank <= 3 ? 'text-white' : 'text-gray-800'}`}>
                                                            {member.name}
                                                        </h3>
                                                    </div>
                                                    {rank === 1 && (
                                                        <p className="text-yellow-100 text-sm mt-1 font-medium">
                                                            👑 Current Champion
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-3xl font-bold ${rank <= 3 ? 'text-white' : 'text-gray-800'}`}>
                                                    {member.totalPoints}
                                                </div>
                                                <p className={`text-sm ${rank <= 3 ? 'text-white/80' : 'text-gray-600'}`}>
                                                    points
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress bar for visual representation */}
                                        {sortedMembers.length > 1 && (
                                            <div className="mt-4">
                                                <div className={`w-full ${rank <= 3 ? 'bg-white/20' : 'bg-gray-200'} rounded-full h-2`}>
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${
                                                            rank <= 3 ? 'bg-white' : 'bg-gradient-to-r from-purple-500 to-blue-500'
                                                        }`}
                                                        style={{
                                                            width: `${(member.totalPoints / Math.max(...sortedMembers.map(m => m.totalPoints))) * 100}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🎯</div>
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No players yet</h3>
                                <p className="text-gray-500">The leaderboard will update as players join the game.</p>
                            </div>
                        )}
                    </div>

                    {/* Stats Footer */}
                    {sortedMembers.length > 0 && (
                        <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-800">{sortedMembers.length}</h4>
                                    <p className="text-gray-600">Total Players</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-800">
                                        {Math.max(...sortedMembers.map(m => m.totalPoints))}
                                    </h4>
                                    <p className="text-gray-600">Highest Score</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-800">
                                        {Math.round(sortedMembers.reduce((sum, m) => sum + m.totalPoints, 0) / sortedMembers.length)}
                                    </h4>
                                    <p className="text-gray-600">Average Score</p>
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