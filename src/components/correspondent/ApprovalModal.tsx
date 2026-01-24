import React, { useState } from 'react';
import { FiCheck, FiX, FiX as CloseIcon } from 'react-icons/fi';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (comment?: string) => void;
  onReject: (comment?: string) => void;
  title: string;
  message: string;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  title,
  message,
}) => {
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleApprove = () => {
    onApprove(comment || undefined);
    setComment('');
    onClose();
  };

  const handleReject = () => {
    onReject(comment || undefined);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 shadow-xl w-full max-w-2xl flex flex-col min-h-screen sm:min-h-0 sm:max-h-[90vh] sm:rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Add a comment..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleReject}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiX className="w-4 h-4" />
              <span>Reject</span>
            </button>
            <button
              onClick={handleApprove}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiCheck className="w-4 h-4" />
              <span>Approve</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};