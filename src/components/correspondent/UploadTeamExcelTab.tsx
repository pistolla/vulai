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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Upload Team Excel Data</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Supported File Formats</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">.xlsx</span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">.xls</span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">.csv</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Expected Data Format</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Your Excel file should contain the following columns:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Jersey Number</strong> - Player's jersey number</li>
            <li>• <strong>First Name</strong> - Player's first name</li>
            <li>• <strong>Last Name</strong> - Player's last name</li>
            <li>• <strong>Position</strong> - Player's position (optional)</li>
            <li>• <strong>Year</strong> - Academic year (FR, SO, JR, SR, GR)</li>
          </ul>
        </div>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-gray-600 mb-4">
            Drag and drop your Excel file here, or click to browse
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
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Browse Files
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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
            <h4 className="text-sm font-medium text-yellow-800">Important Notes</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Make sure your data is properly formatted before uploading. Invalid data may cause upload failures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};