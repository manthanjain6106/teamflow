'use client';

import { useMemo, useState } from 'react';
import { createWorkspace } from '@/lib/api';

export default function CreateWorkspaceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedSlug = useMemo(() => {
    const base = (slug || name).toLowerCase();
    // allow a-z, 0-9, hyphen; replace others with '-'
    const cleaned = base.replace(/[^a-z0-9-]+/g, '-').replace(/--+/g, '-').replace(/^-+|-+$/g, '');
    return cleaned;
  }, [slug, name]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const wsName = name.trim();
    if (!wsName) return;
    setSaving(true);
    try {
      setError(null);
      const wsSlug = normalizedSlug || wsName.toLowerCase().replace(/\s+/g, '-');
      await createWorkspace({ name: wsName, slug: wsSlug });
      onClose();
      window.location.reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to create workspace';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 text-lg font-semibold">Create workspace</div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" placeholder="Workspace name" />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" placeholder="team-name" />
            <p className="mt-1 text-xs text-gray-500">Will be saved as: <span className="font-mono">{normalizedSlug || 'team-name'}</span></p>
          </div>
          {error && <div className="text-xs text-red-500">{error}</div>}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !name.trim()} className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}


