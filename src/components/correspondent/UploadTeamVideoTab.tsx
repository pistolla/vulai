import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { submitImportedData } from '@/store/correspondentThunk';
import { ImportedData } from '@/models';

export const UploadTeamVideoTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const universities = useAppSelector(s => s.admin.universities);
  const [formData, setFormData] = useState({
    driveLink: '',
    fileExtension: 'pdf' as ImportedData['fileExtension'],
    dataType: 'League' as ImportedData['dataType'],
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const universityName = universities.find(u => u.id === user?.universityId)?.name || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const data: Omit<ImportedData, 'id'> = {
        correspondentId: user.uid,
        correspondentName: user.displayName || '',
        correspondentEmail: user.email || '',
        universityName,
        driveLink: formData.driveLink,
        fileExtension: formData.fileExtension,
        dataType: formData.dataType,
        description: formData.description,
        dateOfUpload: new Date().toISOString(),
        status: 'pending',
      };
      await dispatch(submitImportedData(data));
      alert('Data import request submitted successfully!');
      setFormData({
        driveLink: '',
        fileExtension: 'pdf',
        dataType: 'League',
        description: '',
      });
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit data import request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700 p-8">
      <h2 className="text-3xl font-black dark:text-white mb-8">Import Data Files</h2>

      <div className="mb-8">
        <h3 className="text-xl font-bold dark:text-white mb-4">How It Works</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
          <ol className="text-blue-800 dark:text-blue-200 space-y-3">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">1</span>
              <span className="text-sm font-medium">Share your Google Drive file with read/write permissions</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">2</span>
              <span className="text-sm font-medium">Paste the shared link in the form below</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">3</span>
              <span className="text-sm font-medium">Fill in the details and submit for processing</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5">4</span>
              <span className="text-sm font-medium">Admin will review and process your data</span>
            </li>
          </ol>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">
              Correspondent Name
            </label>
            <input
              type="text"
              value={user?.displayName || ''}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">
              Gmail Account
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">
            University
          </label>
          <input
            type="text"
            value={universityName}
            readOnly
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">
            Google Drive Link
          </label>
          <input
            type="url"
            required
            value={formData.driveLink}
            onChange={e => setFormData({ ...formData, driveLink: e.target.value })}
            placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">
              File Extension/Type
            </label>
            <select
              value={formData.fileExtension}
              onChange={e => setFormData({ ...formData, fileExtension: e.target.value as ImportedData['fileExtension'] })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white"
              disabled={isSubmitting}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">
              Data Type
            </label>
            <select
              value={formData.dataType}
              onChange={e => setFormData({ ...formData, dataType: e.target.value as ImportedData['dataType'] })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white"
              disabled={isSubmitting}
            >
              <option value="League">League</option>
              <option value="team data">Team Data</option>
              <option value="players data">Players Data</option>
              <option value="merchandise">Merchandise</option>
              <option value="match results">Match Results</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">
            Description
          </label>
          <textarea
            required
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the data in this file..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white"
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-8 py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${
            isSubmitting
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Data Import Request'}
        </button>
      </form>
    </div>
  );
};