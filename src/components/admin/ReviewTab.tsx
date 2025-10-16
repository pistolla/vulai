export default function ReviewTab({ rows, approve, reject, adminData }: any) {
  return (
    <div id="content-review" className="slide-in-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900">Correspondent Data Review</h2><p className="text-gray-600">Review and approve or reject data submitted by correspondents.</p></div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correspondent</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr></thead><tbody className="bg-white divide-y divide-gray-200">
          {(rows.length > 0 ? rows : adminData.reviews).map((r: any) => (
            <tr key={r.id}>
              <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{r.title}</div><div className="text-sm text-gray-500">{r.type}</div></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.correspondent}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(r.submittedAt).toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => approve(r.id)} className="text-green-600 hover:text-green-900 mr-2">Approve</button><button onClick={() => reject(r.id)} className="text-red-600 hover:text-red-900">Reject</button></td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}