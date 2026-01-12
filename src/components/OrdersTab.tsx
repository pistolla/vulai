import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { fetchMerchDocuments, createMerchDocument } from '@/store/correspondentThunk';
import { MerchDocument, ReturnOfGoodsData } from '@/models';

export default function OrdersTab() {
  const dispatch = useAppDispatch();
  const { documents } = useAppSelector(state => state.merchDocuments);
  const { user } = useAppSelector(state => state.auth);
  const [returnModal, setReturnModal] = useState<{
    isOpen: boolean;
    order: MerchDocument | null;
  }>({ isOpen: false, order: null });

  useEffect(() => {
    dispatch(fetchMerchDocuments());
  }, [dispatch]);

  // Filter orders for current user
  const userOrders = documents.filter((doc: MerchDocument) =>
    doc.type === 'order' &&
    doc.merchType === 'unil' &&
    (doc.data as any).customerEmail === user?.email
  );

  const handleReturnRequest = (order: MerchDocument) => {
    setReturnModal({ isOpen: true, order });
  };

  const submitReturnRequest = async (returnData: {
    items: any[];
    reason: string;
    returnType: 'cancel' | 'return';
  }) => {
    if (!returnModal.order) return;

    try {
      const returnOfGoodsData: ReturnOfGoodsData = {
        orderId: returnModal.order.id,
        items: returnData.items,
        reason: returnData.reason,
        returnDate: new Date().toISOString().split('T')[0],
        refundAmount: returnData.items.reduce((sum, item) => sum + item.subtotal, 0),
        status: 'requested',
      };

      await dispatch(createMerchDocument({
        type: 'return_of_goods',
        merchType: 'unil',
        status: 'pending_approval',
        data: returnOfGoodsData,
      })).unwrap();

      setReturnModal({ isOpen: false, order: null });
      alert('Return request submitted successfully!');
    } catch (error) {
      console.error('Failed to submit return request:', error);
      alert('Failed to submit return request. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Order History</h3>

      {userOrders.length === 0 ? (
        <p className="text-gray-600">No orders found</p>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order: MerchDocument) => {
            const orderData = order.data as any;
            return (
              <div key={order.id} className="border border-gray-200 rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">Order #{order.id}</h4>
                    <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm capitalize ${
                    order.status === 'approved' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Items: {orderData.items?.map((item: any) => item.merchName).join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Payment: {orderData.paymentMethod?.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total: KSh {orderData.total?.toFixed(2)}</span>
                  <div className="space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      View Details
                    </button>
                    {order.status === 'approved' && (
                      <button
                        onClick={() => handleReturnRequest(order)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Return/Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Request Modal */}
      {returnModal.isOpen && returnModal.order && (
        <ReturnModal
          order={returnModal.order}
          onSubmit={submitReturnRequest}
          onClose={() => setReturnModal({ isOpen: false, order: null })}
        />
      )}
    </div>
  );
}

// Return Request Modal Component
function ReturnModal({ order, onSubmit, onClose }: {
  order: MerchDocument;
  onSubmit: (data: { items: any[]; reason: string; returnType: 'cancel' | 'return' }) => void;
  onClose: () => void;
}) {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [reason, setReason] = useState('');
  const [returnType, setReturnType] = useState<'cancel' | 'return'>('return');

  const orderData = order.data as any;
  const availableItems = orderData.items || [];

  const handleItemToggle = (item: any) => {
    setSelectedItems(prev =>
      prev.find(i => i.merchId === item.merchId)
        ? prev.filter(i => i.merchId !== item.merchId)
        : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0 || !reason.trim()) {
      alert('Please select items and provide a reason');
      return;
    }
    onSubmit({ items: selectedItems, reason, returnType });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Return/Cancel Request</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Request Type</label>
            <div className="space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="return"
                  checked={returnType === 'return'}
                  onChange={(e) => setReturnType(e.target.value as 'return')}
                  className="mr-2"
                />
                Return Items
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="cancel"
                  checked={returnType === 'cancel'}
                  onChange={(e) => setReturnType(e.target.value as 'cancel')}
                  className="mr-2"
                />
                Cancel Order
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Items</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableItems.map((item: any, index: number) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.some(i => i.merchId === item.merchId)}
                    onChange={() => handleItemToggle(item)}
                    className="mr-2"
                  />
                  <span className="text-sm">{item.merchName} (Qty: {item.quantity})</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              rows={3}
              placeholder="Please provide a reason for the return/cancellation"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}