import { useAppSelector } from '@/hooks/redux';

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
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-28"></div>
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
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</span>;
      case 'shipped':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Shipped</span>;
      case 'delivered':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Delivered</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{status}</span>;
    }
  };

  return (
    <div id="content-orders" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage merchandise orders from customers.</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {newOrders.length} new order{newOrders.length !== 1 ? 's' : ''} (pending approval)
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
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
            ) : hasOrders ? displayOrders.map((order: any) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customerName || 'Unknown'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">{order.email || order.customerEmail || 'No email'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="text-sm">
                        {item.quantity}x {item.name || item.productName || 'Product'}
                      </div>
                    )) || order.itemCount || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {order.total ? `$${order.total.toFixed(2)}` : order.amount ? `$${order.amount.toFixed(2)}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : order.date ? new Date(order.date).toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {order.status === 'pending_approval' && (
                    <>
                      <button 
                        onClick={() => updateStatus(order.id, 'approved')} 
                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-3"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => updateStatus(order.id, 'rejected')} 
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 mr-3"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {order.status === 'approved' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'shipped')} 
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                    >
                      Mark Shipped
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'delivered')} 
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                    >
                      Mark Delivered
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No orders found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
