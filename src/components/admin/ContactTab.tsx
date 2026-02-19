import { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { Modal } from '@/components/common/Modal';
import { FiMail, FiCheck, FiX, FiEye } from 'react-icons/fi';

function ShimmerTableRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="space-x-2 flex justify-end">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-14"></div>
        </div>
      </td>
    </tr>
  );
}

export default function ContactTab({ messages, updateStatus, adminData }: any) {
  const { loading } = useAppSelector(s => s.admin);
  const displayMessages = messages.length > 0 ? messages : (adminData?.contactMessages || []);
  // Filter to show new messages by default (new status)
  const newMessages = displayMessages.filter((m: any) => m.status === 'new');
  const hasMessages = displayMessages.length > 0;
  const isLoading = loading.contactMessages;
  
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">New</span>;
      case 'read':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Read</span>;
      case 'replied':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Replied</span>;
      case 'archived':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Archived</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{status}</span>;
    }
  };

  const handleViewMessage = (message: any) => {
    setSelectedMessage(message);
    setShowModal(true);
    // Mark as read if new
    if (message.status === 'new') {
      updateStatus(message.id, 'read');
    }
  };

  const handleReply = () => {
    setShowModal(false);
    setShowReplyModal(true);
  };

  const handleSendReply = () => {
    if (selectedMessage && replyContent.trim()) {
      // In a real app, this would send an email via an API
      // For now, we'll just update the status and show a success message
      updateStatus(selectedMessage.id, 'replied');
      setShowReplyModal(false);
      setReplyContent('');
      setSelectedMessage(null);
    }
  };

  const handleMarkArchived = (messageId: string) => {
    updateStatus(messageId, 'archived');
    setShowModal(false);
  };

  return (
    <div id="content-contact" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Messages</h2>
          <p className="text-gray-600 dark:text-gray-400">View and respond to messages from the contact form.</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {newMessages.length} new message{newMessages.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">From</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <>
                <ShimmerTableRow />
                <ShimmerTableRow />
                <ShimmerTableRow />
                <ShimmerTableRow />
                <ShimmerTableRow />
              </>
            ) : hasMessages ? displayMessages.map((message: any) => (
              <tr key={message.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{message.name || message.senderName || 'Unknown'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">{message.email || message.senderEmail || 'No email'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">{message.subject || message.title || 'No subject'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300 truncate max-w-xs">{message.message || message.content || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(message.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {message.createdAt ? new Date(message.createdAt).toLocaleString() : message.date ? new Date(message.date).toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleViewMessage(message)} 
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3 inline-flex items-center"
                  >
                    <FiEye className="w-4 h-4 mr-1" /> View
                  </button>
                  {message.email && (
                    <a 
                      href={`mailto:${message.email}?subject=Re: ${message.subject || message.title || ''}`}
                      className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-3 inline-flex items-center"
                    >
                      <FiMail className="w-4 h-4 mr-1" /> Email
                    </a>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No messages found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Message Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Message Details">
        {selectedMessage && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
              <p className="text-gray-900 dark:text-white">
                {selectedMessage.name || selectedMessage.senderName || 'Unknown'}
                <span className="text-gray-500 ml-2">({selectedMessage.email || selectedMessage.senderEmail || 'No email'})</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
              <p className="text-gray-900 dark:text-white">{selectedMessage.subject || selectedMessage.title || 'No subject'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
              <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedMessage.message || selectedMessage.content || 'No message content'}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => handleMarkArchived(selectedMessage.id)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Archive
              </button>
              <button
                onClick={handleReply}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
              >
                <FiMail className="w-4 h-4 mr-2" /> Reply via Email
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reply Modal */}
      <Modal isOpen={showReplyModal} onClose={() => setShowReplyModal(false)} title="Reply via Email">
        {selectedMessage && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
              <p className="text-gray-900 dark:text-white">{selectedMessage.email || selectedMessage.senderEmail}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
              <p className="text-gray-900 dark:text-white">Re: {selectedMessage.subject || selectedMessage.title || 'Your message'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Response</label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Type your response here..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowReplyModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={!replyContent.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <FiCheck className="w-4 h-4 mr-2" /> Send & Mark Replied
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
