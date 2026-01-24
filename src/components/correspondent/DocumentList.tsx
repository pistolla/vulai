import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { MerchDocument, DocumentType, DocumentStatus } from '@/models';
import { FiPlus, FiEdit, FiTrash, FiCheck, FiX, FiEye } from 'react-icons/fi';

interface DocumentListProps {
  documents: MerchDocument[];
  onCreate: (type: DocumentType) => void;
  onEdit: (doc: MerchDocument) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (doc: MerchDocument) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onCreate,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onView,
}) => {
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all');

  const filteredDocuments = documents.filter(doc => {
    if (filterType !== 'all' && doc.type !== filterType) return false;
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    return true;
  });

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const documentTypes: DocumentType[] = ['order', 'invoice', 'stock_record', 'transport_document', 'return_of_goods', 'purchase_order', 'delivery_notes'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Merchandise Documents</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage orders, invoices, and records</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {documentTypes.map(type => (
            <button
              key={type}
              onClick={() => onCreate(type)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span className="capitalize">{type.replace('_', ' ')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as DocumentType | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          {documentTypes.map(type => (
            <option key={type} value={type} className="capitalize">
              {type.replace('_', ' ')}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as DocumentStatus | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Approvals
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm font-medium text-gray-900 dark:text-white">
                      {doc.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                      {doc.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {doc.approvals.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => onView(doc)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    {doc.status === 'draft' && (
                      <button
                        onClick={() => onEdit(doc)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                    )}
                    {doc.status === 'pending_approval' && (
                      <>
                        <button
                          onClick={() => onApprove(doc.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onReject(doc.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {doc.status === 'draft' && (
                      <button
                        onClick={() => onDelete(doc.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <FiTrash className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No documents found</p>
          </div>
        )}
      </div>
    </div>
  );
};