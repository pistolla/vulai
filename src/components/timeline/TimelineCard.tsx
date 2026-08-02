import React, { useState, useEffect, useRef } from 'react';
import { TimelineCard as TimelineCardType } from '../../services/timelinePipeline';
import { submitReaction, ReactionType } from '../../services/timelineService';
import { useRouter } from 'next/router';

interface Props {
  card: TimelineCardType;
  isActive: boolean;
  onInteraction?: () => void;
}

export const TimelineCard: React.FC<Props> = ({ card, isActive, onInteraction }) => {
  const router = useRouter();
  const [localReactions, setLocalReactions] = useState(card.reactions);
  const [justReacted, setJustReacted] = useState<ReactionType | null>(null);
  const [showXPPop, setShowXPPop] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Update local reactions when props change (real-time sync)
  useEffect(() => {
    setLocalReactions(card.reactions);
  }, [card.reactions]);

  const handleReaction = async (e: React.MouseEvent, type: ReactionType) => {
    e.stopPropagation();
    if (onInteraction) onInteraction();

    // Optimistic UI update
    setLocalReactions((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + 1,
    }));
    
    // Trigger animations
    setJustReacted(type);
    setShowXPPop(true);
    setTimeout(() => setJustReacted(null), 1000);
    setTimeout(() => setShowXPPop(false), 2000);

    // Fire and forget network request
    await submitReaction(card.id!, type);
  };

  const handleCtaClick = () => {
    if (onInteraction) onInteraction();
    router.push(card.ctaHref);
  };

  const reactionEmojis: Record<ReactionType, string> = {
    fire: '🔥',
    clap: '👏',
    heart: '❤️',
    wow: '😮',
    trophy: '🏆'
  };

  return (
    <div 
      ref={cardRef}
      className={`w-full max-w-lg mx-auto h-full max-h-[800px] rounded-none sm:rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-500 will-change-transform ${
        isActive ? 'opacity-100 scale-100 translate-y-0' : 'opacity-40 scale-95 translate-y-10'
      }`}
      style={{
        background: `linear-gradient(135deg, ${card.gradient[0]}, ${card.gradient[1]})`,
        transform: 'translateZ(0)', // Force GPU layer
        boxShadow: isActive ? `0 20px 40px -10px ${card.gradient[1]}80` : 'none'
      }}
    >
      {/* Background pattern overlay for texture */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* Top Section */}
      <div className="z-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-start justify-between mb-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/30 transform -rotate-6">
            {card.emoji}
          </div>
          <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-black text-white uppercase tracking-widest">{card.type.replace('_', ' ')}</span>
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-white leading-tight mb-2 tracking-tight drop-shadow-md">
          {card.title}
        </h2>
        <h3 className="text-lg font-bold text-white/80 uppercase tracking-widest mb-4">
          {card.subtitle}
        </h3>
      </div>

      {/* Middle/Content Section */}
      <div className="z-10 flex-grow flex flex-col justify-center my-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {card.type === 'leaderboard' && card.metadata?.teams && (
          <div className="space-y-3 mb-6 bg-black/20 p-4 rounded-xl border border-white/10">
             {card.metadata.teams.slice(0,3).map((t: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-white">
                  <span className="font-bold truncate pr-2">{(i+1)}. {t.name}</span>
                  <span className="font-black bg-white/20 px-2 py-0.5 rounded text-sm">{t.wins}W</span>
                </div>
             ))}
          </div>
        )}
        <p className="text-xl text-white/95 font-medium leading-relaxed drop-shadow-sm">
          {card.body}
        </p>
      </div>

      {/* Bottom Section (CTA + Reactions) */}
      <div className="z-10 space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <button 
          onClick={handleCtaClick}
          className="w-full py-4 bg-white text-gray-900 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
        >
          {card.ctaLabel}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>

        {/* Reaction Bar */}
        <div className="flex justify-between items-center pt-4 border-t border-white/20 px-2">
          {(Object.entries(reactionEmojis) as [ReactionType, string][]).map(([type, emoji]) => (
            <button
              key={type}
              onClick={(e) => handleReaction(e, type)}
              className="group relative flex flex-col items-center justify-center transition-transform hover:scale-125 active:scale-90"
            >
              <span className={`text-2xl filter drop-shadow-md transition-all ${justReacted === type ? 'scale-150 -translate-y-2' : ''}`}>
                {emoji}
              </span>
              <span className="text-[10px] font-bold text-white/80 mt-1 tabular-nums group-hover:text-white">
                {localReactions[type] || 0}
              </span>
              {/* Particle burst effect on click */}
              {justReacted === type && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-xl animate-[reaction-burst_0.5s_ease-out_forwards]">
                  {emoji}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Floating XP Notification */}
      {showXPPop && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-[xp-pop_1.5s_ease-out_forwards]">
            <span className="text-2xl">✨</span>
            <span className="text-xl">+{card.xpReward} XP</span>
          </div>
        </div>
      )}
    </div>
  );
};
