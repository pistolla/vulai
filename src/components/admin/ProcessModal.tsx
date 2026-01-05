import React, { useState, useEffect } from 'react';
import { FiMinimize2, FiMaximize2, FiX, FiFile, FiLoader } from 'react-icons/fi';
import { initDrivePicker, pickDriveFile, getDriveFileContent, getAccessToken } from '@/services/drivePicker';

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  importedDataId: string;
  driveLink: string;
  dataType: string;
  onSave: (data: any, fileId: string) => void;
}

export const ProcessModal: React.FC<ProcessModalProps> = ({
  isOpen,
  onClose,
  importedDataId,
  driveLink,
  dataType,
  onSave,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [step, setStep] = useState<'select' | 'processing' | 'review' | 'saving'>('select');
  const [selectedFile, setSelectedFile] = useState<{ fileId: string; mimeType: string } | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      initDrivePicker();
    }
  }, [isOpen]);


  const handleSelectFile = async () => {
    try {
      setError(null);
      const file = await pickDriveFile();
      setSelectedFile(file);
      setStep('processing');
      await processFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select file');
    }
  };

  const processFile = async (file: { fileId: string; mimeType: string }) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }
      const fileContent = await getDriveFileContent(file.fileId, accessToken);

      // Convert to base64 for Gemini
      const base64Content = btoa(String.fromCharCode(...Array.from(new Uint8Array(fileContent))));

      // Send to Gemini
      const extracted = await extractWithGemini(base64Content, file.mimeType);
      setExtractedData(extracted);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setStep('select');
    }
  };

  const extractWithGemini = async (base64Data: string, mimeType: string): Promise<any> => {
    const response = await fetch('/api/extract-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, mimeType, dataType }),
    });

    if (!response.ok) {
      throw new Error('Failed to extract data');
    }

    return response.json();
  };

  const handleSave = async () => {
    if (!extractedData || !selectedFile) return;

    setStep('saving');
    try {
      await onSave(extractedData, selectedFile.fileId);
      onClose();
    } catch (err) {
      setError('Failed to save data');
      setStep('review');
    }
  };

  const updateExtractedData = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      setExtractedData(parsed);
    } catch (err) {
      // Invalid JSON, keep current data
    }
  };

  if (!isOpen) return null;

  const modalClasses = isMinimized
    ? 'fixed bottom-4 right-4 w-80 h-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50'
    : 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

  return (
    <div className={modalClasses}>
      {isMinimized ? (
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <FiFile className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Processing Document
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FiMaximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Process Imported Data
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiMinimize2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            {step === 'select' && (
              <div className="text-center">
                <FiFile className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  Select Document from Drive
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose a PDF or image file to extract data from
                </p>
                <button
                  onClick={handleSelectFile}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Select File
                </button>
              </div>
            )}

            {step === 'processing' && (
              <div className="text-center">
                <FiLoader className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                <h4 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  Processing Document
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Extracting data using AI...
                </p>
              </div>
            )}

            {step === 'review' && extractedData && (
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Review Extracted Data ({dataType})
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    JSON Data
                  </label>
                  <textarea
                    value={JSON.stringify(extractedData, null, 2)}
                    onChange={(e) => updateExtractedData(e.target.value)}
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                    placeholder="Paste or edit JSON data here..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setStep('select')}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {step === 'saving' && (
              <div className="text-center">
                <FiLoader className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                <h4 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  Saving Data
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Please wait...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};