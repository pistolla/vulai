import { useState, useEffect } from 'react';

export default function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);

  // Mock orders data - in real app, fetch from Firebase
  useEffect(() => {
    // Simulate fetching orders
    setOrders([
      {
        id: 'ORD-001',
        date: '2024-01-15',
        items: ['Team Jersey', 'Baseball Cap'],
        total: 89.99,
        status: 'Delivered'
      },
      {
        id: 'ORD-002',
        date: '2024-01-10',
        items: ['Basketball'],
        total: 45.99,
        status: 'Shipped'
      }
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Order History</h3>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">Order #{order.id}</h4>
                  <p className="text-sm text-gray-600">{order.date}</p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="mb-2">
                <p className="text-sm text-gray-600">Items: {order.items.join(', ')}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total: ${order.total.toFixed(2)}</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}