import React, { useState } from 'react';

interface LiveReactionsProps {
    onReaction: (emoji: string) => void;
    accentColor: string;
}

const reactions = [
    { emoji: '🔥', label: 'Fire', color: '#ef4444' },
    { emoji: '⚡', label: 'Lightning', color: '#eab308' },
    { emoji: '💪', label: 'Strong', color: '#3b82f6' },
    { emoji: '🎯', label: 'Target', color: '#10b981' },
    { emoji: '👏', label: 'Clap', color: '#8b5cf6' },
    { emoji: '❤️', label: 'Love', color: '#ec4899' }
];

export const LiveReactions: React.FC<LiveReactionsProps> = ({ onReaction, accentColor }) => {
    const [activeReaction, setActiveReaction] = useState<string | null>(null);
    const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: number; emoji: string; x: number }>>([]);

    const handleReaction = (emoji: string) => {
        setActiveReaction(emoji);
        onReaction(emoji);

        // Create floating emoji
        const id = Date.now();
        const x = Math.random() * 80 + 10; // Random position 10-90%
        setFloatingEmojis(prev => [...prev, { id, emoji, x }]);

        // Remove after animation
        setTimeout(() => {
            setFloatingEmojis(prev => prev.filter(e => e.id !== id));
        }, 2000);

        // Reset active state
        setTimeout(() => setActiveReaction(null), 300);
    };

    return (
        <div className="relative">
            {/* Floating Emojis */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {floatingEmojis.map(({ id, emoji, x }) => (
                    <div
                        key={id}
                        className="absolute bottom-0 text-4xl animate-float-up"
                        style={{ left: `${x}%` }}
                    >
                        {emoji}
                    </div>
                ))}
            </div>

            {/* Reaction Buttons */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 border-2" style={{ borderColor: accentColor }}>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4 flex items-center">
                    <span className="mr-2">🎉</span> Live Reactions
                </h3>

                <div className="grid grid-cols-3 gap-3">
                    {reactions.map(({ emoji, label, color }) => (
                        <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className={`group relative p-4 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 border-2 transition-all duration-300 ${activeReaction === emoji ? 'scale-110 border-white' : 'border-gray-700'
                                }`}
                            style={{
                                boxShadow: activeReaction === emoji ? `0 0 30px ${color}80` : 'none'
                            }}
                        >
                            <div className="text-3xl mb-1 group-hover:scale-125 transition-transform">{emoji}</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</div>

                            {/* Ripple Effect */}
                            {activeReaction === emoji && (
                                <div
                                    className="absolute inset-0 rounded-2xl animate-ping"
                                    style={{ background: `${color}40` }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                <style jsx>{`
          @keyframes float-up {
            0% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
            100% {
              transform: translateY(-200px) scale(1.5);
              opacity: 0;
            }
          }
          .animate-float-up {
            animation: float-up 2s ease-out forwards;
          }
        `}</style>
            </div>
        </div>
    );
};
