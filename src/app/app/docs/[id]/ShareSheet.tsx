'use client';

import { useEffect, useState } from 'react';
import { fetchDocumentShares, shareDocument, removeDocumentShare, updateDocument } from '@/lib/api';

interface Props {
  documentId: string;
  onClose: () => void;
}

export default function ShareSheet({ documentId, onClose }: Props) {
  const [shares, setShares] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit' | 'admin'>('view');
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const load = async () => {
    const s = await fetchDocumentShares(documentId).catch(() => []);
    setShares(s);
  };

  useEffect(() => { load(); }, [documentId]);

  const invite = async () => {
    if (!email.trim()) return;
    await shareDocument({ documentId, userEmail: email.trim(), permission });
    setEmail('');
    await load();
  };

  const remove = async (userId: string) => {
    await removeDocumentShare(documentId, userId);
    await load();
  };

  const toggleLink = async () => {
    setLinkEnabled((v) => !v);
    await updateDocument({ id: documentId, isPublic: !linkEnabled });
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/share/doc/${documentId}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold">Share document</h3>
          <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Close</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Invite by email</label>
            <div className="mt-2 flex gap-2">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
              <select value={permission} onChange={(e) => setPermission(e.target.value as any)} className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                <option value="view">View</option>
                <option value="comment">Comment</option>
                <option value="edit">Edit</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={invite} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Invite</button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Link sharing</div>
                <div className="text-xs text-gray-500">Anyone with the link {linkEnabled ? 'can view' : 'cannot access'}.</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleLink} className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-800 text-sm">{linkEnabled ? 'Disable' : 'Enable'}</button>
                <button onClick={copyLink} disabled={!linkEnabled} className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-800 text-sm disabled:opacity-50">{linkCopied ? 'Copied!' : 'Copy link'}</button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <div className="font-medium mb-2">People with access</div>
            <div className="space-y-2 max-h-56 overflow-auto">
              {shares.map((s: any) => (
                <div key={s.userId} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{s.user?.name || s.user?.email || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{s.permission}</div>
                  </div>
                  <button onClick={() => remove(s.userId)} className="text-red-600 hover:underline">Remove</button>
                </div>
              ))}
              {shares.length === 0 && <div className="text-xs text-gray-500">No one else has access.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


