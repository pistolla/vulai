import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { Match } from '@/models';
import { firebaseLeagueService } from '@/services/firebaseCorrespondence';

export default function MatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadMatch = async () => {
      try {
        const foundMatch = await firebaseLeagueService.findMatchById(id as string);
        setMatch(foundMatch);
      } catch (error) {
        console.error('Failed to load match:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [id]);

  if (loading) {
    return (
      <Layout title="Match">
        <div className="min-h-screen bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading match...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!match || !match.blogContent) {
    return (
      <Layout title="Match">
        <div className="min-h-screen bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Match Not Found or No Content</h1>
                <p className="text-gray-600">The requested match could not be found or has no blog content.</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Match ${match.matchNumber}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500 pt-16"> {/* Adjusted top margin */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6">Match Preview</h1>
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: match.blogContent }} />
          </div>
        </div>
      </div>
    </Layout>
  );
}