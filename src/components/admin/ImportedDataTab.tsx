import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchImportedData, processImportedDataT, saveProcessedDocumentT } from '@/store/adminThunk';
import { ImportedData } from '@/models';
import { FiCheckCircle, FiClock, FiExternalLink } from 'react-icons/fi';
import { ProcessModal } from './ProcessModal';

export const ImportedDataTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const importedData = useAppSelector(s => s.admin.importedData || []);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    importedDataId: string;
    driveLink: string;
    dataType: string;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchImportedData());
  }, [dispatch]);

  const handleProcess = (item: ImportedData) => {
    setModalState({
      isOpen: true,
      importedDataId: item.id,
      driveLink: item.driveLink,
      dataType: item.dataType,
    });
  };

  const handleSaveProcessedDocument = async (extractedData: any, fileId: string) => {
    if (!modalState) return;

    try {
      await dispatch(saveProcessedDocumentT({
        importedDataId: modalState.importedDataId,
        googleDriveFileId: fileId,
        extractedData,
      })).unwrap();

      // Mark as processed
      await dispatch(processImportedDataT(modalState.importedDataId)).unwrap();

      // Refresh data
      dispatch(fetchImportedData());
      setModalState(null);
    } catch (error) {
      console.error('Failed to save:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setModalState(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white">Imported Data Submissions</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {importedData.length} submissions
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Correspondent</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">University</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">File Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {importedData.map((item: ImportedData) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.correspondentName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.correspondentEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.universityName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.dataType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.fileExtension.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'processed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                      {item.status === 'processed' ? (
                        <FiCheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <FiClock className="w-3 h-3 mr-1" />
                      )}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.dateOfUpload).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <a
                        href={item.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                      {item.status === 'pending' && (
                        <button
                          onClick={() => handleProcess(item)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <FiCheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {importedData.length === 0 && (
          <div className="text-center py-12">
            <FiClock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No submissions</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No data import requests have been submitted yet.</p>
          </div>
        )}
      </div>

      {modalState && (
        <ProcessModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          importedDataId={modalState.importedDataId}
          driveLink={modalState.driveLink}
          dataType={modalState.dataType}
          onSave={handleSaveProcessedDocument}
        />
      )}
    </div>
  );
};