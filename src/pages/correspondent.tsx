import { useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import CorrespondentGuard from '@/guards/CorrespondentGuard'; // role guard
import { uploadAthleteCsv, attachDriveVideo, startLiveCommentary, pushCommentaryEvent, endLiveCommentary } from '@/store/correspondentThunk';
import { fetchGames } from '@/store/adminThunk'; // shared thunk
import AOS from 'aos';
import 'aos/dist/aos.css';
import feather from 'feather-icons';
import { initDrivePicker, pickDriveVideo } from '@/services/drivePicker';

export default function CorrespondentDashboardPage() {
  const dispatch = useAppDispatch();
  const user      = useAppSelector(s => s.auth.user); // logged-in correspondent
  const games     = useAppSelector(s => s.games.upcoming); // available games
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [commentary, setCommentary] = useState('');
  const [isLive, setIsLive]         = useState(false);

  /* ---------- feather + AOS ---------- */
  useEffect(() => {
    AOS.init({ once: true });
    feather.replace();
  }, []);

  /* ---------- load games once ---------- */
  useEffect(() => { dispatch(fetchGames()); }, [dispatch]);

  /* ---------- Excel ---------- */
  const excelRef = useRef<HTMLInputElement>(null);
  const onExcel  = () => excelRef.current?.click();
  const onExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch(uploadAthleteCsv({ teamId: user?.teamId || '', file }));
  };

  /* ---------- Google Drive ---------- */
  const onDriveVideo = async () => {
    await initDrivePicker(); // thin wrapper we built earlier
    try {
      const { fileId, webViewLink } = await pickDriveVideo();
      dispatch(attachDriveVideo({ fixtureId: selectedGameId, fileId, webViewLink }));
    } catch (e) {/* cancelled */}
  };

  /* ---------- Live commentary ---------- */
  const startLive = () => {
    if (!selectedGameId) return;
    dispatch(startLiveCommentary(selectedGameId)).then(() => setIsLive(true));
  };
  const pushEvent = () => {
    if (!commentary.trim() || !selectedGameId) return;
    dispatch(pushCommentaryEvent({
      fixtureId: selectedGameId,
      event: {
        minute: 0, // TODO: real game clock
        type: 'text',
        teamId: user?.teamId || '',
        body: commentary,
      },
    }));
    setCommentary('');
  };
  const endLive = () => {
    dispatch(endLiveCommentary(selectedGameId)).then(() => setIsLive(false));
  };

  /* ---------- Profile form ---------- */
  const [profile, setProfile] = useState({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', university: 'Harvard University' });
  const onProfileChange = (field: keyof typeof profile, value: string) => setProfile(p => ({ ...p, [field]: value }));

  return (
    <CorrespondentGuard>
      {/* ------- HEADER ------- */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Correspondent Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your sports coverage and upload content</p>
        </div>
      </section>

      {/* ------- MAIN GRID ------- */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6" data-aos="fade-up">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4"><i data-feather="user" className="text-blue-600" /></div>
                <div><h2 className="text-xl font-semibold">Your Profile</h2><p className="text-gray-600">Manage your correspondent account</p></div>
              </div>
              <a href="#profile" className="block w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700">Edit Profile</a>
            </div>

            {/* Excel Upload */}
            <div className="bg-white rounded-lg shadow-md p-6" data-aos="fade-up" data-aos-delay="200">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4"><i data-feather="file-text" className="text-green-600" /></div>
                <div><h2 className="text-xl font-semibold">Upload Data</h2><p className="text-gray-600">Upload Excel files with game statistics</p></div>
              </div>
              <input ref={excelRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onExcelChange} />
              <button onClick={onExcel} className="block w-full bg-green-600 text-white text-center py-2 rounded hover:bg-green-700">Upload Excel</button>
            </div>

            {/* Video Upload */}
            <div className="bg-white rounded-lg shadow-md p-6" data-aos="fade-up" data-aos-delay="400">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mr-4"><i data-feather="video" className="text-red-600" /></div>
                <div><h2 className="text-xl font-semibold">Upload Videos</h2><p className="text-gray-600">Upload game videos to Google Drive</p></div>
              </div>
              <button onClick={onDriveVideo} className="block w-full bg-red-600 text-white text-center py-2 rounded hover:bg-red-700">Upload Video</button>
            </div>
          </div>

          {/* Live Commentary */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-6" data-aos="fade-up">
            <h2 className="text-2xl font-semibold mb-6">Live Sports Commentary</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Game</label>
                <select value={selectedGameId} onChange={e => setSelectedGameId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="" disabled>Select a game</option>
                  {games.map((g: any) => (
                    <option key={g.id} value={g.id}>{g.homeTeamName} vs {g.awayTeamName} – {g.sport}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Live Commentary</label>
                <textarea value={commentary} onChange={e => setCommentary(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} placeholder="Enter your live commentary here..." />
              </div>
              <div className="flex space-x-3">
                {!isLive ? (
                  <button onClick={startLive} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Start Live Commentary</button>
                ) : (
                  <>
                    <button onClick={pushEvent} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">Send Update</button>
                    <button onClick={endLive} className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700">End Commentary</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Management */}
          <div id="profile" className="mt-12 bg-white rounded-lg shadow-md p-6" data-aos="fade-up">
            <h2 className="text-2xl font-semibold mb-6">Profile Management</h2>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert('Profile update thunk here'); }}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" value={profile.firstName} onChange={e => onProfileChange('firstName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" value={profile.lastName} onChange={e => onProfileChange('lastName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={profile.email} onChange={e => onProfileChange('email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">University</label>
                <input type="text" value={profile.university} onChange={e => onProfileChange('university', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Update Profile</button>
            </form>
          </div>

          {/* Excel Upload Section */}
          <div id="excel-upload" className="mt-12 bg-white rounded-lg shadow-md p-6" data-aos="fade-up">
            <h2 className="text-2xl font-semibold mb-6">Upload Excel Data</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <i data-feather="upload-cloud" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Drag and drop your Excel file here, or click to browse</p>
              <input ref={excelRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onExcelChange} />
              <button onClick={onExcel} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 cursor-pointer">Browse Files</button>
            </div>
          </div>

          {/* Video Upload Section */}
          <div id="video-upload" className="mt-12 bg-white rounded-lg shadow-md p-6" data-aos="fade-up">
            <h2 className="text-2xl font-semibold mb-6">Upload Video to Google Drive</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <i data-feather="video" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Select video file to upload to Google Drive</p>
              <button onClick={onDriveVideo} className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 cursor-pointer">Select Video</button>
            </div>
          </div>
        </div>
      </section>

      
    </CorrespondentGuard>
  );
}