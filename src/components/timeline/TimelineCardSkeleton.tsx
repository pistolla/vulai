import React from 'react';

export const TimelineCardSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto h-[70vh] max-h-[800px] min-h-[500px] rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-between relative overflow-hidden">
      {/* Shimmer gradient overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
      
      <div className="space-y-6 z-0">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
          <div className="w-20 h-6 rounded-full bg-white/10 animate-pulse" />
        </div>
        
        <div className="space-y-4 pt-4">
          <div className="w-3/4 h-10 rounded-lg bg-white/10 animate-pulse" />
          <div className="w-1/2 h-6 rounded-lg bg-white/10 animate-pulse" />
        </div>
      </div>

      <div className="space-y-6 z-0">
        <div className="space-y-3">
          <div className="w-full h-4 rounded-md bg-white/10 animate-pulse" />
          <div className="w-5/6 h-4 rounded-md bg-white/10 animate-pulse" />
          <div className="w-4/6 h-4 rounded-md bg-white/10 animate-pulse" />
        </div>
        
        <div className="w-full h-14 rounded-2xl bg-white/10 animate-pulse" />
        
        <div className="flex justify-between items-center px-4 pt-4 border-t border-white/5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
};
