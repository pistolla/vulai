import { useEffect, useState } from 'react';
import { apiService } from '@/services/apiService';
import { University } from '@/models';

import { Modal } from '@/components/common/Modal';
import { FiCheckCircle, FiAlertCircle, FiUploadCloud } from 'react-icons/fi';

// Input Wrapper Component for enhanced styling and error states
const InputWrapper = ({ children, error, label, labelExtra }: { children: React.ReactNode; error?: string; label: string; labelExtra?: string }) => (
  <div className={`relative ${error ? 'mb-6' : 'mb-4'}`}>
    <div className="flex items-baseline justify-between mb-2">
      <label className="block text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      {labelExtra && (
        <span className="text-[10px] text-gray-400 font-medium italic">{labelExtra}</span>
      )}
    </div>
    {children}
    {error && (
      <div className="flex items-center gap-1 mt-2 text-red-500 dark:text-red-400 text-xs animate-in slide-in-from-top-1">
        <FiAlertCircle className="w-3 h-3" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

// University Form Component
function UniversityForm({ formData, setFormData, onSubmit, submitLabel }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, logoURL: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputWrapper label="University Name">
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
            placeholder="e.g. Harvard University"
          />
        </InputWrapper>

        <InputWrapper label="Location">
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
            placeholder="e.g. Cambridge, MA"
          />
        </InputWrapper>

        <InputWrapper label="Established Year">
          <input
            type="number"
            value={formData.established}
            onChange={(e) => setFormData({ ...formData, established: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
            placeholder="e.g. 1636"
          />
        </InputWrapper>

        <InputWrapper label="Website URL">
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
            placeholder="e.g. harvard.edu"
          />
        </InputWrapper>

        <div className="col-span-2">
          <InputWrapper label="Logo">
            <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${formData.logoURL
              ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}>
              {formData.logoURL ? (
                <div className="flex items-center justify-center gap-4">
                  <img src={formData.logoURL} alt="Logo preview" className="w-20 h-20 object-cover rounded-xl shadow-lg" />
                  <div>
                    <p className="text-green-600 dark:text-green-400 font-bold text-sm">Logo uploaded</p>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoURL: '' })}
                      className="text-red-500 hover:text-red-700 text-xs font-medium mt-1"
                    >
                      Remove logo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <FiUploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Click to upload university logo</p>
                    <p className="text-gray-400 text-sm mt-1">PNG, JPG up to 2MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </InputWrapper>
        </div>

        <div className="col-span-2">
          <InputWrapper label="Description">
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 dark:text-white font-bold placeholder-gray-400 transition-all"
              placeholder="About the university..."
            />
          </InputWrapper>
        </div>
      </div>
      <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FiCheckCircle className="w-5 h-5" />
          )}
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}

import { useAppSelector } from '@/hooks/redux';

export default function UniversitiesTab({ adminData, create, update, deleteU }: any) {
  const universities = useAppSelector(state => state.admin.universities);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<any>(null);
  const [newUniversity, setNewUniversity] = useState({
    name: '',
    location: '',
    established: '',
    website: '',
    description: '',
    logoURL: ''
  });

  const resetNewUniversity = () => {
    setNewUniversity({
      name: '',
      location: '',
      established: '',
      website: '',
      description: '',
      logoURL: ''
    });
  };

  // Removed local data fetching useEffect as data is provided via Redux in parent or store

  const handleAddUniversity = async () => {
    if (!newUniversity.name || !newUniversity.location) {
      alert('University Name and Location are required.');
      return;
    }
    await create({
      name: newUniversity.name,
      location: newUniversity.location,
      established: newUniversity.established ? parseInt(newUniversity.established) : undefined,
      website: newUniversity.website,
      description: newUniversity.description,
      logoURL: newUniversity.logoURL,
    });
    resetNewUniversity();
    setShowAddModal(false);
  };

  const handleEditUniversity = async () => {
    if (!editingUniversity.name || !editingUniversity.location) {
      alert('University Name and Location are required.');
      return;
    }
    await update(editingUniversity.id, {
      name: editingUniversity.name,
      location: editingUniversity.location,
      established: editingUniversity.established,
      website: editingUniversity.website,
      description: editingUniversity.description,
      logoURL: editingUniversity.logoURL,
    });
    setEditingUniversity(null);
    setShowEditModal(false);
  };

  const handleDeleteUniversity = async (id: string) => {
    if (confirm('Are you sure you want to delete this university?')) {
      await deleteU(id);
    }
  };

  return (
    <>
      <div id="content-universities" className="slide-in-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
          <div><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Universities Management</h2><p className="text-gray-600 dark:text-gray-400">Manage university information and details.</p></div>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add University</button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-6">
          {universities.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-gray-400">No universities found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Logo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Established</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Website</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {universities.map((university: University) => (
                    <tr key={university.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {university.logoURL ? (
                          <img src={university.logoURL} alt={`${university.name} logo`} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">No Logo</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900 dark:text-white">{university.name}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{university.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{university.established}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"><a href={`https://${university.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">{university.website}</a></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => { setEditingUniversity(university); setShowEditModal(true); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-2">Edit</button>
                        <button onClick={() => handleDeleteUniversity(university.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add University Modal */}
      <Modal isOpen={showAddModal} title="Add New University" onClose={() => { setShowAddModal(false); resetNewUniversity(); }} fullScreen={true}>
        <UniversityForm
          formData={newUniversity}
          setFormData={setNewUniversity}
          onSubmit={handleAddUniversity}
          submitLabel="Add University"
        />
      </Modal>

      {/* Edit University Modal */}
      <Modal isOpen={showEditModal && !!editingUniversity} title="Edit University" onClose={() => { setShowEditModal(false); setEditingUniversity(null); }} fullScreen={true}>
        {editingUniversity && (
          <UniversityForm
            formData={editingUniversity}
            setFormData={setEditingUniversity}
            onSubmit={handleEditUniversity}
            submitLabel="Update University"
          />
        )}
      </Modal>
    </>
  );
}