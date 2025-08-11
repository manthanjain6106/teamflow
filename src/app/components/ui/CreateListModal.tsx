'use client';

import { useState } from 'react';
import { createList } from '@/lib/api';
import { useStore } from '@/store/useStore';

export default function CreateListModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { selectedSpace } = useStore();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const submit = async () => {
    if (!name.trim() || !selectedSpace?.id) return;
    setSaving(true);
    try {
      await createList({ name: name.trim(), spaceId: selectedSpace.id });
      onClose();
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 text-lg font-semibold">Create list</div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" placeholder="List name" />
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800">Cancel</button>
          <button onClick={submit} disabled={saving || !name.trim()} className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}


