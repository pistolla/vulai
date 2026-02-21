import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { MerchDocument, ReturnOfGoodsData } from '@/models';
import { FiCheckCircle } from 'react-icons/fi';
import { fetchMerchDocuments, createMerchDocument, updateMerchDocument } from '@/store/correspondentThunk';

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

  const confirmReceipt = async (orderId: string) => {
    try {
      await dispatch(updateMerchDocument({
        id: orderId,
        updates: { status: 'delivered' }
      })).unwrap();
      alert('Order marked as delivered. Thank you!');
    } catch (error) {
      console.error('Failed to confirm receipt:', error);
      alert('Failed to confirm delivery. Please try again.');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'approved': return 'bg-green-50 text-green-700 border-green-100';
      case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'delivered': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Order History</h3>

      {userOrders.length === 0 ? (
        <p className="text-gray-600">No orders found</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {userOrders.map((order: MerchDocument) => {
            const orderData = order.data as any;
            const items = orderData.items || [];

            return (
              <div key={order.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order</span>
                      <h4 className="font-black text-gray-900 dark:text-white">#{order.id.slice(0, 8).toUpperCase()}</h4>
                    </div>
                    <p className="text-xs font-semibold text-gray-500">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Tracking Progress */}
                <div className="mb-8 px-2">
                  <div className="relative flex justify-between">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -translate-y-1/2 -z-10"></div>
                    {['pending_approval', 'approved', 'shipped', 'delivered'].map((step, idx) => {
                      const statuses = ['pending_approval', 'approved', 'shipped', 'delivered'];
                      const currentIdx = statuses.indexOf(order.status);
                      const stepIdx = statuses.indexOf(step);
                      const isActive = stepIdx <= currentIdx;

                      return (
                        <div key={step} className="flex flex-col items-center gap-2">
                          <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isActive ? 'bg-blue-600 scale-125 ring-4 ring-blue-50 dark:ring-blue-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                          <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                            {step === 'pending_approval' ? 'Requested' : step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Purchase Details</h5>
                    <div className="space-y-2">
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-600 dark:text-gray-400">{item.quantity}x {item.merchName}</span>
                          <span className="text-gray-900 dark:text-white">KSh {item.subtotal.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
                        <span className="text-xs font-black text-gray-900 dark:text-white uppercase">Total Paid</span>
                        <span className="text-sm font-black text-blue-600">KSh {orderData.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shipping To</h5>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 leading-relaxed">
                      {orderData.customerName}<br />
                      {orderData.shippingAddress}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center border-t border-gray-50 dark:border-gray-800 pt-6 gap-4">
                  <div className="flex gap-4">
                    {(order.status === 'shipped') && (
                      <button
                        onClick={() => confirmReceipt(order.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                      >
                        Confirm Receipt
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center">
                          <FiCheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Received</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
                      Need Help?
                    </button>
                    {(order.status === 'approved' || order.status === 'pending_approval') && (
                      <button
                        onClick={() => handleReturnRequest(order)}
                        className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                      >
                        {order.status === 'pending_approval' ? 'Cancel Order' : 'Return Items'}
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