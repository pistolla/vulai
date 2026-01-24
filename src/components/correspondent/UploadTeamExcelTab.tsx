import { useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { uploadAthleteCsv } from '@/store/correspondentThunk';

export const UploadTeamExcelTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const excelRef = useRef<HTMLInputElement>(null);

  const onExcel = () => excelRef.current?.click();

  const onExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (user?.teamId) {
      dispatch(uploadAthleteCsv({ teamId: user.teamId, file }));
    } else {
      alert('No team ID found. Please ensure you are associated with a team.');
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
        } else {
          alert('No team ID found. Please ensure you are associated with a team.');
        }
      } else {
        alert('Please upload a valid Excel or CSV file.');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700 p-4 sm:p-8">
      <h2 className="text-3xl font-black dark:text-white mb-8">Upload Team Roster</h2>

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
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-100 dark:border-gray-600">
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
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-700/50"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Drop your Excel file here</h4>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
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

      <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
        <div className="flex">
          <div className="w-6 h-6 bg-yellow-400 dark:bg-yellow-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
            <span className="text-yellow-800 dark:text-yellow-200 text-sm">!</span>
          </div>
          <div>
            <h4 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">Important Notes</h4>
            <p className="text-yellow-700 dark:text-yellow-300 mt-2">
              Make sure your data is properly formatted before uploading. Invalid data may cause upload failures. Double-check column headers and data types.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};