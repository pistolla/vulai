import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { attachDriveVideo } from '@/store/correspondentThunk';
import { fetchGames } from '@/store/adminThunk';
import { initDrivePicker, pickDriveVideo } from '@/services/drivePicker';
import { useEffect } from 'react';

export const UploadTeamVideoTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const games = useAppSelector(s => s.games.upcoming);
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchGames());
  }, [dispatch]);

  const onDriveVideo = async () => {
    if (!selectedGameId) {
      alert('Please select a game first.');
      return;
    }

    setIsUploading(true);
    try {
      await initDrivePicker();
      const { fileId, webViewLink } = await pickDriveVideo();
      await dispatch(attachDriveVideo({ 
        fixtureId: selectedGameId, 
        fileId, 
        webViewLink 
      }));
      alert('Video uploaded successfully!');
      setSelectedGameId('');
    } catch (error) {
      console.error('Video upload failed:', error);
      // User cancelled or error occurred
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700 p-8">
      <h2 className="text-3xl font-black dark:text-white mb-8">Upload Match Reels</h2>

      <div className="mb-8">
        <h3 className="text-xl font-bold dark:text-white mb-4">How It Works</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
          <ol className="text-blue-800 dark:text-blue-200 space-y-3">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">1</span>
              <span className="text-sm font-medium">Select the game you want to upload video for</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">2</span>
              <span className="text-sm font-medium">Click "Upload Video" to open Google Drive picker</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">3</span>
              <span className="text-sm font-medium">Select your video file from Google Drive</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">4</span>
              <span className="text-sm font-medium">Video will be linked to the selected game</span>
            </li>
          </ol>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">
            Select Game
          </label>
          <select
            value={selectedGameId}
            onChange={e => setSelectedGameId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white"
            disabled={isUploading}
          >
            <option value="" disabled>
              Choose a game to upload video for...
            </option>
            {games.map((game: any) => (
              <option key={game.id} value={game.id}>
                {game.homeTeamName} vs {game.awayTeamName} - {game.sport} ({new Date(game.scheduledAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center bg-gray-50 dark:bg-gray-700/50 hover:border-red-400 dark:hover:border-red-500 transition-colors">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Upload from Google Drive</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Select and link video files to your matches
            </p>
            <button
              onClick={onDriveVideo}
              disabled={!selectedGameId || isUploading}
              className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${
                !selectedGameId || isUploading
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/30'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload Video from Drive'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-green-800 dark:text-green-200">Supported Formats</h4>
                <p className="text-green-700 dark:text-green-300 mt-2">
                  MP4, AVI, MOV, WMV, and other common video formats
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <div className="flex">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">File Size Limit</h4>
                <p className="text-yellow-700 dark:text-yellow-300 mt-2">
                  Maximum file size depends on your Google Drive storage
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};