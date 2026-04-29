import React, { useEffect, useRef } from 'react';
import { FiTrendingUp, FiAward, FiUsers, FiShoppingBag, FiBarChart2 } from 'react-icons/fi';

interface ConsoleHeroProps {
    teamName: string;
    teamLevel: number;
    teamXP: number;
    nextLevelXP: number;
    activeTab: string;
    onTabChange: (tab: string) => void;
    primaryColor: string;
    accentColor: string;
    sport: string;
    teamLogo?: string;
}

export const ConsoleHero: React.FC<ConsoleHeroProps> = ({
    teamName,
    teamLevel,
    teamXP,
    nextLevelXP,
    activeTab,
    onTabChange,
    primaryColor,
    accentColor,
    sport,
    teamLogo
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Particle system
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = 600;

        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            opacity: number;
        }> = [];

        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        let animationId: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `${accentColor}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`;
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => cancelAnimationFrame(animationId);
    }, [accentColor]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiTrendingUp },
        { id: 'squad', label: 'Squad', icon: FiUsers },
        { id: 'fan-zone', label: 'Fan Zone', icon: FiAward },
        { id: 'stats', label: 'Stats', icon: FiBarChart2 },
        { id: 'shop', label: 'Shop', icon: FiShoppingBag }
    ];

    const xpPercentage = (teamXP / nextLevelXP) * 100;

    // Sport-specific Background Patterns
    const getSportBackground = () => {
        const lowerSport = sport?.toLowerCase() || '';
        if (lowerSport.includes('football')) return 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 80%), url("https://www.transparenttextures.com/patterns/pinstriped-suit.png")';
        if (lowerSport.includes('basketball')) return 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%), url("https://www.transparenttextures.com/patterns/diagmonds-light.png")';
        if (lowerSport.includes('volleyball')) return 'url("https://www.transparenttextures.com/patterns/netted-white.png")';
        return 'url("https://www.transparenttextures.com/patterns/cubes.png")';
    };

    return (
        <div className="relative h-[600px] overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-500">
            {/* Particle Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
            />

            {/* Sport Background Pattern */}
            <div 
                className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                style={{ 
                    backgroundImage: getSportBackground(),
                    backgroundSize: '200px 200px'
                }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/40 dark:from-black/80 dark:via-transparent dark:to-black/40" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-between p-8 max-w-7xl mx-auto">
                {/* Top Section - Team Name & Level */}
                <div className="text-center mt-20">
                    <div className="inline-block mb-2">
                        <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                            Professional {sport} Team
                        </span>
                    </div>
                    <h1
                        className="text-7xl font-black uppercase tracking-wider mb-4"
                        style={{
                            background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: `0 0 40px ${accentColor}40`
                        }}
                    >
                        {teamName}
                    </h1>

                    {/* Team Level Badge with Logo */}
                    <div className="inline-flex items-center space-x-3 bg-white/80 dark:bg-black/50 backdrop-blur-xl border-2 px-6 py-3 rounded-full" style={{ borderColor: accentColor }}>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white overflow-hidden shadow-lg" style={{ border: `2px solid ${accentColor}` }}>
                            {teamLogo ? (
                                <img src={teamLogo} alt={teamName} className="w-full h-full object-contain p-1" />
                            ) : (
                                <span className="font-black text-2xl" style={{ color: primaryColor }}>{teamName.substring(0, 2).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Team Level</div>
                            <div className="text-sm font-black text-gray-900 dark:text-white">{teamXP} / {nextLevelXP} XP</div>
                        </div>
                    </div>


                    {/* XP Progress Bar */}
                    <div className="mt-4 max-w-md mx-auto">
                        <div className="h-2 bg-gray-300 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-400 dark:border-gray-700">
                            <div
                                className="h-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${xpPercentage}%`,
                                    background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Console Navigation */}
                <div className="flex justify-start md:justify-center overflow-x-auto space-x-2 px-4 pb-4 w-full no-scrollbar">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`group relative px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm transition-all duration-300 ${isActive
                                    ? 'text-white scale-105'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:scale-105'
                                    }`}
                                style={{
                                    background: isActive
                                        ? `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
                                        : 'rgba(255,255,255,0.8)',
                                    backdropFilter: 'blur(10px)',
                                    border: isActive ? `2px solid ${accentColor}` : '2px solid rgba(0,0,0,0.1)',
                                    boxShadow: isActive ? `0 0 30px ${accentColor}40` : 'none'
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    <Icon className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                </div>

                                {/* Active Indicator */}
                                {isActive && (
                                    <div
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full"
                                        style={{ background: accentColor }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
