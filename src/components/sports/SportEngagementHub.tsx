import React, { useEffect, useMemo, useState } from 'react';
import { FiTrendingUp, FiAward, FiBookOpen, FiBarChart2 } from 'react-icons/fi';
import { Fixture, League, Participant } from '@/models';
import { getSportTheme } from '@/utils/sportThemes';
import { db } from '@/services/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface SportEngagementHubProps {
  sportId: string;
  leagues: League[];
}

interface UniversityRanking {
  name: string;
  id: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  efficiency: number; // Goals per game or similar
}

export const SportEngagementHub: React.FC<SportEngagementHubProps> = ({ sportId, leagues }) => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [primaryRankIndex, setPrimaryRankIndex] = useState(0);
  const [secondaryRankIndex, setSecondaryRankIndex] = useState<number | null>(null);
  const theme = getSportTheme(sportId);

  useEffect(() => {
    const loadSportData = async () => {
      setLoading(true);
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const lbSnap = await getDoc(doc(db, 'leaderboards', sportId.toLowerCase()));
        
        if (lbSnap.exists()) {
          setLeaderboard(lbSnap.data());
        }

        const snap = await getDocs(collection(db, 'fixtures'));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fixture));
        const filtered = data.filter(f => f.sport?.toLowerCase() === sportId.toLowerCase() && f.status === 'completed');
        setFixtures(filtered);
      } catch (error) {
        console.error('Failed to load sport engagement data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSportData();
  }, [sportId]);

  const rankings = useMemo(() => {
    if (leaderboard?.rankings) return leaderboard.rankings;
    const uniMap: Record<string, UniversityRanking> = {};
    fixtures.forEach(fixture => {
      if (!fixture.participants) return;
      fixture.participants.forEach((p, idx) => {
        if (!p.refId) return;
        if (!uniMap[p.refId]) {
          uniMap[p.refId] = {
            name: p.name || 'Unknown University',
            id: p.refId,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            efficiency: 0
          };
        }
        const stats = uniMap[p.refId];
        const scores = fixture.participants.map(part => part.score || 0);
        const myScore = p.score || 0;
        const otherScores = scores.filter((_, i) => i !== idx);
        const maxOther = Math.max(...otherScores);

        if (myScore > maxOther) { stats.wins += 1; stats.points += 3; }
        else if (myScore < maxOther) { stats.losses += 1; }
        else { stats.draws += 1; stats.points += 1; }
        stats.efficiency = (stats.points / (stats.wins + stats.losses + stats.draws)) * 10;
      });
    });
    return Object.values(uniMap).sort((a, b) => b.points - a.points || b.efficiency - a.efficiency).slice(0, 5);
  }, [fixtures, leaderboard]);

  const latestStory = useMemo(() => {
    return fixtures
      .filter(f => f.blogContent)
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())[0];
  }, [fixtures]);

  useEffect(() => {
    if (typeof window === 'undefined' || loading || rankings.length < 1) return;

    const initRadar = () => {
      const echarts = (window as any).echarts;
      if (!echarts) return;

      const chartDom = document.getElementById('sport-radar-chart');
      if (!chartDom) return;

      const myChart = echarts.init(chartDom, 'dark');
      
      const seriesData = [
        {
          value: rankings[primaryRankIndex]?.tacticalStats || [85, 70, 90, 60, 95],
          name: rankings[primaryRankIndex]?.name,
          itemStyle: { color: theme.color },
          areaStyle: { color: `${theme.color}33` },
          lineStyle: { width: 3 }
        }
      ];

      if (secondaryRankIndex !== null && rankings[secondaryRankIndex]) {
        seriesData.push({
          value: rankings[secondaryRankIndex]?.tacticalStats || [75, 80, 70, 85, 80],
          name: rankings[secondaryRankIndex]?.name,
          itemStyle: { color: '#814bf6' },
          areaStyle: { color: 'rgba(129, 75, 246, 0.2)' },
          lineStyle: { width: 3, type: 'dashed' } as any
        });
      }

      const option = {
        backgroundColor: 'transparent',
        radar: {
          indicator: [
            { name: 'ATTACK', max: 100 },
            { name: 'CONTROL', max: 100 },
            { name: 'DISCIPLINE', max: 100 },
            { name: 'MOMENTUM', max: 100 },
            { name: 'EFFICIENCY', max: 100 }
          ],
          shape: 'polygon',
          splitNumber: 5,
          axisName: { color: '#94a3b8', fontWeight: '800', fontSize: 10 },
          splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
          splitArea: { show: false },
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
        },
        series: [{
          type: 'radar',
          data: seriesData,
          symbol: 'none'
        }]
      };
      myChart.setOption(option);
    };

    const timer = setTimeout(initRadar, 300);
    return () => clearTimeout(timer);
  }, [loading, rankings, theme.color, primaryRankIndex, secondaryRankIndex]);

  if (loading) {
    return (
      <div className="py-20 text-center animate-pulse">
        <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Synchronizing Sport Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sport-Wide Leaderboard */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <FiAward className="text-unill-yellow-400" /> Power Rankings
              </h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Cross-League Efficiency Index</p>
            </div>
          </div>

          <div className="space-y-3">
            {rankings.map((rk: any, idx: number) => (
              <div 
                key={rk.id} 
                onClick={() => {
                  setPrimaryRankIndex(idx);
                  if (secondaryRankIndex === idx) setSecondaryRankIndex(null);
                }}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all group cursor-pointer ${
                  (idx === primaryRankIndex) 
                  ? 'bg-white/10 border border-white/20 shadow-xl scale-[1.02]' 
                  : (idx === secondaryRankIndex)
                  ? 'bg-unill-purple-600/10 border border-unill-purple-600/30'
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className={`text-xl font-black w-8 text-center ${idx === 0 ? 'text-unill-yellow-400' : 'text-gray-600'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-black text-white uppercase tracking-tight group-hover:text-unill-yellow-400 transition-colors">
                    {rk.name}
                  </div>
                  {rk.teamName && (
                    <a 
                      href={`/team/${rk.teamSlug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-unill-yellow-400/80 font-bold uppercase tracking-widest hover:text-unill-yellow-400 transition-colors block mt-0.5"
                    >
                      {rk.teamName}
                    </a>
                  )}
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex gap-4 mt-1 opacity-60">
                    <span>{rk.wins}W - {rk.losses}L</span>
                    <span className="text-white/30">{rk.points} PTS</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-white tabular-nums">{rk.efficiency.toFixed(1)}</div>
                  <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">EFFICIENCY</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Radar Chart */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">
          <div className="w-full mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <FiBarChart2 className="text-unill-purple-400" /> Tactical Profile
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Focus: <span className="text-white">{rankings[primaryRankIndex]?.name}</span> {secondaryRankIndex !== null && <>vs <span className="text-unill-purple-400">{rankings[secondaryRankIndex]?.name}</span></>}
                </p>
              </div>

              {/* Subtle Dropdown */}
              <select 
                value={secondaryRankIndex === null ? '' : secondaryRankIndex}
                onChange={(e) => setSecondaryRankIndex(e.target.value === '' ? null : Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-unill-purple-400 cursor-pointer appearance-none"
              >
                <option value="">+ Comparison</option>
                {rankings.map((rk: any, idx: number) => (
                  idx !== primaryRankIndex && (
                    <option key={rk.id} value={idx}>{rk.name}</option>
                  )
                ))}
              </select>
            </div>
          </div>
          
          <div id="sport-radar-chart" className="w-full h-[350px]"></div>

          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: theme.color }}></div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{rankings[primaryRankIndex]?.name || 'Seed 1'}</span>
            </div>
            {secondaryRankIndex !== null && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <div className="w-3 h-3 rounded-sm bg-unill-purple-600"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{rankings[secondaryRankIndex]?.name || 'Seed 2'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match Narrative Section */}
      {latestStory && (
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-[1.6] transition-transform duration-1000">
            <FiBookOpen size={200} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-unill-yellow-400/20 flex items-center justify-center">
                <FiBookOpen className="text-unill-yellow-400" />
              </div>
              <h3 className="text-sm font-black text-unill-yellow-400 uppercase tracking-[0.3em]">Latest Match Narrative</h3>
            </div>

            <h2 className="text-4xl font-black text-white mb-8 tracking-tighter max-w-3xl leading-none">
              The Evolution of {sportId}: Data meets Destiny.
            </h2>

            <div 
              className="prose prose-invert max-w-none story-content text-gray-400 leading-relaxed text-lg"
              dangerouslySetInnerHTML={{ __html: latestStory.blogContent || '' }}
            />

            <div className="mt-12 flex items-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-widest border-t border-white/5 pt-8">
              <span>Published {new Date(latestStory.scheduledAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Observed by VULAI Analytics</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
