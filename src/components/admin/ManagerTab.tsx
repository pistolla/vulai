export default function ManagerTab({ adminData }: any) {
  return (
    <div id="content-manager" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manager</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage Unil merchandise orders.</p>
        </div>
      </div>

      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Order management interface coming soon...</p>
      </div>
    </div>
  );
}