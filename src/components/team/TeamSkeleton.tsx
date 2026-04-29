import React from 'react';

export const TeamSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500 pb-20">
            {/* Hero Skeleton */}
            <div className="relative h-[600px] overflow-hidden bg-gray-200 dark:bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/40 dark:from-black/80 dark:via-transparent dark:to-black/40" />
                <div className="relative z-10 h-full flex flex-col justify-between p-8 max-w-7xl mx-auto">
                    <div className="text-center mt-20 animate-pulse">
                        {/* Team Name Placeholder */}
                        <div className="h-24 w-3/4 max-w-2xl bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-3xl mx-auto mb-8 bg-[length:200%_100%] animate-shimmer" />
                        
                        {/* Level Badge Placeholder */}
                        <div className="inline-flex items-center space-x-3 bg-white/50 dark:bg-black/30 backdrop-blur-xl border-2 border-gray-300 dark:border-gray-700 px-6 py-3 rounded-full">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 bg-[length:200%_100%] animate-shimmer" />
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
                                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                            </div>
                        </div>

                        {/* XP Bar Placeholder */}
                        <div className="mt-6 max-w-md mx-auto">
                            <div className="h-3 bg-gray-300 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-1/2 bg-gradient-to-r from-gray-400 to-gray-300 dark:from-gray-600 dark:to-gray-700 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Tabs Placeholder */}
                    <div className="flex justify-center space-x-4 pb-8 animate-pulse">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-14 w-36 bg-gray-300 dark:bg-gray-800 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-44 bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-800 p-6 space-y-4 animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent" />
                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                            <div className="h-10 w-1/2 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                    ))}
                </div>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-[400px] bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden animate-pulse">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent" />
                    </div>
                    <div className="space-y-6">
                        <div className="h-[180px] bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden animate-pulse">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent" />
                        </div>
                        <div className="h-[200px] bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden animate-pulse">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite linear;
                }
            `}</style>
        </div>
    );
};

