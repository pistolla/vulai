import React, { useState } from 'react';
import { Fixture } from '@/models';
import { useAppDispatch } from '@/hooks/redux';
import { updateFixture } from '@/store/correspondentThunk';
import { FiX, FiCheck, FiFileText, FiLoader } from 'react-icons/fi';
import { useToast } from '@/components/common/ToastProvider';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse"></div>
});
import 'react-quill/dist/quill.snow.css';

interface FixtureNewsEditorProps {
  fixture: Fixture;
  onClose: () => void;
}

export const FixtureNewsEditor: React.FC<FixtureNewsEditorProps> = ({ fixture, onClose }) => {
  const dispatch = useAppDispatch();
  const { success, error: showError } = useToast();
  
  const [content, setContent] = useState(fixture.blogContent || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateFixture({
        id: fixture.id,
        fixture: { blogContent: content }
      })).unwrap();
      success('News updated', 'Fixture blog content has been saved.');
      onClose();
    } catch (err) {
      showError('Failed to update news', 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-[40px] w-full max-w-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
                <FiFileText className="text-indigo-600 dark:text-indigo-400" />
              </div>
              Update Fixture News
            </h3>
            <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest">
              {fixture.homeTeamName} vs {fixture.awayTeamName}
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-all">
            <FiX size={24} />
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-8 news-editor-container">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[32px] overflow-hidden border-2 border-transparent focus-within:border-indigo-500 transition-all">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              placeholder="Write fixture news, previews, or post-match analysis here..."
              className="h-80"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['link', 'clean']
                ],
              }}
            />
          </div>
          <style jsx global>{`
            .news-editor-container .ql-toolbar {
              border: none !important;
              background: rgba(243, 244, 246, 0.5);
              padding: 1rem !important;
              border-bottom: 1px solid rgba(229, 231, 235, 1) !important;
            }
            .dark .news-editor-container .ql-toolbar {
              background: rgba(31, 41, 55, 0.5);
              border-bottom: 1px solid rgba(55, 65, 81, 1) !important;
            }
            .news-editor-container .ql-container {
              border: none !important;
              font-family: inherit !important;
              font-size: 1rem !important;
            }
            .news-editor-container .ql-editor {
              min-height: 200px;
              color: inherit;
            }
            .dark .news-editor-container .ql-editor.ql-blank::before {
                color: #9ca3af;
            }
          `}</style>
        </div>

        {/* Action Buttons */}
        <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4 bg-gray-50/50 dark:bg-gray-800/20">
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-black uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Discard
          </button>
          <button 
            disabled={saving}
            onClick={handleSave}
            className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-black uppercase tracking-wider hover:shadow-xl hover:shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <FiLoader className="animate-spin" /> : <FiCheck size={20} />}
            {saving ? 'Publishing...' : 'Update Article'}
          </button>
        </div>

      </div>
    </div>
  );
};
