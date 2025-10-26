import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { apiService, TeamsData } from '../services/apiService';
import { Team, Player } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { University } from '../models';

const TeamsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { universities } = useAppSelector((state) => state.admin);
  const [data, setData] = useState<TeamsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const teamsData = await apiService.getTeamsData();
        setData(teamsData);
        setSelectedTeam(teamsData.teams[0]);
      } catch (error) {
        console.error('Failed to load teams data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Initialize charts
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
    script.onload = () => {
      setTimeout(() => {
        if (data) initTeamCharts();
      }, 1000);
    };
    document.head.appendChild(script);
  }, []);

  const showComingSoon = () => {
    alert('Coming soon! This feature is under development.');
  };

  const handleViewHighlights = (player: Player) => {
    // Navigate to player highlights page
    window.location.href = `/player-highlights/${player.name.toLowerCase().replace(' ', '-')}`;
  };

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setPositionFilter('all');
    setSearchQuery('');
  };

  if (loading || !data || !selectedTeam) {
    return (
      <Layout title="Teams & Players" description="Meet our university sports teams and players. View rosters, player profiles, statistics, and team achievements.">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-unill-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const showPlayerModal = (player: Player) => {
    setSelectedPlayer(player);
  };

  const closePlayerModal = () => {
    setSelectedPlayer(null);
  };

  const filteredPlayers = selectedTeam.players.filter(player => {
    const matchesPosition = positionFilter === 'all' || 
      player.position.toLowerCase().includes(positionFilter.toLowerCase()) ||
      (positionFilter === 'defensive' && (player.position.toLowerCase().includes('linebacker') || player.position.toLowerCase().includes('defensive')));
    
    const matchesSearch = searchQuery === '' || 
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesPosition && matchesSearch;
  });

  // Filter teams based on search query and selected university
  const filteredTeams = data?.teams.filter(team => {
    const matchesSearch = teamSearchQuery === '' ||
      team.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
      team.sport.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
      (team.coach && team.coach.toLowerCase().includes(teamSearchQuery.toLowerCase())) ||
      (team.league && team.league.toLowerCase().includes(teamSearchQuery.toLowerCase()));

    const matchesUniversity = selectedUniversity === 'all' || team.id === selectedUniversity; // Using team.id as universityId for now

    return matchesSearch && matchesUniversity;
  }) || [];

  const initTeamCharts = () => {
    if (typeof window === 'undefined' || !(window as any).echarts) return;

    const echarts = (window as any).echarts;

    // Season Records Chart
    const recordsChart = echarts.init(document.getElementById('season-records-chart'));
    if (recordsChart) {
      const option = {
        title: {
          text: 'Team Performance',
          left: 'center',
          textStyle: { color: '#f59e0b' }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0,0,0,0.8)',
          textStyle: { color: '#fff' }
        },
        legend: {
          data: ['Wins', 'Losses'],
          bottom: 0,
          textStyle: { color: '#fff' }
        },
        xAxis: {
          type: 'category',
          data: ['Eagles', 'Titans', 'Spikers'],
          axisLabel: { color: '#fff' },
          axisLine: { lineStyle: { color: '#fff' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#fff' },
          axisLine: { lineStyle: { color: '#fff' } },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
        },
        series: [
          {
            name: 'Wins',
            type: 'bar',
            data: [8, 15, 12],
            itemStyle: { color: '#10b981' }
          },
          {
            name: 'Losses',
            type: 'bar',
            data: [2, 5, 3],
            itemStyle: { color: '#ef4444' }
          }
        ]
      };
      recordsChart.setOption(option);
    }

    // Player Statistics Chart
    const statsChart = echarts.init(document.getElementById('player-stats-chart'));
    if (statsChart) {
      const option = {
        title: {
          text: 'Team Composition',
          left: 'center',
          textStyle: { color: '#f59e0b' }
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0,0,0,0.8)',
          textStyle: { color: '#fff' }
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: [
              { value: 32, name: 'Football', itemStyle: { color: '#a855f7' } },
              { value: 15, name: 'Basketball', itemStyle: { color: '#f59e0b' } },
              { value: 12, name: 'Volleyball', itemStyle: { color: '#2a9d8f' } }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              color: '#fff'
            }
          }
        ]
      };
      statsChart.setOption(option);
    }
  };

  return (
    <Layout title="Teams & Players" description="Meet our university sports teams and players. View rosters, player profiles, statistics, and team achievements.">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-black/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
            Teams & Players
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Meet our exceptional student-athletes and discover the talented teams representing Unill University across multiple sports disciplines.
          </p>
        </div>
      </section>
      
      {/* Team Selection */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Our Teams
            </h2>
            <p className="text-xl text-gray-300">Select a team to view detailed roster and player information</p>
          </div>
          
          {/* University Filter Buttons */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                className={`px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                  selectedUniversity === 'all' ? 'ring-2 ring-unill-yellow-400' : ''
                }`}
                onClick={() => setSelectedUniversity('all')}
              >
                All Universities
              </button>
              {universities.map((university) => (
                <button
                  key={university.id}
                  className={`px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                    selectedUniversity === university.id ? 'ring-2 ring-unill-yellow-400' : ''
                  }`}
                  onClick={() => setSelectedUniversity(university.id)}
                >
                  {university.name}
                </button>
              ))}
            </div>
          </div>

          {/* Team Search Filter */}
          <div className="mb-8 flex justify-center">
            <div className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Search teams by name, sport, coach, or league..."
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-unill-yellow-400 focus:border-transparent"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {teamSearchQuery && (
                <button
                  onClick={() => setTeamSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Teams Results Count */}
          {teamSearchQuery && (
            <div className="text-center mb-6">
              <p className="text-gray-300">
                Found {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''} matching "{teamSearchQuery}"
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredTeams.map((team) => (
              <div 
                key={team.id}
                className={`team-card bg-white/10 backdrop-blur-md rounded-lg p-8 cursor-pointer border border-white/20 transition-all hover:bg-white/15 hover:transform hover:scale-105 hover:shadow-2xl ${
                  selectedTeam.id === team.id ? 'ring-2 ring-unill-yellow-400' : ''
                }`}
                onClick={() => handleTeamSelect(team)}
              >
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl font-black text-white">{team.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-2">
                    {team.name}
                  </h3>
                  <p className="text-gray-300 mb-4">{team.sport} Team</p>
                  <div className="flex justify-center space-x-4 text-sm">
                    <div className="bg-gradient-to-r from-unill-purple-500/20 to-unill-yellow-500/20 border border-unill-yellow-400/30 px-3 py-1 rounded-full">
                      <span className="font-semibold">{team.record}</span> Record
                    </div>
                    <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-400/30 px-3 py-1 rounded-full">
                      <span className="font-semibold">{team.championships}</span> Championships
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Coach:</span>
                    <span className="font-semibold">{team.coach}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Founded:</span>
                    <span className="font-semibold">{team.founded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Players:</span>
                    <span className="font-semibold">{team.players.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">League:</span>
                    <span className="font-semibold">{team.league}</span>
                  </div>
                  <button
                    onClick={() => window.location.href = `/fan/${team.id}`}
                    className="w-full mt-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-unill-yellow-500 hover:to-unill-purple-600 transition-all"
                  >
                    Fan Page
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Player Roster Section */}
      <section id="team-roster" className="py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              {selectedTeam.name} {selectedTeam.sport} Team Roster
            </h2>
            <p className="text-xl text-gray-300">Meet our talented student-athletes</p>
          </div>
          
          {/* Filter and Search */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Position Filter */}
              <div className="flex flex-wrap gap-3">
                <button 
                  className={`filter-btn active px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                    positionFilter === 'all' ? 'active' : ''
                  }`}
                  onClick={() => setPositionFilter('all')}
                >
                  All Positions
                </button>
                <button 
                  className={`filter-btn px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                    positionFilter === 'quarterback' ? 'active' : ''
                  }`}
                  onClick={() => setPositionFilter('quarterback')}
                >
                  Quarterback
                </button>
                <button 
                  className={`filter-btn px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                    positionFilter === 'running-back' ? 'active' : ''
                  }`}
                  onClick={() => setPositionFilter('running-back')}
                >
                  Running Back
                </button>
                <button 
                  className={`filter-btn px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                    positionFilter === 'wide-receiver' ? 'active' : ''
                  }`}
                  onClick={() => setPositionFilter('wide-receiver')}
                >
                  Wide Receiver
                </button>
                <button 
                  className={`filter-btn px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all ${
                    positionFilter === 'defensive' ? 'active' : ''
                  }`}
                  onClick={() => setPositionFilter('defensive')}
                >
                  Defense
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search players..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-unill-yellow-400 focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Players Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlayers.map((player, index) => (
              <div 
                key={index}
                className="player-card bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 cursor-pointer transition-all hover:bg-white/15 hover:transform hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
                onClick={() => showPlayerModal(player)}
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-black text-white">{player.avatar}</span>
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent mb-1">
                    {player.name}
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">{player.position}</p>
                  <div className="flex justify-center space-x-2 text-xs">
                    <span className="bg-gradient-to-r from-unill-purple-500/20 to-unill-yellow-500/20 border border-unill-yellow-400/30 px-2 py-1 rounded">
                      #{player.number}
                    </span>
                    <span className="bg-gradient-to-r from-unill-purple-500/20 to-unill-yellow-500/20 border border-unill-yellow-400/30 px-2 py-1 rounded">
                      {player.year}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    <div>{player.height} • {player.weight}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Statistics */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Team Performance
            </h2>
            <p className="text-xl text-gray-300">Statistical analysis of our teams' achievements</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                Season Records
              </h3>
              <div id="season-records-chart" style={{ height: '400px' }}></div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                Player Statistics
              </h3>
              <div id="player-stats-chart" style={{ height: '400px' }}></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Recruitment Section */}
      <section className="py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-12 border border-white/20">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Join Our Team
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Interested in becoming part of Unill's athletic legacy? We're always looking for talented student-athletes 
              who share our passion for excellence and sportsmanship.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="font-semibold mb-2">Elite Training</h4>
                <p className="text-sm text-gray-400">Professional coaching and facilities</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-unill-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <h4 className="font-semibold mb-2">Academic Support</h4>
                <p className="text-sm text-gray-400">Balance sports and studies</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h4 className="font-semibold mb-2">Competition</h4>
                <p className="text-sm text-gray-400">Compete at the highest level</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/team-recruitment"
                className="bg-gradient-to-r from-unill-yellow-400 to-unill-purple-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-unill-yellow-500 hover:to-unill-purple-600 transition-all transform hover:scale-105"
              >
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Player Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto border border-white/20">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{selectedPlayer.avatar}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                      {selectedPlayer.name}
                    </h3>
                    <p className="text-gray-300">{selectedPlayer.position}</p>
                  </div>
                </div>
                <button 
                  onClick={closePlayerModal}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-r from-unill-purple-500/20 to-unill-yellow-500/20 border border-unill-yellow-400/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Physical Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Height:</span>
                      <span>{selectedPlayer.height}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weight:</span>
                      <span>{selectedPlayer.weight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Year:</span>
                      <span>{selectedPlayer.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number:</span>
                      <span>#{selectedPlayer.number}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-unill-purple-500/20 to-unill-yellow-500/20 border border-unill-yellow-400/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Games Played:</span>
                      <span>35</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Season Stats:</span>
                      <span>2,450 yds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Awards:</span>
                      <span>2 MVP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Major:</span>
                      <span>Sports Science</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Biography</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {selectedPlayer.name} is a standout {selectedPlayer.position} known for their exceptional skills and dedication to the sport. 
                  With a strong work ethic and natural talent, they have become a key player for the {selectedTeam.name}. 
                  Their commitment to both athletics and academics makes them a true student-athlete role model.
                </p>
              </div>
              
              <div className="flex gap-4">
                <a
                  href="/contact"
                  className="flex-1 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-unill-yellow-500 hover:to-unill-purple-600 transition-all text-center"
                >
                  Contact Player
                </a>
                <button
                  onClick={() => handleViewHighlights(selectedPlayer)}
                  className="flex-1 border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all"
                >
                  View Highlights
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .filter-btn.active {
          background: linear-gradient(135deg, #a855f7, #f59e0b);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
        }
        
        .player-card:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </Layout>
  );
};

export default TeamsPage;
