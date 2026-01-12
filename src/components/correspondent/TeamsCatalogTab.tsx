import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { MerchDocument, DocumentType } from '@/models';
import { DocumentList } from './DocumentList';
import { DocumentForm } from './DocumentForm';
import { ApprovalModal } from './ApprovalModal';
import { DocumentViewModal } from './DocumentViewModal';
import {
  fetchMerchDocuments,
  createMerchDocument,
  updateMerchDocument,
  deleteMerchDocument,
  approveMerchDocument,
  rejectMerchDocument,
} from '@/store/correspondentThunk';

export const TeamsCatalogTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { documents, loading } = useAppSelector(state => state.merchDocuments);
  const { items: merchItems } = useAppSelector(state => state.merch);

  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<MerchDocument | undefined>();
  const [formType, setFormType] = useState<DocumentType>('order');
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    docId: string;
    action: 'approve' | 'reject';
  }>({ isOpen: false, docId: '', action: 'approve' });

  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    document: MerchDocument | null;
  }>({ isOpen: false, document: null });

  useEffect(() => {
    dispatch(fetchMerchDocuments());
  }, [dispatch]);

  const handleCreate = (type: DocumentType) => {
    setFormType(type);
    setEditingDoc(undefined);
    setShowForm(true);
  };

  const handleEdit = (doc: MerchDocument) => {
    setEditingDoc(doc);
    setFormType(doc.type);
    setShowForm(true);
  };

  const handleSave = async (docData: Omit<MerchDocument, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'approvals'>) => {
    try {
      if (editingDoc) {
        await dispatch(updateMerchDocument({ id: editingDoc.id, updates: docData })).unwrap();
      } else {
        await dispatch(createMerchDocument(docData)).unwrap();
      }
      setShowForm(false);
      setEditingDoc(undefined);
    } catch (error) {
      console.error('Failed to save document:', error);
      alert('Failed to save document. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await dispatch(deleteMerchDocument(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete document:', error);
        // TODO: Show error toast
      }
    }
  };

  const handleApprove = (id: string) => {
    setApprovalModal({ isOpen: true, docId: id, action: 'approve' });
  };

  const handleReject = (id: string) => {
    setApprovalModal({ isOpen: true, docId: id, action: 'reject' });
  };

  const handleApprovalConfirm = async (comment?: string) => {
    try {
      if (approvalModal.action === 'approve') {
        await dispatch(approveMerchDocument({ id: approvalModal.docId, comment })).unwrap();
      } else {
        await dispatch(rejectMerchDocument({ id: approvalModal.docId, comment })).unwrap();
      }
      setApprovalModal({ isOpen: false, docId: '', action: 'approve' });
    } catch (error) {
      console.error('Failed to process approval:', error);
      // TODO: Show error toast
    }
  };

  const handleView = (doc: MerchDocument) => {
    setViewModal({ isOpen: true, document: doc });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div id="content-teams-catalog" className="slide-in-left">
      {showForm ? (
        <DocumentForm
          document={editingDoc}
          type={formType}
          merchType="team"
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <DocumentList
          documents={documents.filter(d => d.merchType === 'team')}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onApprove={handleApprove}
          onReject={handleReject}
          onView={handleView}
        />
      )}

      <ApprovalModal
        isOpen={approvalModal.isOpen}
        onClose={() => setApprovalModal({ isOpen: false, docId: '', action: 'approve' })}
        onApprove={(comment) => handleApprovalConfirm(comment)}
        onReject={(comment) => handleApprovalConfirm(comment)}
        title={`${approvalModal.action === 'approve' ? 'Approve' : 'Reject'} Document`}
        message={`Are you sure you want to ${approvalModal.action} this document?`}
      />

      {viewModal.document && (
        <DocumentViewModal
          document={viewModal.document}
          isOpen={viewModal.isOpen}
          onClose={() => setViewModal({ isOpen: false, document: null })}
        />
      )}
    </div>
  );
}