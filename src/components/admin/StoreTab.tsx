import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { Modal } from '@/components/common/Modal';
import { FiAlertTriangle, FiPackage, FiTrendingUp, FiDollarSign, FiEdit2, FiSave, FiX, FiCheckCircle } from 'react-icons/fi';
import { createMerchDocument, updateMerchDocument, saveBookkeepingDocument } from '@/store/correspondentThunk';

export default function StoreTab({ adminData }: any) {
  const dispatch = useAppDispatch();
  const { items: merchItems } = useAppSelector(state => state.merch);
  const { documents: merchDocuments } = useAppSelector(state => state.merchDocuments);
  const orders = merchDocuments.filter((d: any) => d.type === 'order');

  const [editingItem, setEditingItem] = useState<any>(null);
  const [stockQuantities, setStockQuantities] = useState<Record<string, number>>({});
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // Initialize stock quantities from merch items
  useEffect(() => {
    const quantities: Record<string, number> = {};
    merchItems.forEach((item: any) => {
      quantities[item.id] = item.quantity || item.stockQuantity || 0;
    });
    setStockQuantities(quantities);
  }, [merchItems]);

  // Calculate analytics
  const totalItems = merchItems.reduce((sum: number, item: any) => sum + (stockQuantities[item.id] || 0), 0);
  const totalValue = merchItems.reduce((sum: number, item: any) => sum + ((stockQuantities[item.id] || 0) * (item.price || 0)), 0);
  const lowStockItems = merchItems.filter((item: any) => (stockQuantities[item.id] || 0) <= lowStockThreshold && (stockQuantities[item.id] || 0) > 0);
  const outOfStockItems = merchItems.filter((item: any) => (stockQuantities[item.id] || 0) === 0);

  // Calculate orders analytics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o: any) => o.status === 'pending_approval').length;
  const totalRevenue = orders
    .filter((o: any) => o.status === 'delivered' || o.status === 'shipped')
    .reduce((sum: number, o: any) => sum + (o.total || o.amount || 0), 0);

  const handleSaveQuantity = (itemId: string) => {
    // In a real app, this would update the database
    setEditingItem(null);
  };

  const handleDispatch = async (order: any) => {
    try {
      const orderData = order.data || {};
      const items = order.items || orderData.items || [];

      // 1. Create stock records for unil items
      for (const item of items) {
        const merch = merchItems.find((m: any) => m.id === item.merchId);
        if (merch && merch.type === 'unil') {
          const stockData = {
            merchId: item.merchId,
            merchName: item.merchName,
            quantity: item.quantity,
            type: 'out' as const,
            reason: `Fulfillment for order ${order.id}`,
            reference: order.id,
            size: item.size
          };

          await dispatch(createMerchDocument({
            type: 'stock_record',
            merchType: 'unil',
            status: 'completed',
            data: stockData
          })).unwrap();

          // Structured Bookkeeping: Record Stock Record
          await dispatch(saveBookkeepingDocument({
            orderId: order.id,
            docType: 'stock_record' as any,
            data: stockData
          })).unwrap();
        }
      }

      // 2. Update order status to shipped
      await dispatch(updateMerchDocument({
        id: order.id,
        updates: { status: 'shipped' }
      })).unwrap();

      // 3. Structured Bookkeeping: Record Stock Records and Delivery Notes
      const deliveryNotesData = {
        orderId: order.id,
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveredBy: 'Main Warehouse',
        receivedBy: orderData.customerName || 'Customer',
        items: items,
        notes: `Shipped from university central store. Related to order #${order.id}`
      };

      await dispatch(saveBookkeepingDocument({
        orderId: order.id,
        docType: 'delivery_notes' as any,
        data: deliveryNotesData
      })).unwrap();

      // Also record transport document (Simulated tracking)
      const transportData = {
        orderId: order.id,
        carrier: 'Standard Uni Courier',
        trackingNumber: `TRK-${Date.now()}`,
        shippedAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'shipped'
      };

      await dispatch(saveBookkeepingDocument({
        orderId: order.id,
        docType: 'transport_document' as any,
        data: transportData
      })).unwrap();

      alert('Order dispatched successfully! Bookkeeping records (Stock, Delivery, Transport) created.');
    } catch (error) {
      console.error('Failed to dispatch order:', error);
      alert('Failed to dispatch order. Please try again.');
    }
  };

  const unilMerch = merchItems.filter((m: any) => m.type === 'unil');
  const awaitingFulfillment = orders.filter((o: any) => o.status === 'approved');

  return (
    <div id="content-store" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Store Stock</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage inventory, track stock levels, and view analytics.</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Low stock threshold:</label>
          <input
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
            min={1}
          />
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Stock</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
            </div>
            <FiPackage className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Stock Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">KSh {totalValue.toLocaleString()}</p>
            </div>
            <FiDollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{lowStockItems.length}</p>
            </div>
            <FiAlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{outOfStockItems.length}</p>
            </div>
            <FiAlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Orders Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingOrders}</p>
            </div>
            <FiAlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">KSh {totalRevenue.toLocaleString()}</p>
            </div>
            <FiDollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Fulfillment Section */}
      <div className="mb-12">
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100/50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <FiPackage className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          Awaiting Fulfillment
          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-black">
            {awaitingFulfillment.length}
          </span>
        </h3>

        {awaitingFulfillment.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {awaitingFulfillment.map((order: any) => (
              <div key={order.id} className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{order.data?.customerName || 'Guest Customer'}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Order ID: #{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => handleDispatch(order)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  >
                    Dispatch Goods
                  </button>
                </div>
                <div className="space-y-2 mb-4">
                  {(order.data?.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 p-2 rounded-lg border border-gray-100 dark:border-gray-800/50">
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{item.quantity}x</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.merchName}</span>
                      </div>
                      <span className="text-[10px] bg-white dark:bg-gray-900 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-800 text-gray-500">{item.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50/50 dark:bg-gray-800/20 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-12 text-center">
            <FiPackage className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No orders awaiting fulfillment</p>
          </div>
        )}
      </div>

      {/* Depletion Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiAlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
            Inventory Alerts
          </h3>
          <div className="space-y-2">
            {outOfStockItems.map((item: any) => (
              <div key={item.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FiAlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                  <span className="text-red-700 dark:text-red-300 font-medium">{item.name}</span>
                </div>
                <span className="text-red-600 dark:text-red-400 text-sm">Out of stock</span>
              </div>
            ))}
            {lowStockItems.map((item: any) => (
              <div key={item.id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FiAlertTriangle className="w-5 h-5 text-yellow-500 mr-3" />
                  <span className="text-yellow-700 dark:text-yellow-300 font-medium">{item.name}</span>
                </div>
                <span className="text-yellow-600 dark:text-yellow-400 text-sm">Only {stockQuantities[item.id]} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Merchandise Items with Stock */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Inventory Management</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {unilMerch.length > 0 ? unilMerch.map((item: any) => {
                  const quantity = stockQuantities[item.id] || 0;
                  const isLowStock = quantity <= lowStockThreshold && quantity > 0;
                  const isOutOfStock = quantity === 0;

                  return (
                    <tr key={item.id} className={isOutOfStock ? 'bg-red-50 dark:bg-red-900/10' : isLowStock ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover mr-4" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        KSh {item.price?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingItem === item.id ? (
                          <input
                            type="number"
                            value={stockQuantities[item.id] || 0}
                            onChange={(e) => setStockQuantities({ ...stockQuantities, [item.id]: Number(e.target.value) })}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                            min={0}
                          />
                        ) : (
                          <span className="text-sm text-gray-900 dark:text-white">{quantity}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Low Stock</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">In Stock</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingItem === item.id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleSaveQuantity(item.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                            >
                              <FiSave className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingItem(item.id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No merchandise found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
