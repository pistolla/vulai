import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { MerchDocument, DocumentType, MerchType, OrderData, InvoiceData, StockRecordData, TransportDocumentData, ReturnOfGoodsData, PurchaseOrderData, DeliveryNotesData, OrderItem } from '@/models';
import { FiSave, FiX } from 'react-icons/fi';

interface DocumentFormProps {
  document?: MerchDocument;
  type: DocumentType;
  merchType: MerchType;
  onSave: (doc: Omit<MerchDocument, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'approvals'>) => Promise<void>;
  onCancel: () => void;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  document,
  type,
  merchType,
  onSave,
  onCancel,
}) => {
  const { items: merchItems } = useAppSelector(state => state.merch);

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (document) {
      setFormData(document.data);
    } else {
      // Initialize based on type
      switch (type) {
        case 'order':
           setFormData({
             customerName: '',
             customerEmail: '',
             customerPhone: '',
             shippingAddress: '',
             items: [],
             total: 0,
             paymentMethod: 'pay_on_delivery',
             notes: '',
           } as OrderData);
           break;
        case 'invoice':
          setFormData({
            orderId: '',
            invoiceNumber: '',
            paymentStatus: 'pending',
            dueDate: '',
            items: [],
            total: 0,
            tax: 0,
            discount: 0,
          } as InvoiceData);
          break;
        case 'stock_record':
          setFormData({
            merchId: '',
            merchName: '',
            quantity: 0,
            type: 'in',
            reason: '',
            reference: '',
          } as StockRecordData);
          break;
        case 'transport_document':
          setFormData({
            orderId: '',
            carrier: '',
            trackingNumber: '',
            shippedAt: '',
            estimatedDelivery: '',
            status: 'shipped',
          } as TransportDocumentData);
          break;
        case 'return_of_goods':
          setFormData({
            orderId: '',
            items: [],
            reason: '',
            returnDate: '',
            refundAmount: 0,
            status: 'requested',
          } as ReturnOfGoodsData);
          break;
        case 'purchase_order':
          setFormData({
            supplierName: '',
            supplierEmail: '',
            supplierPhone: '',
            deliveryAddress: '',
            items: [],
            total: 0,
            expectedDeliveryDate: '',
            notes: '',
          } as PurchaseOrderData);
          break;
        case 'delivery_notes':
          setFormData({
            orderId: '',
            deliveryDate: '',
            deliveredBy: '',
            receivedBy: '',
            items: [],
            notes: '',
          } as DeliveryNotesData);
          break;
        case 'transport_document':
          setFormData({
            orderId: '',
            carrier: '',
            trackingNumber: '',
            shippedAt: '',
            estimatedDelivery: '',
            status: 'shipped',
          } as TransportDocumentData);
          break;
      }
    }
  }, [document, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave({
        type,
        merchType,
        status: document?.status || 'draft',
        data: formData,
      });
    } catch (error) {
      console.error('Failed to save document:', error);
      // TODO: Show error toast
    }
  };

  const addOrderItem = () => {
    setFormData({
      ...formData,
      items: [...(formData.items || []), { merchId: '', merchName: '', quantity: 1, price: 0, subtotal: 0 }],
    });
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const items = [...formData.items];
    items[index] = { ...items[index], [field]: value };
    if (field === 'merchId') {
      const merch = merchItems.find((m: any) => m.id === value);
      if (merch) {
        items[index].merchName = merch.name;
        items[index].price = merch.price;
        items[index].subtotal = items[index].quantity * merch.price;
      }
    } else if (field === 'quantity' || field === 'price') {
      items[index].subtotal = items[index].quantity * items[index].price;
    }
    setFormData({ ...formData, items, total: items.reduce((sum, item) => sum + item.subtotal, 0) });
  };

  const removeOrderItem = (index: number) => {
    const items = formData.items.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, items, total: items.reduce((sum: number, item: OrderItem) => sum + item.subtotal, 0) });
  };

  const renderForm = () => {
    switch (type) {
      case 'order':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name</label>
                <input
                  type="text"
                  value={formData.customerName || ''}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Email</label>
                <input
                  type="email"
                  value={formData.customerEmail || ''}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Phone</label>
                <input
                  type="tel"
                  value={formData.customerPhone || ''}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Address</label>
                <textarea
                  value={formData.shippingAddress || ''}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows={3}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Order Items</h3>
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Item
                </button>
              </div>
              <div className="space-y-2">
                {formData.items?.map((item: OrderItem, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg">
                    <select
                      value={item.merchId}
                      onChange={(e) => updateOrderItem(index, 'merchId', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md p-2"
                      required
                    >
                      <option value="">Select Merchandise</option>
                      {merchItems.filter((m: any) => m.type === merchType).map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                      className="w-20 border border-gray-300 rounded-md p-2"
                      min="1"
                      required
                    />
                    <span className="text-sm text-gray-600">KSh {item.subtotal}</span>
                    <button
                      type="button"
                      onClick={() => removeOrderItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <strong>Total: KSh {formData.total || 0}</strong>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
              <select
                value={formData.paymentMethod || 'pay_on_delivery'}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="pay_on_delivery">Pay on Delivery</option>
                <option value="pay_on_order">Pay on Order</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows={3}
              />
            </div>
          </div>
        );

      case 'invoice':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</label>
                <input
                  type="text"
                  value={formData.orderId || ''}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Number</label>
                <input
                  type="text"
                  value={formData.invoiceNumber || ''}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</label>
                <select
                  value={formData.paymentStatus || 'pending'}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Invoice Items</h3>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    items: [...(formData.items || []), { description: '', quantity: 1, price: 0, subtotal: 0 }],
                  })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Item
                </button>
              </div>
              <div className="space-y-2">
                {formData.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description || ''}
                      onChange={(e) => {
                        const items = [...formData.items];
                        items[index].description = e.target.value;
                        setFormData({ ...formData, items });
                      }}
                      className="flex-1 border border-gray-300 rounded-md p-2"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const items = [...formData.items];
                        items[index].quantity = parseInt(e.target.value);
                        items[index].subtotal = items[index].quantity * items[index].price;
                        setFormData({ ...formData, items, total: items.reduce((sum: number, item: any) => sum + item.subtotal, 0) });
                      }}
                      className="w-20 border border-gray-300 rounded-md p-2"
                      min="1"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => {
                        const items = [...formData.items];
                        items[index].price = parseFloat(e.target.value);
                        items[index].subtotal = items[index].quantity * items[index].price;
                        setFormData({ ...formData, items, total: items.reduce((sum: number, item: any) => sum + item.subtotal, 0) });
                      }}
                      className="w-24 border border-gray-300 rounded-md p-2"
                      min="0"
                      step="0.01"
                      required
                    />
                    <span className="text-sm text-gray-600">KSh {item.subtotal}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const items = formData.items.filter((_: any, i: number) => i !== index);
                        setFormData({ ...formData, items, total: items.reduce((sum: number, item: any) => sum + item.subtotal, 0) });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tax</label>
                  <input
                    type="number"
                    value={formData.tax || 0}
                    onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount</label>
                  <input
                    type="number"
                    value={formData.discount || 0}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="text-right">
                  <strong>Total: KSh {formData.total || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        );

      case 'stock_record':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Merchandise</label>
                <select
                  value={formData.merchId || ''}
                  onChange={(e) => {
                    const merch = merchItems.find((m: any) => m.id === e.target.value);
                    setFormData({
                      ...formData,
                      merchId: e.target.value,
                      merchName: merch?.name || '',
                    });
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  <option value="">Select Merchandise</option>
                  {merchItems.filter((m: any) => m.type === merchType).map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <select
                  value={formData.type || 'in'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="in">Stock In</option>
                  <option value="out">Stock Out</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity || 0}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reference</label>
                <input
                  type="text"
                  value={formData.reference || ''}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Order ID, etc."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
              <textarea
                value={formData.reason || ''}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows={3}
                required
              />
            </div>
          </div>
        );

      case 'transport_document':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</label>
                <input
                  type="text"
                  value={formData.orderId || ''}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Carrier</label>
                <input
                  type="text"
                  value={formData.carrier || ''}
                  onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tracking Number</label>
                <input
                  type="text"
                  value={formData.trackingNumber || ''}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select
                  value={formData.status || 'shipped'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="shipped">Shipped</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shipped At</label>
                <input
                  type="datetime-local"
                  value={formData.shippedAt || ''}
                  onChange={(e) => setFormData({ ...formData, shippedAt: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Delivery</label>
                <input
                  type="datetime-local"
                  value={formData.estimatedDelivery || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'return_of_goods':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</label>
                <input
                  type="text"
                  value={formData.orderId || ''}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Return Date</label>
                <input
                  type="date"
                  value={formData.returnDate || ''}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select
                  value={formData.status || 'requested'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="requested">Requested</option>
                  <option value="approved">Approved</option>
                  <option value="received">Received</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Refund Amount</label>
                <input
                  type="number"
                  value={formData.refundAmount || 0}
                  onChange={(e) => setFormData({ ...formData, refundAmount: parseFloat(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Return Items</h3>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    items: [...(formData.items || []), { merchId: '', merchName: '', quantity: 1, condition: 'new' }],
                  })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Item
                </button>
              </div>
              <div className="space-y-2">
                {formData.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg">
                    <input
                      type="text"
                      placeholder="Merchandise Name"
                      value={item.merchName || ''}
                      onChange={(e) => {
                        const items = [...formData.items];
                        items[index].merchName = e.target.value;
                        setFormData({ ...formData, items });
                      }}
                      className="flex-1 border border-gray-300 rounded-md p-2"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const items = [...formData.items];
                        items[index].quantity = parseInt(e.target.value);
                        setFormData({ ...formData, items });
                      }}
                      className="w-20 border border-gray-300 rounded-md p-2"
                      min="1"
                      required
                    />
                    <select
                      value={item.condition || 'new'}
                      onChange={(e) => {
                        const items = [...formData.items];
                        items[index].condition = e.target.value;
                        setFormData({ ...formData, items });
                      }}
                      className="w-32 border border-gray-300 rounded-md p-2"
                    >
                      <option value="new">New</option>
                      <option value="used">Used</option>
                      <option value="damaged">Damaged</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const items = formData.items.filter((_: any, i: number) => i !== index);
                        setFormData({ ...formData, items });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
              <textarea
                value={formData.reason || ''}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows={3}
                required
              />
            </div>
          </div>
        );

      case 'purchase_order':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier Name</label>
                <input
                  type="text"
                  value={formData.supplierName || ''}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier Email</label>
                <input
                  type="email"
                  value={formData.supplierEmail || ''}
                  onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier Phone</label>
                <input
                  type="tel"
                  value={formData.supplierPhone || ''}
                  onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Delivery Date</label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate || ''}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Address</label>
              <textarea
                value={formData.deliveryAddress || ''}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows={3}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Purchase Items</h3>
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Item
                </button>
              </div>
              <div className="space-y-2">
                {formData.items?.map((item: OrderItem, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg">
                    <select
                      value={item.merchId}
                      onChange={(e) => updateOrderItem(index, 'merchId', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md p-2"
                      required
                    >
                      <option value="">Select Merchandise</option>
                      {merchItems.filter((m: any) => m.type === merchType).map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                      className="w-20 border border-gray-300 rounded-md p-2"
                      min="1"
                      required
                    />
                    <span className="text-sm text-gray-600">KSh {item.subtotal}</span>
                    <button
                      type="button"
                      onClick={() => removeOrderItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <strong>Total: KSh {formData.total || 0}</strong>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows={3}
              />
            </div>
          </div>
        );

      case 'delivery_notes':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</label>
                <input
                  type="text"
                  value={formData.orderId || ''}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Date</label>
                <input
                  type="date"
                  value={formData.deliveryDate || ''}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Delivered By</label>
                <input
                  type="text"
                  value={formData.deliveredBy || ''}
                  onChange={(e) => setFormData({ ...formData, deliveredBy: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Received By</label>
                <input
                  type="text"
                  value={formData.receivedBy || ''}
                  onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Delivered Items</h3>
              <div className="space-y-2">
                {formData.items?.map((item: OrderItem, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg">
                    <input
                      type="text"
                      placeholder="Merchandise Name"
                      value={item.merchName || ''}
                      onChange={(e) => {
                        const items = [...formData.items];
                        items[index].merchName = e.target.value;
                        setFormData({ ...formData, items });
                      }}
                      className="flex-1 border border-gray-300 rounded-md p-2"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const items = [...formData.items];
                        items[index].quantity = parseInt(e.target.value);
                        setFormData({ ...formData, items });
                      }}
                      className="w-20 border border-gray-300 rounded-md p-2"
                      min="1"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const items = formData.items.filter((_: any, i: number) => i !== index);
                        setFormData({ ...formData, items });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    items: [...(formData.items || []), { merchId: '', merchName: '', quantity: 1, price: 0, subtotal: 0 }],
                  })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Item
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return <div>Form not implemented for {type}</div>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {document ? 'Edit' : 'Create'} {type.replace('_', ' ')}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {renderForm()}

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <FiSave className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </form>
    </div>
  );
};