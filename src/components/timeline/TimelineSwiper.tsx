import React, { useEffect, useState, useRef } from 'react';
import { TimelineCard as TimelineCardType } from '../../services/timelinePipeline';
import { subscribeToTimeline } from '../../services/timelineService';
import { TimelineCard } from './TimelineCard';
import { TimelineCardSkeleton } from './TimelineCardSkeleton';

export interface TimelineSwiperProps {
  onActiveCardChange?: (card: TimelineCardType | null) => void;
  className?: string;
}

export const TimelineSwiper: React.FC<TimelineSwiperProps> = ({ onActiveCardChange, className }) => {
  const [cards, setCards] = useState<TimelineCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Subscribe to timeline cards (Real-time read only)
  useEffect(() => {
    console.log('[TimelineSwiper] Subscribing to timeline_cards...');
    const unsubscribe = subscribeToTimeline((fetchedCards) => {
      setCards(fetchedCards);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Progressive generation trigger (Throttled)
  useEffect(() => {
    const triggerGeneration = async () => {
      const lastGen = localStorage.getItem('unill_timeline_last_gen');
      const now = Date.now();
      // Generate once per 15 mins max
      if (!lastGen || now - parseInt(lastGen, 10) > 15 * 60 * 1000) {
        console.log('[TimelineSwiper] Triggering background generation API...');
        try {
          // Fire and forget via requestIdleCallback if available
          const fetchCall = () => fetch('/api/timeline/generate');
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(fetchCall);
          } else {
            setTimeout(fetchCall, 1000);
          }
          localStorage.setItem('unill_timeline_last_gen', now.toString());
        } catch (e) {
          console.error('[TimelineSwiper] Background generation trigger failed:', e);
        }
      }
    };
    triggerGeneration();
  }, []);

  // 3. Scroll spy for active index detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPos = container.scrollTop;
      const itemHeight = container.clientHeight; // Assuming full height items
      const newIndex = Math.round(scrollPos / itemHeight);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);

  // 4. Notify parent of active card changes
  useEffect(() => {
    if (onActiveCardChange) {
      if (cards.length > 0 && activeIndex >= 0 && activeIndex < cards.length) {
        onActiveCardChange(cards[activeIndex]);
      } else {
        onActiveCardChange(null);
      }
    }
  }, [activeIndex, cards, onActiveCardChange]);

  if (loading || cards.length === 0) {
    return (
      <div className={`w-full h-[calc(100vh-64px)] overflow-hidden bg-black/90 pt-8 ${className || ''}`}>
        <TimelineCardSkeleton />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] overflow-y-auto no-scrollbar snap-y snap-mandatory bg-black/90 relative ${className || ''}`}
      style={{ scrollBehavior: 'smooth' }}
    >
      {cards.map((card, index) => {
        // Virtual rendering logic: only fully render visible cards ± 2
        const isVisible = Math.abs(index - activeIndex) <= 2;
        const isActive = index === activeIndex;

        return (
          <div 
            key={card.id || index}
            className="w-full h-full snap-start flex items-center justify-center p-0 sm:p-4 relative"
          >
            {isVisible ? (
              <TimelineCard 
                card={card} 
                isActive={isActive} 
              />
            ) : (
              // Empty placeholder to maintain scroll height
              <div className="w-full max-w-md h-[70vh] min-h-[500px]" />
            )}
            
            {/* Scroll indicators */}
            {isActive && index < cards.length - 1 && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce pointer-events-none opacity-50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
