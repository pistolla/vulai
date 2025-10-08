import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { sportsData } from '../data/sports';
import { Sport } from '../types';

const SportsPage: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<Sport>(sportsData[0]);

  useEffect(() => {
    // Initialize charts when page loads
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
    script.onload = () => {
      setTimeout(() => {
        initCharts();
      }, 1000);
    };
    document.head.appendChild(script);
  }, []);

  const initCharts = () => {
    if (typeof window === 'undefined' || !(window as any).echarts) return;

    const echarts = (window as any).echarts;

    // Team performance chart
    const performanceChart = echarts.init(document.getElementById('performance-chart'));
    if (performanceChart) {
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
          data: sportsData.map(sport => sport.name),
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
            data: sportsData.map(sport => sport.stats.wins),
            itemStyle: { color: '#10b981' }
          },
          {
            name: 'Losses',
            type: 'bar',
            data: sportsData.map(sport => sport.stats.losses),
            itemStyle: { color: '#ef4444' }
          }
        ]
      };
      performanceChart.setOption(option);
    }

    // Championships chart
    const championshipsChart = echarts.init(document.getElementById('championships-chart'));
    if (championshipsChart) {
      const option = {
        title: {
          text: 'Championship Distribution',
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
            data: sportsData.map(sport => ({
              value: sport.stats.championships,
              name: sport.name,
              itemStyle: { 
                color: sport.id === 'football' ? '#a855f7' : 
                       sport.id === 'basketball' ? '#f59e0b' : 
                       sport.id === 'volleyball' ? '#2a9d8f' : '#e76f51'
              }
            })),
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
      championshipsChart.setOption(option);
    }
  };

  const showComingSoon = () => {
    alert('Coming soon! This feature is under development.');
  };

  const handleSportSelect = (sport: Sport) => {
    setSelectedSport(sport);
  };

  return (
    <Layout title="Sports Programs" description="Explore comprehensive university sports programs including Football, Basketball, Volleyball, Rugby, Hockey, Badminton, Table Tennis, Chess, Athletics and more">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-black/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
            Sports Programs
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover comprehensive information about our diverse university sports programs, from team dynamics to individual excellence.
          </p>
        </div>
      </section>
      
      {/* Sport Selection */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent text-center">
              Choose Your Sport
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {sportsData.map((sport) => (
                <button 
                  key={sport.id}
                  className={`sport-selector bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-center hover:bg-white/20 transition-all ${
                    selectedSport.id === sport.id ? 'ring-2 ring-unill-yellow-400' : ''
                  }`}
                  onClick={() => handleSportSelect(sport)}
                >
                  <div className="text-2xl mb-2">
                    {sport.id === 'football' && '🏈'}
                    {sport.id === 'basketball' && '🏀'}
                    {sport.id === 'volleyball' && '🏐'}
                    {sport.id === 'rugby' && '🏉'}
                    {sport.id === 'hockey' && '🏑'}
                    {sport.id === 'badminton' && '🏸'}
                    {sport.id === 'table-tennis' && '🎱'}
                    {sport.id === 'chess' && '♟️'}
                    {sport.id === 'athletics' && '🏃'}
                    {sport.id === 'swimming' && '🏊'}
                    {sport.id === 'tennis' && '🎾'}
                    {sport.id === 'cricket' && '🏏'}
                  </div>
                  <div className="text-sm font-semibold">{sport.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Sport Details */}
      <section id="sport-details" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <img 
                src={selectedSport.image} 
                alt={selectedSport.name} 
                className="w-full h-96 object-cover rounded-lg shadow-2xl"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-black bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                {selectedSport.name}
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                {selectedSport.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                  <h4 className="font-semibold mb-2">Team Size</h4>
                  <p className="text-3xl font-bold bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                    {selectedSport.players}
                  </p>
                  <p className="text-sm text-gray-400">Players per team</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                  <h4 className="font-semibold mb-2">Season</h4>
                  <p className="text-3xl font-bold bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                    {selectedSport.season}
                  </p>
                  <p className="text-sm text-gray-400">Active period</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <h4 className="font-semibold mb-4">Key Positions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSport.positions.map((position) => (
                    <span 
                      key={position}
                      className="bg-gradient-to-r from-unill-purple-500/20 to-unill-yellow-500/20 border border-unill-yellow-400/30 px-3 py-1 rounded-full text-sm"
                    >
                      {position}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Equipment and Rules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                Required Equipment
              </h3>
              <div className="space-y-4">
                {selectedSport.id === 'football' && (
                  <>
                    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-xl">⚽</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Soccer Ball</h4>
                        <p className="text-sm text-gray-400">Official size 5 ball</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-unill-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-xl">🦵</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Shin Guards</h4>
                        <p className="text-sm text-gray-400">Protective shin guards</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-xl">👟</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Cleats</h4>
                        <p className="text-sm text-gray-400">Soccer-specific footwear</p>
                      </div>
                    </div>
                  </>
                )}
                {selectedSport.id === 'basketball' && (
                  <>
                    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-xl">🏀</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Basketball</h4>
                        <p className="text-sm text-gray-400">Official size and weight</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-xl">👟</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Basketball Shoes</h4>
                        <p className="text-sm text-gray-400">High-top athletic shoes</p>
                      </div>
                    </div>
                  </>
                )}
                {/* Add more equipment for other sports as needed */}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                Basic Rules
              </h3>
              <div className="space-y-4">
                <div className="border-l-3 border-unill-yellow-400 pl-4 mb-4">
                  <h4 className="font-semibold mb-2">Objective</h4>
                  <p className="text-gray-300">
                    {selectedSport.id === 'football' && 'Score goals by getting the ball into the opponent\'s net while preventing them from scoring.'}
                    {selectedSport.id === 'basketball' && 'Score points by shooting the ball through the opponent\'s hoop while preventing them from scoring.'}
                    {selectedSport.id === 'volleyball' && 'Score points by grounding the ball on the opponent\'s court while preventing them from doing the same.'}
                  </p>
                </div>
                <div className="border-l-3 border-unill-yellow-400 pl-4 mb-4">
                  <h4 className="font-semibold mb-2">Game Duration</h4>
                  <p className="text-gray-300">
                    {selectedSport.id === 'football' && 'Two 45-minute halves with a 15-minute halftime break.'}
                    {selectedSport.id === 'basketball' && 'Four 10-minute quarters with breaks between quarters and halftime.'}
                    {selectedSport.id === 'volleyball' && 'Best of 5 sets, first to 25 points (win by 2), fifth set to 15 points.'}
                  </p>
                </div>
                <div className="border-l-3 border-unill-yellow-400 pl-4 mb-4">
                  <h4 className="font-semibold mb-2">Scoring</h4>
                  <p className="text-gray-300">
                    {selectedSport.id === 'football' && 'Goal (1 point).'}
                    {selectedSport.id === 'basketball' && 'Field goal (2 or 3 points), free throw (1 point).'}
                    {selectedSport.id === 'volleyball' && 'Rally scoring - every serve results in a point for one team.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Training Schedule */}
          <div className="mt-16">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                Training Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <h4 className="font-semibold mb-2">Monday</h4>
                  <p className="text-sm text-gray-300">Strength Training</p>
                  <p className="text-xs text-gray-400">6:00 AM - 8:00 AM</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <h4 className="font-semibold mb-2">Tuesday</h4>
                  <p className="text-sm text-gray-300">Practice Session</p>
                  <p className="text-xs text-gray-400">4:00 PM - 7:00 PM</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <h4 className="font-semibold mb-2">Wednesday</h4>
                  <p className="text-sm text-gray-300">Film Study</p>
                  <p className="text-xs text-gray-400">7:00 PM - 9:00 PM</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <h4 className="font-semibold mb-2">Thursday</h4>
                  <p className="text-sm text-gray-300">Scrimmage</p>
                  <p className="text-xs text-gray-400">4:00 PM - 7:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Performance Statistics */}
      <section className="py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              University Sports Performance
            </h2>
            <p className="text-xl text-gray-300">Track our athletic achievements across all sports programs</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                Team Performance Overview
              </h3>
              <div id="performance-chart" style={{ height: '400px' }}></div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
                Championship Distribution
              </h3>
              <div id="championships-chart" style={{ height: '400px' }}></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Getting Started */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-12 border border-white/20">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-unill-yellow-400 to-unill-purple-400 bg-clip-text text-transparent">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join our university sports programs and take your athletic journey to the next level. 
              We provide expert coaching, state-of-the-art facilities, and a supportive team environment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-unill-yellow-400 to-unill-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h4 className="font-semibold mb-2">Register</h4>
                <p className="text-sm text-gray-400">Sign up for tryouts and registration</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-unill-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏃</span>
                </div>
                <h4 className="font-semibold mb-2">Try Out</h4>
                <p className="text-sm text-gray-400">Showcase your skills and abilities</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h4 className="font-semibold mb-2">Compete</h4>
                <p className="text-sm text-gray-400">Join the team and compete at university level</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={showComingSoon}
                className="bg-gradient-to-r from-unill-yellow-400 to-unill-purple-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-unill-yellow-500 hover:to-unill-purple-600 transition-all transform hover:scale-105"
              >
                Register for Tryouts
              </button>
              <a href="/teams" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all transform hover:scale-105">
                View Team Rosters
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SportsPage;
