import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { MerchDocument, OrderData, StockRecordData, PurchaseOrderData, InvoiceData, InvoiceItem } from '@/models';
import { DocumentList } from '../correspondent/DocumentList';
import { DocumentForm } from '../correspondent/DocumentForm';
import { ApprovalModal } from '../correspondent/ApprovalModal';
import { DocumentViewModal } from '../correspondent/DocumentViewModal';
import {
  fetchMerchDocuments,
  createMerchDocument,
  updateMerchDocument,
  approveMerchDocument,
  rejectMerchDocument,
} from '@/store/correspondentThunk';

export default function ManagerTab({ adminData }: any) {
  const dispatch = useAppDispatch();
  const { documents, loading } = useAppSelector(state => state.merchDocuments);
  const { items: merchItems } = useAppSelector(state => state.merch);

  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<MerchDocument | undefined>();
  const [formType, setFormType] = useState<'order' | 'stock_record' | 'purchase_order'>('order');
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
    setFormType(type as any);
    setEditingDoc(undefined);
    setShowForm(true);
  };

  const handleEdit = (doc: MerchDocument) => {
    setEditingDoc(doc);
    setFormType(doc.type as any);
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

  const handleApprove = async (id: string) => {
    const doc = documents.find((d: MerchDocument) => d.id === id);
    if (!doc) return;

    if (doc.type === 'return_of_goods') {
      // Special handling for returns
      await handleReturnApproval(doc);
    } else if (doc.type === 'order') {
      // Regular order approval
      await handleOrderApproval(doc);
    }
  };

  const handleOrderApproval = async (doc: MerchDocument) => {

    try {
      // Process the order: separate items into unil and team items
      const orderData = doc.data as OrderData;
      const unilItems = [];
      const teamItems = [];

      for (const item of orderData.items) {
        const merch = merchItems.find((m: any) => m.id === item.merchId);
        if (merch) {
          if (merch.type === 'unil') {
            unilItems.push(item);
          } else if (merch.type === 'team') {
            teamItems.push(item);
          }
        }
      }

      // Create StockRecord documents for unil items
      for (const item of unilItems) {
        const stockRecordData: StockRecordData = {
          merchId: item.merchId,
          merchName: item.merchName,
          quantity: item.quantity,
          type: 'out', // Stock out for sales
          reason: `Order fulfillment for order ${doc.id}`,
          reference: doc.id,
          size: item.size
        };

        await dispatch(createMerchDocument({
          type: 'stock_record',
          merchType: 'unil',
          status: 'completed',
          data: stockRecordData,
        })).unwrap();
      }

      // Create PurchaseOrder documents for team items
      if (teamItems.length > 0) {
        const purchaseOrderData: PurchaseOrderData = {
          supplierName: 'University Team Coordinator',
          supplierEmail: 'teams@university.edu', // Placeholder
          supplierPhone: '',
          deliveryAddress: 'University Sports Complex',
          items: teamItems,
          total: teamItems.reduce((sum, item) => sum + item.subtotal, 0),
          expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          notes: `Generated from order ${doc.id}`,
          originalOrderId: doc.id, // Store reference to original order
        } as any;

        await dispatch(createMerchDocument({
          type: 'purchase_order',
          merchType: 'team',
          status: 'pending_approval',
          data: purchaseOrderData,
        })).unwrap();
      }

      // Create Invoice document
      const invoiceData: InvoiceData = {
        orderId: doc.id,
        invoiceNumber: `INV-${doc.id.slice(0, 8).toUpperCase()}`,
        paymentStatus: (orderData.paymentMethod === 'card' || orderData.paymentMethod === 'paypal' || orderData.paymentMethod === 'mobile') ? 'paid' : 'pending',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days due
        items: orderData.items.map(item => ({
          description: item.merchName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          size: item.size
        })),
        total: orderData.total,
        tax: orderData.total * 0.16, // Assuming 16% VAT
      };

      await dispatch(createMerchDocument({
        type: 'invoice',
        merchType: 'unil',
        status: 'completed',
        data: invoiceData,
      })).unwrap();

      // Update the order status to approved
      await dispatch(approveMerchDocument({ id: doc.id, comment: 'Order processed, fulfilled, and invoiced' })).unwrap();

      alert('Order approved and processed successfully!');
    } catch (error) {
      console.error('Failed to process order approval:', error);
      alert('Failed to process order. Please try again.');
    }
  };

  const handleReturnApproval = async (returnDoc: MerchDocument) => {
    try {
      const returnData = returnDoc.data as any;

      // Determine routing based on item types
      const teamItems = [];
      const unilItems = [];

      for (const item of returnData.items) {
        const merch = merchItems.find((m: any) => m.id === item.merchId);
        if (merch) {
          if (merch.type === 'team') {
            teamItems.push(item);
          } else if (merch.type === 'unil') {
            unilItems.push(item);
          }
        }
      }

      // Create routing documents
      if (teamItems.length > 0) {
        // Route to TeamsCatalog
        await dispatch(createMerchDocument({
          type: 'return_of_goods',
          merchType: 'team',
          status: 'pending_approval',
          data: {
            ...returnData,
            items: teamItems,
            notes: `Routed from Unil: ${returnData.notes}`,
          },
        })).unwrap();
      }

      if (unilItems.length > 0) {
        // Route to stock manager and adjust stock
        for (const item of unilItems) {
          const stockRecordData: StockRecordData = {
            merchId: item.merchId,
            merchName: item.merchName,
            quantity: item.quantity,
            type: 'in', // Stock back in for returns
            reason: `Return of goods for return request ${returnDoc.id}`,
            reference: returnDoc.id,
            size: item.size
          };

          await dispatch(createMerchDocument({
            type: 'stock_record',
            merchType: 'unil',
            status: 'completed',
            data: stockRecordData,
          })).unwrap();
        }

        await dispatch(createMerchDocument({
          type: 'return_of_goods',
          merchType: 'unil',
          status: 'completed', // Stock manager handles directly
          data: {
            ...returnData,
            items: unilItems,
            notes: `Processed and stock adjusted by manager: ${returnData.notes}`,
          },
        })).unwrap();
      }

      // Update the return request status
      await dispatch(approveMerchDocument({
        id: returnDoc.id,
        comment: `Return processed: ${teamItems.length} team items routed to TeamsCatalog, ${unilItems.length} unil items sent to stock manager`
      })).unwrap();

      alert('Return request processed successfully! Items have been routed to appropriate handlers.');
    } catch (error) {
      console.error('Failed to process return:', error);
      alert('Failed to process return request. Please try again.');
    }
  };

  const handleReject = (id: string) => {
    setApprovalModal({ isOpen: true, docId: id, action: 'reject' });
  };

  const handleApprovalConfirm = async (comment?: string) => {
    try {
      if (approvalModal.action === 'approve') {
        await handleApprove(approvalModal.docId);
      } else {
        await dispatch(rejectMerchDocument({ id: approvalModal.docId, comment })).unwrap();
      }
      setApprovalModal({ isOpen: false, docId: '', action: 'approve' });
    } catch (error) {
      console.error('Failed to process approval:', error);
      alert('Failed to process approval. Please try again.');
    }
  };

  const handleView = (doc: MerchDocument) => {
    setViewModal({ isOpen: true, document: doc });
  };

  // Filter to show unil orders and returns
  const unilDocuments = documents.filter((d: MerchDocument) =>
    d.merchType === 'unil' &&
    (d.type === 'order' || d.type === 'return_of_goods')
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div id="content-manager" className="slide-in-left">
      {showForm ? (
        <DocumentForm
          document={editingDoc}
          type={formType}
          merchType="unil"
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <DocumentList
          documents={unilDocuments}
          onCreate={() => { }} // Disable create for managers
          onEdit={() => { }} // Disable edit for orders
          onDelete={() => { }} // Disable delete for orders
          onApprove={handleApprove}
          onReject={handleReject}
          onView={handleView}
          allowCreate={false}
        />
      )}

      <ApprovalModal
        isOpen={approvalModal.isOpen}
        onClose={() => setApprovalModal({ isOpen: false, docId: '', action: 'approve' })}
        onApprove={(comment) => handleApprovalConfirm(comment)}
        onReject={(comment) => handleApprovalConfirm(comment)}
        title={`${approvalModal.action === 'approve' ? 'Approve' : 'Reject'} Order`}
        message={`Are you sure you want to ${approvalModal.action} this order?`}
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