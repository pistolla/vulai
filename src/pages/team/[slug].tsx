"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { RootState } from '@/store';
import { setTheme, toggleFollowPlayer } from '@/store/slices/teamSlice';
import { fetchMerch } from '@/store/adminThunk';
import { apiService } from '@/services/apiService';
import Layout from '@/components/Layout';
import { useTheme } from '@/components/ThemeProvider';
import { ConsoleHero } from '@/components/team/ConsoleHero';
import { PlayerCard } from '@/components/team/PlayerCard';
import { LeaderboardPodium } from '@/components/team/LeaderboardPodium';
import { LiveReactions } from '@/components/team/LiveReactions';
import { FanPoll } from '@/components/team/FanPoll';
import { TeamChat } from '@/components/team/TeamChat';
import { MatchCard } from '@/components/team/MatchCard';

const themes: Record<string, { primary: string; secondary: string; accent: string }> = {
  quantum: { primary: '#6a11cb', secondary: '#2575fc', accent: '#00d4ff' },
  crimson: { primary: '#990000', secondary: '#ffffff', accent: '#13294b' },
  blue: { primary: '#003366', secondary: '#ffffff', accent: '#990000' },
  cardinal: { primary: '#8C1515', secondary: '#ffffff', accent: '#4D4D4D' },
  gold: { primary: '#FFB81C', secondary: '#000000', accent: '#00539B' },
  neon: { primary: '#ff416c', secondary: '#ff4b2b', accent: '#ffcc00' },
  cyber: { primary: '#11998e', secondary: '#38ef7d', accent: '#00ffcc' },
};

export default function TeamPage() {
  const router = useRouter();
  const { slug } = router.query;
  const dispatch = useAppDispatch();
  const { theme: appTheme, mounted: themeMounted } = useTheme();
  const { theme: teamTheme, followedPlayers } = useAppSelector((s: RootState) => s.team);
  const { items: merch, loading: merchLoading } = useAppSelector((s: RootState) => s.merch);
  const user = useAppSelector((s: RootState) => s.auth.user);

  const [teamData, setTeamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  // Load team data
  useEffect(() => {
    if (!slug || !router.isReady) return;

    const loadTeamData = async () => {
      try {
        const teamsData = await apiService.getTeamsData();
        const team = teamsData.teams.find((t: any) => t.id === slug);
        if (team) {
          setTeamData(team);
        }
      } catch (error) {
        console.error('Failed to load team data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
    dispatch(fetchMerch());
  }, [slug, router.isReady, dispatch]);

  // Get theme colors
  const themeColors = themes[teamData?.theme || teamTheme] || themes.blue;

  // Mock data for demo
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

  const upcomingMatches = [
    {
      homeTeam: teamData?.name || 'Team',
      awayTeam: 'Nexus United',
      status: 'live' as const,
      date: 'Today, 7:00 PM',
      venue: 'University Stadium',
      homeScore: 2,
      awayScore: 1,
      isLive: true
    },
    {
      homeTeam: 'Cyber City',
      awayTeam: teamData?.name || 'Team',
      status: 'upcoming' as const,
      date: 'Tomorrow, 3:00 PM',
      venue: 'Tech Arena'
    },
    {
      homeTeam: teamData?.name || 'Team',
      awayTeam: 'Phoenix FC',
      status: 'completed' as const,
      date: 'Yesterday',
      venue: 'Home Ground',
      homeScore: 3,
      awayScore: 2
    }
  ];

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

  return (
    <Layout title={teamData?.name || 'Team'} description="Discover excellence in university athletics">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">

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
            <div className="space-y-12">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Matches Played', value: '24', icon: '⚽' },
                  { label: 'Wins', value: '18', icon: '🏆' },
                  { label: 'Goals Scored', value: '67', icon: '🎯' },
                  { label: 'Clean Sheets', value: '12', icon: '🛡️' }
                ].map(stat => (
                  <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:scale-105 transition-transform">
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
            <div className="space-y-12">
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

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Achievements Coming Soon</h2>
              <p className="text-gray-600 dark:text-gray-400">Trophy cabinet and achievement system in development</p>
            </div>
          )}

          {/* Shop Tab */}
          {activeTab === 'shop' && (
            <div className="space-y-8">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight text-center">
                Team Store
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {merch.slice(0, 6).map((item: any) => (
                  <div key={item.id} className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:scale-105 transition-transform">
                    <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                    <div className="p-6">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-black text-gray-900 dark:text-white">KSh {item.price}</span>
                        <button
                          className="px-6 py-3 rounded-2xl font-black uppercase text-sm text-white transition-all hover:scale-105"
                          style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})` }}
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
        </div>
      </div>
    </Layout>
  );
}