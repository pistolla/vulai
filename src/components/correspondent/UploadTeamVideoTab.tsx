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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Upload Team Video</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">How it works</h3>
        <div className="bg-blue-50 rounded-lg p-4">
          <ol className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">1</span>
              Select the game you want to upload video for
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">2</span>
              Click "Upload Video" to open Google Drive picker
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">3</span>
              Select your video file from Google Drive
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">4</span>
              Video will be linked to the selected game
            </li>
          </ol>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Game
          </label>
          <select
            value={selectedGameId}
            onChange={e => setSelectedGameId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
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
            <p className="text-gray-600 mb-4">
              Upload video files from your Google Drive
            </p>
            <button
              onClick={onDriveVideo}
              disabled={!selectedGameId || isUploading}
              className={`px-6 py-2 rounded-md transition-colors ${
                !selectedGameId || isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload Video from Drive'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <svg
                className="w-5 h-5 text-green-400 mr-2 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-green-800">Supported Formats</h4>
                <p className="text-sm text-green-700 mt-1">
                  MP4, AVI, MOV, WMV, and other common video formats
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <svg
                className="w-5 h-5 text-yellow-400 mr-2 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">File Size Limit</h4>
                <p className="text-sm text-yellow-700 mt-1">
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