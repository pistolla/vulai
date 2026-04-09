import { useRef, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { uploadAthleteCsv, createTeamPending } from '@/store/correspondentThunk';
import { useToast } from '@/components/common/ToastProvider';
import { apiService } from '@/services/apiService';
import { FiUploadCloud, FiPlusCircle, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { generateTeamSlug } from '@/utils/slugUtils';

export const UploadTeamExcelTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const { success: showSuccess, error: showError } = useToast();
  const excelRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'create'>('upload');
  
  // Data for create team
  const [universities, setUniversities] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    universityId: '',
    coach: '',
    foundedYear: '',
    logoURL: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [uniData, sportData] = await Promise.all([
          apiService.getUniversities(),
          apiService.getSports()
        ]);
        setUniversities(uniData);
        setSports(sportData);
      } catch (error) {
        console.error('Failed to load form data:', error);
      }
    };
    if (activeTab === 'create') {
      loadData();
    }
  }, [activeTab]);

  const onExcel = () => excelRef.current?.click();

  const onExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (user?.teamId) {
      dispatch(uploadAthleteCsv({ teamId: user.teamId, file }));
      showSuccess('File uploaded', 'Roster imported successfully!');
    } else {
      showError('No team ID found', 'Please ensure you are associated with a team.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        if (user?.teamId) {
          dispatch(uploadAthleteCsv({ teamId: user.teamId, file }));
          showSuccess('File uploaded', 'Roster imported successfully!');
        } else {
          showError('No team ID found', 'Please ensure you are associated with a team.');
        }
      } else {
        showError('Invalid file type', 'Please upload a valid Excel or CSV file.');
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(p => ({ ...p, [field]: value }));
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sport) {
      showError('Required fields missing', 'Team Name and Sport are required.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await dispatch(createTeamPending({
        name: formData.name.trim(),
        slug: generateTeamSlug(formData.name.trim()),
        sport: formData.sport,
        universityId: formData.universityId || '',
        coach: formData.coach,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
        logoURL: formData.logoURL,
        record: '',
        championships: '',
        season: '',
        stats: {}
      })).unwrap();
      
      showSuccess('Team created', 'The team has been submitted for admin approval.');
      setFormData({
        name: '',
        sport: '',
        universityId: '',
        coach: '',
        foundedYear: '',
        logoURL: '',
      });
      setActiveTab('upload');
    } catch (err: any) {
      showError('Failed to create team', err.message || 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-black dark:text-white">Team Management</h2>
        
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'upload' 
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <FiUploadCloud className="w-4 h-4" />
            Upload Roster
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'create' 
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <FiPlusCircle className="w-4 h-4" />
            Register Team
          </button>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="mb-8">
            <h3 className="text-xl font-bold dark:text-white mb-4">Supported File Formats</h3>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-bold">.xlsx</span>
              <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-bold">.xls</span>
              <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-bold">.csv</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold dark:text-white mb-4">Expected Data Format</h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-100 dark:border-gray-600">
              <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">Your Excel file should contain the following columns:</p>
              <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  <strong className="dark:text-white">Jersey Number</strong> - Player's jersey number
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  <strong className="dark:text-white">First Name</strong> - Player's first name
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  <strong className="dark:text-white">Last Name</strong> - Player's last name
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  <strong className="dark:text-white">Position</strong> - Player's position (optional)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  <strong className="dark:text-white">Year</strong> - Academic year (FR, SO, JR, SR, GR)
                </li>
              </ul>
            </div>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-700/30"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                <FiUploadCloud className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Drop your Excel file here</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Or click to browse your files
              </p>
              <input
                ref={excelRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={onExcelChange}
              />
              <button
                onClick={onExcel}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
              >
                Browse Files
              </button>
            </div>
          </div>

          <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl flex items-start gap-3">
            <FiAlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-lg font-bold text-yellow-800 dark:text-yellow-400">Important Notes</h4>
              <p className="text-yellow-700 dark:text-yellow-300/80 mt-1">
                Make sure your data is properly formatted before uploading. Invalid data may cause upload failures. Double-check column headers and data types.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 border border-blue-100 dark:border-blue-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <FiPlusCircle className="text-blue-600 dark:text-blue-400" />
                Register an Independent Team
              </h3>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                Teams created here are intended for external tournaments or independent non-university groups. They will require admin approval to become fully active.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateTeam} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                  placeholder="e.g. Desert Eagles"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Sport <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.sport}
                  onChange={e => handleChange('sport', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                >
                  <option value="">Select Sport...</option>
                  {sports.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  University (Optional)
                </label>
                <select
                  value={formData.universityId}
                  onChange={e => handleChange('universityId', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                >
                  <option value="">Independent / No University</option>
                  {universities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Coach Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.coach}
                  onChange={e => handleChange('coach', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Founded Year (Optional)
                </label>
                <input
                  type="number"
                  value={formData.foundedYear}
                  onChange={e => handleChange('foundedYear', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                  placeholder="e.g. 2023"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.logoURL}
                  onChange={e => handleChange('logoURL', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-5 h-5" />
                    Submit for Approval
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};