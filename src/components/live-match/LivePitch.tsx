import React, { useRef, useEffect } from 'react';

interface TelemetryData {
    ball: { x: number; y: number };
    players: Array<{ id: string; x: number; y: number; team: 'home' | 'away' }>;
}

interface LivePitchProps {
    telemetry: TelemetryData | null;
    homeTeam: string;
    awayTeam: string;
}

export const LivePitch = ({ telemetry, homeTeam, awayTeam }: LivePitchProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !telemetry) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw ball with a glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(telemetry.ball.x, telemetry.ball.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw players
        telemetry.players.forEach(player => {
            const isHome = player.team === 'home';

            // Player Shadow/Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = isHome ? 'rgba(59, 130, 246, 0.4)' : 'rgba(239, 68, 68, 0.4)';

            ctx.beginPath();
            ctx.arc(player.x, player.y, 7, 0, 2 * Math.PI);
            ctx.fillStyle = isHome ? '#3b82f6' : '#ef4444';
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }, [telemetry]);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-8">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Tactical View</h3>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{homeTeam}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{awayTeam}</span>
                    </div>
                </div>
            </div>

            <div className="relative group overflow-hidden rounded-3xl border-4 border-gray-100 dark:border-gray-800 bg-green-600 shadow-inner">
                <img
                    src="/soccer_pitch.svg"
                    alt="Soccer Pitch"
                    className="w-full h-auto opacity-40 mix-blend-overlay"
                />
                <canvas
                    ref={canvasRef}
                    width="520"
                    height="292"
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ pointerEvents: 'none' }}
                />

                {/* Overlay Grid or Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            <div className="mt-8 flex justify-center space-x-12">
                <div className="text-center">
                    <div className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Home Formation</div>
                    <div className="text-sm font-black text-gray-900 dark:text-white">4-3-3 ATTACK</div>
                </div>
                <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />
                <div className="text-center">
                    <div className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Away Formation</div>
                    <div className="text-sm font-black text-gray-900 dark:text-white">4-4-2 DIAMOND</div>
                </div>
            </div>
        </div>
    );
};
