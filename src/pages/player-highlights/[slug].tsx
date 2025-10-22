import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

interface PlayerHighlight {
  season: string;
  age: number;
  achievements: string[];
  stats: {
    goals?: number;
    assists?: number;
    matches?: number;
    rating?: number;
  };
  highlights: string[];
}

export default function PlayerHighlightsPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [playerData, setPlayerData] = useState<any>(null);
  const [highlights, setHighlights] = useState<PlayerHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const loadPlayerHighlights = async () => {
      try {
        // Mock data - in real app this would come from Firebase
        const mockPlayerData = {
          name: slug.toString().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          position: 'Forward',
          currentTeam: 'Eagles',
          avatar: 'JM'
        };

        const mockHighlights: PlayerHighlight[] = [
          {
            season: '2023-2024',
            age: 21,
            achievements: ['Top Scorer', 'Player of the Month (3x)', 'Champions League Final'],
            stats: { goals: 28, assists: 12, matches: 35, rating: 8.7 },
            highlights: [
              'Hat-trick vs Lions in Champions League',
              'Game-winning goal in cup final',
              'Man of the Match in 15 consecutive games'
            ]
          },
          {
            season: '2022-2023',
            age: 20,
            achievements: ['Rookie of the Year', 'Golden Boot Winner'],
            stats: { goals: 22, assists: 8, matches: 32, rating: 8.3 },
            highlights: [
              'First professional goal',
              'Breakthrough season with 22 goals',
              'Called up to national team'
            ]
          },
          {
            season: '2021-2022',
            age: 19,
            achievements: ['Youth Academy Player of the Year'],
            stats: { goals: 15, assists: 6, matches: 28, rating: 7.8 },
            highlights: [
              'Promoted to first team',
              'First senior appearance',
              'Consistent performances in academy'
            ]
          }
        ];

        setPlayerData(mockPlayerData);
        setHighlights(mockHighlights);
      } catch (error) {
        console.error('Failed to load player highlights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayerHighlights();
  }, [slug]);

  if (loading) {
    return (
      <Layout title="Player Highlights">
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading player highlights...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!playerData) {
    return (
      <Layout title="Player Highlights">
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Player Not Found</h1>
                <p className="text-gray-600">The requested player could not be found.</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${playerData.name} - Career Highlights`}>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Player Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{playerData.avatar}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{playerData.name}</h1>
                <p className="text-xl text-gray-600">{playerData.position} • {playerData.currentTeam}</p>
                <p className="text-gray-500 mt-2">Career highlights and achievements timeline</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            {highlights.map((highlight, index) => (
              <div key={highlight.season} className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-start space-x-6">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    {index < highlights.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-300 mt-2"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">{highlight.season}</h2>
                      <span className="text-lg text-gray-600">Age {highlight.age}</span>
                    </div>

                    {/* Achievements */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Achievements</h3>
                      <div className="flex flex-wrap gap-2">
                        {highlight.achievements.map((achievement, i) => (
                          <span key={i} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            🏆 {achievement}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Season Statistics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {highlight.stats.goals !== undefined && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{highlight.stats.goals}</div>
                            <div className="text-sm text-gray-600">Goals</div>
                          </div>
                        )}
                        {highlight.stats.assists !== undefined && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{highlight.stats.assists}</div>
                            <div className="text-sm text-gray-600">Assists</div>
                          </div>
                        )}
                        {highlight.stats.matches !== undefined && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{highlight.stats.matches}</div>
                            <div className="text-sm text-gray-600">Matches</div>
                          </div>
                        )}
                        {highlight.stats.rating !== undefined && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{highlight.stats.rating}</div>
                            <div className="text-sm text-gray-600">Rating</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Highlights */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Highlights</h3>
                      <ul className="space-y-2">
                        {highlight.highlights.map((item, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}