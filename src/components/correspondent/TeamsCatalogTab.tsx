import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { MerchDocument, DocumentType, InvoiceData, DeliveryNotesData, PurchaseOrderData } from '@/models';
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

  const handleApprove = async (id: string) => {
    const doc = documents.find((d: any) => d.id === id);
    if (!doc) return;

    if (doc.type === 'purchase_order') {
      // Special handling for PurchaseOrders - generate Invoice and DeliveryNotes
      await handlePurchaseOrderApproval(doc);
    } else {
      // Regular approval for other document types
      setApprovalModal({ isOpen: true, docId: id, action: 'approve' });
    }
  };

  const handlePurchaseOrderApproval = async (purchaseOrderDoc: MerchDocument) => {
    try {
      const purchaseOrderData = purchaseOrderDoc.data as PurchaseOrderData;

      // Get the original order to determine payment method
      const originalOrderId = (purchaseOrderData as any).originalOrderId;
      const originalOrder = documents.find((d: any) => d.id === originalOrderId);
      const orderData = originalOrder?.data as any;
      const paymentMethod = orderData?.paymentMethod || 'pay_on_delivery';

      // Calculate transport cost (fixed at KSh 500 for delivery)
      const transportCost = paymentMethod === 'pay_on_delivery' ? 500 : 0;
      const totalWithTransport = purchaseOrderData.total + transportCost;

      // Generate Invoice
      const invoiceData: InvoiceData = {
        orderId: purchaseOrderDoc.id, // Link to the purchase order
        invoiceNumber: `INV-${Date.now()}`,
        paymentStatus: paymentMethod === 'pay_on_delivery' ? 'pending' : 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
        items: purchaseOrderData.items.map(item => ({
          description: item.merchName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        })),
        total: totalWithTransport,
        tax: totalWithTransport * 0.16, // 16% VAT
        discount: 0,
      };

      // Add transport cost as a separate item if pay on delivery
      if (paymentMethod === 'pay_on_delivery') {
        invoiceData.items.push({
          description: 'Transport/Delivery Cost',
          quantity: 1,
          price: transportCost,
          subtotal: transportCost,
        });
      }

      await dispatch(createMerchDocument({
        type: 'invoice',
        merchType: 'team',
        status: paymentMethod === 'pay_on_order' ? 'completed' : 'pending_approval', // Send email for pay_on_order
        data: invoiceData,
      })).unwrap();

      if (paymentMethod === 'pay_on_delivery') {
        // Generate DeliveryNotes and ship goods
        const deliveryNotesData: DeliveryNotesData = {
          orderId: purchaseOrderDoc.id, // Link to the purchase order
          deliveryDate: new Date().toISOString().split('T')[0],
          deliveredBy: 'Team Coordinator',
          receivedBy: purchaseOrderData.supplierName,
          items: purchaseOrderData.items,
          notes: `Payment: Pay on Delivery (KSh ${totalWithTransport} total incl. transport). Invoice: ${invoiceData.invoiceNumber}. Goods shipped.`,
        };

        await dispatch(createMerchDocument({
          type: 'delivery_notes',
          merchType: 'team',
          status: 'completed',
          data: deliveryNotesData,
        })).unwrap();

        // Update PurchaseOrder status to approved
        await dispatch(approveMerchDocument({
          id: purchaseOrderDoc.id,
          comment: `Processed: Invoice ${invoiceData.invoiceNumber} generated, goods shipped with delivery notes`
        })).unwrap();

        alert('Purchase order processed successfully! Invoice generated and goods shipped with delivery notes.');
      } else {
        // Pay on order: Send invoice via email, wait for payment before shipping
        // Update PurchaseOrder status to approved
        await dispatch(approveMerchDocument({
          id: purchaseOrderDoc.id,
          comment: `Processed: Invoice ${invoiceData.invoiceNumber} sent via email. Awaiting payment before shipping.`
        })).unwrap();

        alert('Purchase order processed successfully! Invoice sent via email. Will ship after payment confirmation.');
      }
    } catch (error) {
      console.error('Failed to process purchase order:', error);
      alert('Failed to process purchase order. Please try again.');
    }
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
          documents={documents.filter((d: any) => d.merchType === 'team')}
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