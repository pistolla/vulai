import { useAppSelector } from '@/hooks/redux';

function ShimmerTableRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="ml-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="space-x-2 flex justify-end">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-12"></div>
        </div>
      </td>
    </tr>
  );
}

export default function UsersTab({ rows, approve, deleteU, openAdd, adminData }: any) {
  const { loading } = useAppSelector(s => s.admin);
  const displayUsers = rows.length > 0 ? rows : (adminData?.users || []);
  const hasUsers = displayUsers.length > 0;
  const isLoading = loading.users;

  return (
    <div id="content-users" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2><p className="text-gray-600 dark:text-gray-400">Manage correspondents, fans, and their permissions</p></div>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>Add New User</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Actions</th>
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
            ) : hasUsers ? displayUsers.map((u: any) => (
              <tr key={u.uid}>
                <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center"><span className="text-purple-700 dark:text-purple-300 font-medium">{u.name.slice(0,2).toUpperCase()}</span></div><div className="ml-4"><div className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</div><div className="text-sm text-gray-500 dark:text-white">{u.university||'—'}</div></div></div></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">{u.role}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.status==='active'?'bg-green-100 dark:bg-green-900 text-green-800 dark:text-white':'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-white'}`}>{u.status}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {u.status==='pending' && <button onClick={() => approve(u.uid)} className="text-green-600 dark:text-white hover:text-green-900 dark:hover:text-gray-300 mr-2">Approve</button>}
                  <button onClick={() => deleteU(u.uid)} className="text-red-600 dark:text-white hover:text-red-900 dark:hover:text-gray-300">Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No users found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}