'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { fetchDocuments, updateDocument, deleteDocument, fetchDocumentComments, addDocumentComment, deleteDocumentComment, fetchDocumentVersions } from '@/lib/api';
import { ArrowLeft, Save, Edit, Share as ShareIcon, Star, Trash2, Clock, User, Loader2, MessageSquare, History, ListTree } from 'lucide-react';
import dynamic from 'next/dynamic';
const ShareSheet = dynamic(() => import('./ShareSheet'), { ssr: false });
const Outline = dynamic(() => import('./Outline'), { ssr: false });

export default function DocEditorPage() {
  const router = useRouter();
  const params = useParams();
  const docId = (params?.id as string) || '';
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
  const startInEdit = search?.get('edit') === '1';
  const { selectedWorkspace } = useStore();

  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [versions, setVersions] = useState<any[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'comments' | 'versions' | 'outline' | null>('comments');
  const [previewVersion, setPreviewVersion] = useState<any | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const load = async () => {
    if (!selectedWorkspace?.id || !docId) return;
    try {
      setLoading(true);
      const list = await fetchDocuments({ workspaceId: selectedWorkspace.id });
      const found = list.find((d: any) => d.id === docId);
      setDoc(found || null);
      if (found) {
        const [c, v] = await Promise.all([
          fetchDocumentComments(found.id).catch(() => []),
          fetchDocumentVersions(found.id).catch(() => []),
        ]);
        setComments(c);
        setVersions(v);
      } else {
        setComments([]);
        setVersions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkspace?.id, docId]);

  useEffect(() => {
    if (startInEdit && doc) {
      setIsEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startInEdit, doc?.id]);

  const handleSave = async () => {
    if (!doc || !editorRef.current) return;
    await updateDocument({ id: doc.id, title: doc.title, content: editorRef.current.innerHTML });
    setIsEditing(false);
    await load();
  };

  const handleToggleStar = async () => {
    if (!doc) return;
    await updateDocument({ id: doc.id, starred: !doc.starred });
    await load();
  };

  const handleDelete = async () => {
    if (!doc) return;
    if (!confirm('Delete this document?')) return;
    await deleteDocument(doc.id);
    router.push('/app/docs');
  };

  const handleAddComment = async () => {
    if (!doc || !newComment.trim()) return;
    await addDocumentComment({ documentId: doc.id, content: newComment.trim() });
    setNewComment('');
    const c = await fetchDocumentComments(doc.id);
    setComments(c);
  };

  const handleDeleteComment = async (id: string) => {
    if (!doc) return;
    await deleteDocumentComment(id, doc.id);
    const c = await fetchDocumentComments(doc.id);
    setComments(c);
  };

  if (!selectedWorkspace) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-6">
        <button onClick={() => router.push('/app/docs')} className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Docs</span>
        </button>
        <p className="mt-6 text-gray-600 dark:text-gray-300">Document not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 flex">
      <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between fixed top-0 left-0 right-72 bg-white/70 dark:bg-gray-900/70 backdrop-blur z-10">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.push('/app/docs')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <input
            value={doc.title}
            onChange={(e) => setDoc({ ...doc, title: e.target.value })}
            className="text-xl font-semibold bg-transparent focus:outline-none text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleToggleStar} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <Star className={`h-4 w-4 ${doc.starred ? 'text-yellow-500 fill-current' : ''}`} />
          </button>
          <button onClick={() => setIsEditing((v) => !v)} className={`px-3 py-1.5 text-sm rounded ${isEditing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} flex items-center space-x-2`}>
            {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            <span>{isEditing ? 'Save' : 'Edit'}</span>
          </button>
          <button onClick={() => setShareOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Share">
            <ShareIcon className="h-4 w-4" />
          </button>
          <button onClick={handleDelete} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 p-6 pt-20 max-w-4xl">
        <div
          ref={editorRef}
          contentEditable={isEditing}
          suppressContentEditableWarning
          className={`prose max-w-4xl dark:prose-invert ${isEditing ? 'border rounded-lg p-4 border-gray-300 dark:border-gray-700 focus:outline-none' : ''}`}
          dangerouslySetInnerHTML={{ __html: doc.content || '' }}
          onBlur={isEditing ? handleSave : undefined}
        />
        <div className="mt-6 text-sm text-gray-500 flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{doc.createdBy?.name || 'Unknown'}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(doc.updatedAt).toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-72 border-l border-gray-200 dark:border-gray-800 p-4 space-y-4 sticky top-0 h-screen">
        <div className="flex items-center space-x-2">
          <button onClick={() => setSidebarTab('comments')} className={`flex-1 px-3 py-2 rounded ${sidebarTab === 'comments' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
            <div className="flex items-center space-x-2 justify-center"><MessageSquare className="h-4 w-4" /><span>Comments</span></div>
          </button>
          <button onClick={() => setSidebarTab('versions')} className={`flex-1 px-3 py-2 rounded ${sidebarTab === 'versions' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
            <div className="flex items-center space-x-2 justify-center"><History className="h-4 w-4" /><span>Versions</span></div>
          </button>
          <button onClick={() => setSidebarTab('outline')} className={`flex-1 px-3 py-2 rounded ${sidebarTab === 'outline' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
            <div className="flex items-center space-x-2 justify-center"><ListTree className="h-4 w-4" /><span>Outline</span></div>
          </button>
        </div>

        {sidebarTab === 'comments' && (
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Comments</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {comments.map((c: any) => (
                <div key={c._id} className="text-sm bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <div className="flex items-center justify-between mb-1 text-gray-500">
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                    <button onClick={() => handleDeleteComment(c._id?.$oid || c._id)} className="text-xs text-red-600 hover:underline">Delete</button>
                  </div>
                  <div className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{c.content}</div>
                </div>
              ))}
              {comments.length === 0 && <div className="text-xs text-gray-500">No comments yet.</div>}
            </div>
            <div className="mt-3">
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment" className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
              <button onClick={handleAddComment} className="mt-2 w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">Comment</button>
            </div>
          </div>
        )}

        {sidebarTab === 'versions' && (
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Version history</h3>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {versions.map((v: any) => (
                <div key={v._id?.$oid || v._id} className="p-2 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>v{v.version}</span>
                    <span>{new Date(v.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-900 dark:text-gray-100 truncate">{v.title}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => setPreviewVersion(v)} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Preview</button>
                    <button onClick={async () => { await updateDocument({ id: doc.id, title: v.title, content: v.content }); await load(); }} className="text-xs px-2 py-1 rounded bg-purple-600 text-white hover:bg-purple-700">Restore</button>
                  </div>
                </div>
              ))}
              {versions.length === 0 && <div className="text-xs text-gray-500">No versions yet.</div>}
            </div>
          </div>
        )}
        {sidebarTab === 'outline' && (
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Outline</h3>
            <Outline html={doc.content || ''} />
          </div>
        )}
      </div>
      {previewVersion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">Version v{previewVersion.version} • {new Date(previewVersion.createdAt).toLocaleString()}</div>
              <div className="flex items-center gap-2">
                <button onClick={async () => { await updateDocument({ id: doc.id, title: previewVersion.title, content: previewVersion.content }); setPreviewVersion(null); await load(); }} className="px-3 py-1.5 text-sm rounded bg-purple-600 text-white hover:bg-purple-700">Restore this version</button>
                <button onClick={() => setPreviewVersion(null)} className="px-3 py-1.5 text-sm rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Close</button>
              </div>
            </div>
            <div className="p-4 overflow-auto">
              <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{previewVersion.title}</h4>
              <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: previewVersion.content || '' }} />
            </div>
          </div>
        </div>
      )}
      {shareOpen && <ShareSheet documentId={doc.id} onClose={() => setShareOpen(false)} />}
    </div>
  );
}


