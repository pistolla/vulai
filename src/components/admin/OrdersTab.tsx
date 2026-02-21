import { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { FiPackage } from 'react-icons/fi';

function ShimmerTableRow() {
  return (
    <tr className="animate-pulse border-b border-gray-100 dark:border-gray-800">
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-32"></div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-20"></div>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="h-5 bg-blue-100/50 dark:bg-blue-900/20 rounded-full w-16"></div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-28"></div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-24 ml-auto"></div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap text-right">
        <div className="space-x-2 flex justify-end">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-20"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-18"></div>
        </div>
      </td>
    </tr>
  );
}

export default function OrdersTab({ orders, updateStatus, adminData }: any) {
  const { loading } = useAppSelector(s => s.admin);
  const displayOrders = orders.length > 0 ? orders : (adminData?.orders || []);
  // Filter to show new orders by default (pending_approval status)
  const newOrders = displayOrders.filter((o: any) => o.status === 'pending_approval');
  const hasOrders = displayOrders.length > 0;
  const isLoading = loading.orders;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">Pending</span>;
      case 'approved':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">Rejected</span>;
      case 'shipped':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">Shipped</span>;
      case 'delivered':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">Delivered</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{status}</span>;
    }
  };

  return (
    <div id="content-orders" className="animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Merchandise Orders</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Track and process customer purchases from the store.</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800">
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {newOrders.length} New Request{newOrders.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50">
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Customer</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Items</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Total Amount</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Purchase Date</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <ShimmerRows />
            ) : hasOrders ? displayOrders.map((order: any) => {
              // Extract order data which might be nested in 'data' field
              const orderData = order.data || {};
              const customerName = order.customerName || orderData.customerName || 'Guest Customer';
              const customerEmail = order.email || order.customerEmail || orderData.customerEmail || 'No contact info';
              const items = order.items || orderData.items || [];
              const totalAmount = order.total || orderData.total || order.amount || 0;
              const date = order.createdAt || orderData.createdAt || order.date || order.updatedAt;

              return (
                <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{customerName}</div>
                    <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{customerEmail}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      {items.length > 0 ? items.map((item: any, idx: number) => (
                        <div key={idx} className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">{item.quantity}x</span>
                          {item.name || item.productName || item.merchName || 'Product'}
                        </div>
                      )) : (
                        <span className="text-xs text-gray-400 italic">No item details</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                      ${totalAmount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <div className="text-xs font-bold text-gray-900 dark:text-white">
                      {date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </div>
                    <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                      {date ? new Date(date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {order.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => updateStatus(order.id, 'approved')}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(order.id, 'rejected')}
                            className="bg-red-50 hover:bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {order.status === 'approved' && (
                        <button
                          onClick={() => updateStatus(order.id, 'shipped')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                        >
                          Mark Shipped
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateStatus(order.id, 'delivered')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Processed</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                      <FiPackage className="w-8 h-8" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-bold tracking-tight text-lg">No orders found</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm max-w-[200px]">New orders will appear here as customers make purchases.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ShimmerRows = () => (
  <>
    <ShimmerTableRow />
    <ShimmerTableRow />
    <ShimmerTableRow />
    <ShimmerTableRow />
    <ShimmerTableRow />
  </>
);
