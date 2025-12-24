"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { RootState } from '@/store';
import UserHeader from '@/components/UserHeader';
import { usePlayerPortfolio } from '@/hooks/usePlayerPortfolio';
import { usePlayerGallery } from '@/hooks/usePlayerGallery';
import { usePlayerTrophies } from '@/hooks/usePlayerTrophies';
import { useTrainingLogs } from '@/hooks/useTrainingLogs';
import { updatePlayerVitals, uploadPlayerImage, addPlayerTrophy, addTrainingLog } from '@/store/playerThunk';
import { FiCamera, FiAward, FiActivity, FiEdit, FiShare2, FiStar, FiChevronRight, FiTrendingUp } from 'react-icons/fi';
import { useClientSideLibs } from '@/utils/clientLibs';

/* ---------------------------------
   Status Colors (Premium)
----------------------------------- */
const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Match Ready', color: 'text-green-500', bg: 'bg-green-500/10' },
  injured: { label: 'Recovering', color: 'text-red-500', bg: 'bg-red-500/10' },
  suspended: { label: 'Suspended', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  quit: { label: 'Ex-Player', color: 'text-gray-500', bg: 'bg-gray-500/10' },
};

export default function PlayerPage() {
  const router = useRouter();
  const playerId = router.query.id as string;
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((s: RootState) => s.auth.user);

  // Checking permissions
  const player = usePlayerPortfolio(playerId);
  const isOwner = authUser?.uid === playerId;
  const canEdit = isOwner || authUser?.role === 'correspondent' || authUser?.role === 'admin';

  const gallery = usePlayerGallery(playerId);
  const trophies = usePlayerTrophies(playerId);
  const logs = useTrainingLogs(playerId, 7);

  const [editMode, setEditMode] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({ height: 0, weight: 0, bodyFat: 0, status: 'active' as any, injuryNote: '' });
  const [uploading, setUploading] = useState(false);

  const mounted = useClientSideLibs();

  useEffect(() => {
    if (player) setVitalsForm({ height: player.height, weight: player.weight, bodyFat: player.bodyFat, status: player.status, injuryNote: player.injuryNote });
  }, [player]);

  const saveVitals = () => {
    dispatch(updatePlayerVitals({ playerId, data: vitalsForm }));
    setEditMode(false);
  };

  const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    dispatch(uploadPlayerImage({ playerId, file, caption: 'Action Shot' })).finally(() => setUploading(false));
  };

  const levelProgress = player?.social?.xp !== undefined && player?.social?.nextLevelXp !== undefined && player.social.nextLevelXp > 0 ? (player.social.xp / player.social.nextLevelXp) * 100 : 65;

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest">Scouting Player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      <UserHeader />

      {/* Cinematic Header */}
      <section className="relative h-[70vh] min-h-[600px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={player.avatar || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000'}
            className="w-full h-full object-cover grayscale opacity-40 mix-blend-overlay"
            alt="Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pb-20">
          <div className="flex flex-col md:flex-row items-end gap-10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000" />
              <div className="relative h-64 w-64 rounded-[2.5rem] overflow-hidden border-2 border-white/10">
                <img src={player.avatar} className="w-full h-full object-cover" alt={player.name} />
                {canEdit && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <FiCamera className="w-10 h-10" />
                    <input type="file" className="hidden" onChange={uploadImage} />
                  </label>
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-[#050505]">
                <span className="text-2xl font-black">#{player.kitNumber}</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusConfig[player.status].bg} ${statusConfig[player.status].color} border border-white/5`}>
                  {statusConfig[player.status].label}
                </span>
                <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">PRO Player</span>
              </div>
              <h1 className="text-7xl font-black tracking-tighter leading-none">{player.name}</h1>
              <div className="flex items-center space-x-6 text-xl font-bold text-gray-400">
                <span className="flex items-center"><FiStar className="mr-2 text-blue-500" />{player.position}</span>
                <span className="w-1.5 h-1.5 bg-gray-800 rounded-full" />
                <span>UNILL-PRIME</span>
              </div>

              <div className="flex items-center space-x-4 pt-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 rounded-full bg-gray-800 border-2 border-[#050505]" />)}
                </div>
                <p className="text-sm font-bold text-gray-500"><span className="text-white">{player.social?.followers || '2.4k'}</span> Followers</p>
                <div className="h-6 w-px bg-gray-800" />
                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-black text-sm shadow-xl shadow-blue-500/20 transition-all active:scale-95">Follow</button>
                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"><FiShare2 /></button>
              </div>
            </div>

            <div className="w-full md:w-80 bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10">
              <div className="flex justify-between items-end mb-4">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Level</span>
                <span className="text-4xl font-black text-blue-500">{player.social?.level || '42'}</span>
              </div>
              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${levelProgress}%` }} />
              </div>
              <p className="mt-4 text-[10px] text-gray-500 font-bold uppercase text-right tracking-widest">{player.social?.xp || '1,240'} / {player.social?.nextLevelXp || '2,000'} XP</p>

              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                <div className="text-center">
                  <div className="text-2xl font-black">{player.stats?.gamesPlayed || '12'}</div>
                  <div className="text-[10px] font-black text-gray-500 uppercase">Games</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black">{player.stats?.points || '156'}</div>
                  <div className="text-[10px] font-black text-gray-500 uppercase">Points</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Stats Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Vitals Column */}
          <div className="lg:col-span-1 space-y-10">
            <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px]" />
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black uppercase tracking-tight">Physical Vitals</h3>
                {canEdit && (
                  <button onClick={() => setEditMode(!editMode)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                    <FiEdit className="w-5 h-5 text-blue-400" />
                  </button>
                )}
              </div>

              {editMode ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Height (cm)</label>
                    <input type="number" value={vitalsForm.height} onChange={e => setVitalsForm({ ...vitalsForm, height: +e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Weight (kg)</label>
                    <input type="number" value={vitalsForm.weight} onChange={e => setVitalsForm({ ...vitalsForm, weight: +e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 font-bold" />
                  </div>
                  <button onClick={saveVitals} className="w-full py-4 bg-blue-600 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/20">Sync Vitals</button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-between group/row">
                    <span className="text-sm font-bold text-gray-500">Height</span>
                    <span className="text-2xl font-black border-b-2 border-transparent group-hover/row:border-blue-500 transition-all">{player.height} <span className="text-xs text-gray-500">cm</span></span>
                  </div>
                  <div className="flex items-center justify-between group/row">
                    <span className="text-sm font-bold text-gray-500">Weight</span>
                    <span className="text-2xl font-black border-b-2 border-transparent group-hover/row:border-blue-500 transition-all">{player.weight} <span className="text-xs text-gray-500">kg</span></span>
                  </div>
                  <div className="flex items-center justify-between group/row">
                    <span className="text-sm font-bold text-gray-500">Body Fat</span>
                    <span className="text-2xl font-black border-b-2 border-transparent group-hover/row:border-blue-500 transition-all">{player.bodyFat}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black uppercase tracking-tight">Achievements</h3>
                <FiAward className="text-yellow-500 w-6 h-6" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {player.social?.badges?.map((b: any) => (
                  <div key={b.id} className="aspect-square bg-white/10 rounded-2xl flex items-center justify-center group/badge relative cursor-help" title={b.name}>
                    <span className="text-2xl">{b.icon}</span>
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black p-2 rounded text-[10px] font-black opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap">{b.name}</div>
                  </div>
                ))}
                {(!player.social?.badges || player.social.badges.length === 0) && (
                  [1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-dashed border-white/10" />)
                )}
              </div>
            </div>
          </div>

          {/* Main Stats Column */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white/5 p-12 rounded-[4rem] border border-white/10">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Scout's Analytics</h3>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Season Weighted Performance</p>
                </div>
                <div className="flex items-center space-x-2 text-green-500 font-black text-sm">
                  <FiTrendingUp />
                  <span>+4.2% Growth</span>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5">
                  <div className="text-gray-500 text-[10px] font-black uppercase mb-2">Pace</div>
                  <div className="text-4xl font-black">92</div>
                </div>
                <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5">
                  <div className="text-gray-500 text-[10px] font-black uppercase mb-2">Stamina</div>
                  <div className="text-4xl font-black">88</div>
                </div>
                <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5">
                  <div className="text-gray-500 text-[10px] font-black uppercase mb-2">Skill</div>
                  <div className="text-4xl font-black">74</div>
                </div>
                <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5">
                  <div className="text-gray-500 text-[10px] font-black uppercase mb-2">Impact</div>
                  <div className="text-4xl font-black">81</div>
                </div>
              </div>

              <div className="mt-12 h-64 bg-white/5 rounded-[2.5rem] border border-white/5 flex items-center justify-center">
                <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">Performance Chart Viz Coming Soon</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10">
                <h3 className="text-xl font-black uppercase tracking-tight mb-8">Video Reel</h3>
                <div className="aspect-video bg-black/60 rounded-3xl overflow-hidden relative group">
                  <div className="absolute inset-0 flex items-center justify-center group-hover:bg-blue-600/20 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black uppercase tracking-tight">Recent Logs</h3>
                  <FiActivity className="text-blue-500" />
                </div>
                <div className="space-y-4">
                  {logs.slice(0, 3).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-gray-500">{log.type}</div>
                        <div className="font-bold">{log.duration} MIN SESSION</div>
                      </div>
                      <div className="text-blue-500 font-black">+{log.intensity * 20} XP</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
