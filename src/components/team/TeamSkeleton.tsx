import React from 'react';

export const TeamSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500 pb-20">
            {/* Hero Skeleton */}
            <div className="relative h-[600px] overflow-hidden bg-gray-200 dark:bg-gray-900 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/40 dark:from-black/80 dark:via-transparent dark:to-black/40" />
                <div className="relative z-10 h-full flex flex-col justify-between p-8 max-w-7xl mx-auto">
                    <div className="text-center mt-20">
                        {/* Team Name Placeholder */}
                        <div className="h-20 w-3/4 max-w-2xl bg-gray-300 dark:bg-gray-800 rounded-3xl mx-auto mb-8" />
                        
                        {/* Level Badge Placeholder */}
                        <div className="inline-flex items-center space-x-3 bg-white/50 dark:bg-black/30 backdrop-blur-xl border-2 border-gray-300 dark:border-gray-700 px-6 py-3 rounded-full">
                            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-800" />
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-gray-300 dark:bg-gray-800 rounded" />
                                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-800 rounded" />
                            </div>
                        </div>

                        {/* XP Bar Placeholder */}
                        <div className="mt-6 max-w-md mx-auto">
                            <div className="h-3 bg-gray-300 dark:bg-gray-800 rounded-full" />
                        </div>
                    </div>

                    {/* Tabs Placeholder */}
                    <div className="flex justify-center space-x-4 pb-8">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-12 w-32 bg-gray-300 dark:bg-gray-800 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-800 p-6 space-y-4">
                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                            <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                    ))}
                </div>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-[400px] bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-800" />
                    <div className="space-y-6">
                        <div className="h-[180px] bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-800" />
                        <div className="h-[200px] bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-800" />
                    </div>
                </div>
            </div>
        </div>
    );
};
