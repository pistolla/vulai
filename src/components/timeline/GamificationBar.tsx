import React, { useEffect, useState } from 'react';
import { subscribeToFanProfile, FanProfile } from '../../services/timelineService';

export const GamificationBar: React.FC = () => {
  const [profile, setProfile] = useState<FanProfile | null>(null);
  const [prevXp, setPrevXp] = useState(0);
  const [justLeveled, setJustLeveled] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToFanProfile((data) => {
      if (data) {
        if (data.xp > prevXp && prevXp !== 0) {
           // Animation hook could go here if needed
        }
        setPrevXp(data.xp);
        setProfile(data);
      }
    });
    return () => unsubscribe();
  }, [prevXp]);

  if (!profile) return null; // Or a skeleton

  const levelProgress = (profile.xp % 100); // Assume 100 XP per level for demo
  const progressDeg = (levelProgress / 100) * 360;

  return (
    <div className="w-full bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-16 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Level & XP Gauge */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-black/50 border border-white/5">
             <div className="absolute inset-0 rounded-full border-2 border-white/10" />
             {/* Simple conic gradient for progress */}
             <div className="absolute inset-0 rounded-full" 
                  style={{ 
                    background: `conic-gradient(#a855f7 ${progressDeg}deg, transparent 0)`,
                    WebkitMaskImage: 'radial-gradient(transparent 55%, black 60%)' 
                  }} 
             />
             <span className="font-black text-sm text-white z-10">{profile.level}</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">Fan Level</p>
            <p className="text-sm font-bold text-white leading-none">
               <span className="text-unill-purple-400">{profile.xp}</span> <span className="text-white/40">XP</span>
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
           <span className={`text-xl filter drop-shadow-md ${profile.dailyStreak > 0 ? 'animate-pulse' : 'grayscale opacity-50'}`}>🔥</span>
           <div>
             <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">Daily Streak</p>
             <p className="text-sm font-black text-white leading-none tabular-nums">
                {profile.dailyStreak} <span className="text-white/40 font-bold">Days</span>
             </p>
           </div>
        </div>

      </div>
    </div>
  );
};
