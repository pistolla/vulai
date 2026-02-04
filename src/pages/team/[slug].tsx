"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { RootState } from '@/store';
import { toggleFollowPlayer } from '@/store/slices/teamSlice';
import Layout from '@/components/Layout';
import { useTheme } from '@/components/ThemeProvider';
import { ConsoleHero } from '@/components/team/ConsoleHero';
import { PlayerCard } from '@/components/team/PlayerCard';
import { LeaderboardPodium } from '@/components/team/LeaderboardPodium';
import { LiveReactions } from '@/components/team/LiveReactions';
import { FanPoll } from '@/components/team/FanPoll';
import { TeamChat } from '@/components/team/TeamChat';
import { MatchCard } from '@/components/team/MatchCard';

// New Imports
import { useTeamData } from '@/hooks/useTeamData';
import { GameTicker } from '@/components/team/GameTicker';
import { LiveEventPop } from '@/components/team/LiveEventPop';
import { MerchQuickView } from '@/components/merch/MerchQuickView';

export default function TeamPage() {
  const router = useRouter();
  const { slug } = router.query;
  const dispatch = useAppDispatch();
  const { theme: appTheme } = useTheme();

  // Use custom hook for data
  const { teamData, loading, themeColors, upcomingMatches, error } = useTeamData(typeof slug === 'string' ? slug : undefined);

  const { followedPlayers } = useAppSelector((s: RootState) => s.team);
  const { items: merch } = useAppSelector((s: RootState) => s.merch);
  const user = useAppSelector((s: RootState) => s.auth.user);

  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [pollData, setPollData] = useState({
    question: "Who will be MVP this season?",
    options: [
      { id: '1', label: 'Alex Quantum', votes: 245 },
      { id: '2', label: 'Sam Photon', votes: 189 },
      { id: '3', label: 'Jordan Neutron', votes: 156 },
      { id: '4', label: 'Taylor Electron', votes: 98 }
    ]
  });
  const [userVote, setUserVote] = useState<string | undefined>();

  // Merch Quick View State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Mock data for demo (could also move to hook)
  const teamLevel = 42;
  const teamXP = 8750;
  const nextLevelXP = 10000;

  const leaderboardData = teamData?.players?.slice(0, 10).map((p: any, i: number) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    value: Math.floor(Math.random() * 30) + 10,
    trend: i % 3 === 0 ? 'up' : i % 3 === 1 ? 'down' : 'stable'
  })) || [];

  const handleReaction = (emoji: string) => {
    console.log('Reaction:', emoji);
  };

  const handleVote = (optionId: string) => {
    setUserVote(optionId);
    setPollData(prev => ({
      ...prev,
      options: prev.options.map(opt =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    }));
  };

  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: Date.now().toString(),
      user: user?.displayName || user?.email || 'Anonymous',
      text,
      timestamp: Date.now(),
      avatar: user?.photoURL
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleFollow = (playerId: string) => {
    dispatch(toggleFollowPlayer(playerId));
  };

  if (loading) {
    return (
      <Layout title="Team" description="Loading team data...">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-bold">Loading team data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !teamData) {
    return (
      <Layout title="Team Not Found" description="The requested team could not be found">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Team Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The team you're looking for doesn't exist or may have been removed.
            </p>
            <button
              onClick={() => router.push('/teams')}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors"
            >
              Browse All Teams
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={teamData?.name || 'Team'} description="Discover excellence in university athletics">

      {/* Realtime Components */}
      <GameTicker matches={upcomingMatches} />
      <LiveEventPop />

      {/* Merch Modal */}
      <MerchQuickView
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        addToCart={() => console.log('Added to cart', selectedProduct)}
        accentColor={themeColors.accent}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500 pb-20">

        {/* Console Hero */}
        <ConsoleHero
          teamName={teamData?.name || 'Team'}
          teamLevel={teamLevel}
          teamXP={teamXP}
          nextLevelXP={nextLevelXP}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          primaryColor={themeColors.primary}
          accentColor={themeColors.accent}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in fade-in duration-500 slide-in-from-bottom-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Matches Played', value: '24', icon: '⚽' },
                  { label: 'Wins', value: '18', icon: '🏆' },
                  { label: 'Goals Scored', value: '67', icon: '🎯' },
                  { label: 'Clean Sheets', value: '12', icon: '🛡️' }
                ].map(stat => (
                  <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:scale-105 transition-transform hover:shadow-lg">
                    <div className="text-4xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">{stat.value}</div>
                    <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Leaderboard & Social */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <LeaderboardPodium
                    title="Top Scorers"
                    players={leaderboardData}
                    metric="Goals"
                    accentColor={themeColors.accent}
                  />
                </div>

                <div className="space-y-6">
                  <LiveReactions onReaction={handleReaction} accentColor={themeColors.accent} />
                  <FanPoll
                    question={pollData.question}
                    options={pollData.options}
                    onVote={handleVote}
                    userVote={userVote}
                    accentColor={themeColors.accent}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Squad Tab */}
          {activeTab === 'squad' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight text-center mb-8">
                Team Squad
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {teamData?.players?.map((player: any) => (
                  <PlayerCard
                    key={player.id}
                    id={player.id}
                    name={player.name}
                    position={player.position}
                    number={player.number || Math.floor(Math.random() * 99) + 1}
                    avatar={player.avatar}
                    rarity={['bronze', 'silver', 'gold', 'diamond'][Math.floor(Math.random() * 4)] as any}
                    stats={{
                      speed: Math.floor(Math.random() * 30) + 70,
                      power: Math.floor(Math.random() * 30) + 70,
                      technique: Math.floor(Math.random() * 30) + 70,
                      defense: Math.floor(Math.random() * 30) + 70,
                      stamina: Math.floor(Math.random() * 30) + 70,
                      intelligence: Math.floor(Math.random() * 30) + 70
                    }}
                    isFollowed={followedPlayers.includes(player.id)}
                    onFollow={() => handleFollow(player.id)}
                    onClick={() => console.log('Player clicked:', player.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Shop Tab */}
          {activeTab === 'shop' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight text-center">
                Team Store
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {merch.slice(0, 6).map((item: any) => (
                  <div key={item.id} className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:scale-105 transition-transform group cursor-pointer" onClick={() => setSelectedProduct(item)}>
                    <div className="relative overflow-hidden h-48">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-black px-4 py-2 rounded-full font-bold">Quick View</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">KSh {item.price}</span>
                        <button
                          className="px-6 py-3 rounded-2xl font-black uppercase text-sm text-white transition-all hover:scale-105 shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Buy Now');
                          }}
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matches Section (shown on all tabs) */}
          <div className="mt-16 space-y-8">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight text-center">
              Match Center
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingMatches.map((match, index) => (
                <MatchCard
                  key={index}
                  {...match}
                  accentColor={themeColors.accent}
                />
              ))}
            </div>
          </div>

          {/* Team Chat */}
          <div className="mt-16">
            <TeamChat
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              currentUser={user ? { name: user.displayName || user.email || 'User', avatar: user.photoURL } : undefined}
              accentColor={themeColors.accent}
            />
          </div>

          {/* Recruitment Section skipped for brevity, similar refactor if needed */}
        </div>
      </div>
    </Layout>
  );
}