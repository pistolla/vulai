import React, { useState, useEffect } from 'react';
import { TimelineCard as TimelineCardType } from '../../services/timelinePipeline';
import { aiService, ScrapedNewsArticle, FactCheckResult } from '../../services/aiService';

interface TimelineCardStatsProps {
  card: TimelineCardType | null;
  className?: string;
}

interface NewsCheckState {
  article: ScrapedNewsArticle;
  result: FactCheckResult | null;
  loading: boolean;
}

export const TimelineCardStats: React.FC<TimelineCardStatsProps> = ({ card, className }) => {
  const [newsChecks, setNewsChecks] = useState<NewsCheckState[]>([]);

  useEffect(() => {
    if (!card) return;

    // Mock fetching related news for the specific card
    const fetchAndCheckNews = async () => {
      // Mocked articles pulled from an external "NewsAPI"
      const mockArticles: ScrapedNewsArticle[] = [
        {
          id: '1',
          source: 'Sports Update Daily',
          title: `Shocking scandal: Key player banned in ${card.title} match`,
          excerpt: 'Unbelievable scenes as the main player was reportedly banned right before the match started.',
          url: '#',
          publishedAt: new Date().toISOString()
        },
        {
          id: '2',
          source: 'University Athletics News',
          title: `Reportedly new injury concerns before ${card.title}`,
          excerpt: 'There might be some last minute injury concerns for the upcoming match.',
          url: '#',
          publishedAt: new Date().toISOString()
        }
      ];

      // Initialize state
      setNewsChecks(mockArticles.map(a => ({ article: a, result: null, loading: true })));

      // Fact-check each article asynchronously
      mockArticles.forEach(async (article, idx) => {
        try {
          const result = await aiService.factCheckArticle(article, card.metadata);
          setNewsChecks(prev => {
            const next = [...prev];
            if (next[idx]) {
              next[idx].result = result;
              next[idx].loading = false;
            }
            return next;
          });
        } catch (e) {
          console.error(e);
        }
      });
    };

    fetchAndCheckNews();
  }, [card]);

  if (!card) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 ${className || ''}`}>
        <p className="text-gray-400 font-medium">Select a card to view statistics</p>
      </div>
    );
  }

  const { reactions, metadata } = card;
  const totalReactions = (reactions?.fire || 0) + (reactions?.clap || 0) + (reactions?.heart || 0) + (reactions?.wow || 0) + (reactions?.trophy || 0);

  return (
    <div className={`w-full h-full bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 flex flex-col gap-6 shadow-2xl overflow-y-auto ${className || ''}`}>
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{card.emoji}</span>
          <h3 className="text-2xl font-bold text-white">{card.title}</h3>
        </div>
        <p className="text-gray-300 font-medium">{card.subtitle}</p>
      </div>

      <div className="bg-black/40 rounded-xl p-5 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Engagement</h4>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400">Total Reactions</span>
          <span className="text-3xl font-bold bg-gradient-to-r from-unill-purple-400 to-unill-yellow-500 bg-clip-text text-transparent">{totalReactions}</span>
        </div>
        
        <div className="grid grid-cols-5 gap-2 text-center">
          <div className="flex flex-col items-center bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors">
            <span className="text-xl mb-1">🔥</span>
            <span className="text-sm font-medium text-gray-300">{reactions?.fire || 0}</span>
          </div>
          <div className="flex flex-col items-center bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors">
            <span className="text-xl mb-1">👏</span>
            <span className="text-sm font-medium text-gray-300">{reactions?.clap || 0}</span>
          </div>
          <div className="flex flex-col items-center bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors">
            <span className="text-xl mb-1">❤️</span>
            <span className="text-sm font-medium text-gray-300">{reactions?.heart || 0}</span>
          </div>
          <div className="flex flex-col items-center bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors">
            <span className="text-xl mb-1">😲</span>
            <span className="text-sm font-medium text-gray-300">{reactions?.wow || 0}</span>
          </div>
          <div className="flex flex-col items-center bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors">
            <span className="text-xl mb-1">🏆</span>
            <span className="text-sm font-medium text-gray-300">{reactions?.trophy || 0}</span>
          </div>
        </div>
      </div>

      {metadata && Object.keys(metadata).length > 0 && (
        <div className="bg-black/40 rounded-xl p-5 border border-white/10 flex-grow">
          <h4 className="text-lg font-semibold text-white mb-4">Card Details</h4>
          <div className="space-y-4">
            {Object.entries(metadata).map(([key, value]) => {
              if (key === 'participants' && Array.isArray(value)) {
                return (
                  <div key={key} className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Teams</span>
                    <span className="text-sm text-gray-200">
                      {value.map(v => v.name).join(' vs ')}
                    </span>
                  </div>
                );
              }
              if (key === 'score' && typeof value === 'object') {
                return (
                  <div key={key} className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Score</span>
                    <span className="text-sm text-gray-200">
                      {value.home} - {value.away}
                    </span>
                  </div>
                );
              }
              return (
                <div key={key} className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-sm text-gray-200">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Fact-Checking Widget */}
      {newsChecks.length > 0 && (
        <div className="bg-black/40 rounded-xl p-5 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">🤖</span> AI Fact-Checker
          </h4>
          <div className="space-y-4">
            {newsChecks.map((check, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="text-xs text-unill-purple-400 font-bold uppercase">{check.article.source}</span>
                  {check.loading ? (
                    <span className="text-[10px] bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full animate-pulse whitespace-nowrap">Analyzing...</span>
                  ) : check.result?.status === 'Correct' ? (
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold whitespace-nowrap">🟢 Confirmed</span>
                  ) : check.result?.status === 'Partially Correct' ? (
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-bold whitespace-nowrap">🟡 Partial</span>
                  ) : (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-full font-bold whitespace-nowrap">🔴 Fake News</span>
                  )}
                </div>
                <h5 className="text-sm font-semibold text-white mb-1">{check.article.title}</h5>
                
                {!check.loading && check.result && (
                  <div className={`mt-3 p-3 rounded-lg text-sm leading-relaxed ${
                    check.result.status === 'Correct' ? 'bg-green-500/10 text-green-200 border-l-2 border-green-500' :
                    check.result.status === 'Partially Correct' ? 'bg-yellow-500/10 text-yellow-200 border-l-2 border-yellow-500' :
                    'bg-red-500/10 text-red-200 border-l-2 border-red-500'
                  }`}>
                    {check.result.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
