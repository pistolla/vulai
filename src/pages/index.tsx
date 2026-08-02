import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAppSelector } from '../hooks/redux';
import { useTheme } from '../components/ThemeProvider';
import { GamificationBar } from '../components/timeline/GamificationBar';
import { TimelineSwiper } from '../components/timeline/TimelineSwiper';
import { TimelineCardStats } from '../components/timeline/TimelineCardStats';
import { TimelineCard as TimelineCardType } from '../services/timelinePipeline';
import FixtureDetailModal from '../components/fixtures/FixtureDetailModal';
import QuickViewModal from '../components/QuickViewModal';

const HomePage: React.FC = () => {
  const user = useAppSelector(s => s.auth.user);
  const { theme, mounted } = useTheme();

  // Keep modal states for interactions triggered by timeline cards
  const [selectedQuickViewItem, setSelectedQuickViewItem] = useState<any | null>(null);
  const [selectedMatchForDetail, setSelectedMatchForDetail] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<TimelineCardType | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  return (
    <Layout title="Home" description="Discover excellence in university athletics at Unill Sports">
      {/* Compact Hero Section */}
      <section className={`pt-24 pb-8 flex items-center justify-center relative overflow-hidden ${mounted && theme === 'light' ? 'bg-gradient-to-br from-mauve-100 via-mauve-50 to-mauve-200' : 'bg-black/90'}`}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/images/banner.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 mt-6">
          <div className="animate-float">
            <h1 className="text-4xl md:text-6xl font-black italic mb-2 leading-tight bg-gradient-to-r from-unill-purple-400 to-unill-yellow-500 bg-clip-text text-transparent" style={{ fontFamily: 'Redwing', fontWeight: 'bold' }}>
              UNI limelight Sports
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-300 font-medium tracking-widest uppercase">
            The pulse of university athletics
          </p>
        </div>
      </section>

      {/* Gamification Status Bar */}
      <GamificationBar />

      {/* Main Swipable Timeline Feed & Stats */}
      <section className="relative w-full max-w-7xl mx-auto px-0 sm:px-4 py-0 sm:py-8">
         <div className="grid grid-cols-1 md:grid-cols-12 gap-0 sm:gap-8">
            {/* Left Column: Timeline Feed */}
            <div className="md:col-span-7 lg:col-span-8 relative sm:rounded-3xl overflow-hidden sm:shadow-2xl sm:border border-white/10">
               <TimelineSwiper onActiveCardChange={setActiveCard} />
               
               {/* Floating Action Buttons */}
               <div className="absolute bottom-8 right-4 md:right-8 z-50 flex flex-col gap-3">
                  <button 
                    onClick={() => setIsStatsModalOpen(true)}
                    className="md:hidden w-12 h-12 bg-unill-purple-500 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-lg"
                    title="View Stats"
                  >
                    📊
                  </button>
                  <button 
                    onClick={() => {
                      fetch('/api/timeline/generate?force=true')
                        .then(() => alert('Timeline refresh requested!'))
                        .catch(console.error);
                    }}
                    className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 active:scale-95 transition-all shadow-lg"
                    title="Refresh Timeline"
                  >
                    🔄
                  </button>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="w-12 h-12 bg-gradient-to-r from-unill-purple-500 to-unill-yellow-500 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-lg shadow-unill-purple-500/30"
                    title="Back to Top"
                  >
                    ↑
                  </button>
               </div>
            </div>

            {/* Right Column: Active Card Stats */}
            <div className="hidden md:block md:col-span-5 lg:col-span-4 h-[calc(100vh-64px)] relative">
               <TimelineCardStats card={activeCard} />
            </div>
         </div>
      </section>

      {/* Modals triggered by timeline cards */}
      {selectedQuickViewItem && (
        <QuickViewModal
          item={selectedQuickViewItem}
          isOpen={!!selectedQuickViewItem}
          onClose={() => setSelectedQuickViewItem(null)}
          onAddToCart={() => {}} // Hooked up to Redux cart in a real scenario
        />
      )}

      {selectedMatchForDetail && (
        <FixtureDetailModal
           isOpen={isDetailModalOpen}
           onClose={() => {
             setIsDetailModalOpen(false);
             setSelectedMatchForDetail(null);
           }}
           match={selectedMatchForDetail}
        />
      )}

      {/* Mobile Stats Modal */}
      {isStatsModalOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/95 flex flex-col pt-16 pb-4 px-4 backdrop-blur-sm animate-fade-in">
           <button 
             className="absolute top-6 right-6 text-white bg-white/10 rounded-full w-10 h-10 flex items-center justify-center border border-white/20 z-50"
             onClick={() => setIsStatsModalOpen(false)}
           >
             ✕
           </button>
           <div className="flex-1 overflow-y-auto mt-4 rounded-3xl bg-gray-900/50 border border-white/10">
             <TimelineCardStats card={activeCard} />
           </div>
        </div>
      )}
    </Layout>
  );
};

export default HomePage;
