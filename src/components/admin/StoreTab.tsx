import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function StoreTab({ adminData }: any) {
  const { merchItems } = useSelector((state: RootState) => ({
    merchItems: state.merch.items,
  }));

  const unilMerch = merchItems.filter(m => m.type === 'unil');

  return (
    <div id="content-store" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Store Stock</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage Unil merchandise and orders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {unilMerch.length > 0 ? unilMerch.map((m: any) => (
          <div key={m.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
            <img src={m.image} alt={m.name} className="rounded-lg mb-4" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{m.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{m.description}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">KSh {m.price}</span>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No Unil merchandise found</p>
          </div>
        )}
      </div>

      {/* Placeholder for orders */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Orders</h3>
        <p className="text-gray-600 dark:text-gray-400">Order management coming soon...</p>
      </div>
    </div>
  );
}