'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { fetchWhiteboards, createWhiteboard, deleteWhiteboard } from '@/lib/api';

export default function WhiteboardsListPage() {
  const { selectedWorkspace } = useStore();
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!selectedWorkspace?.id) return;
    setLoading(true);
    try {
      const data = await fetchWhiteboards(selectedWorkspace.id);
      setItems(data || []);
    } finally { setLoading(false) }
  };

  useEffect(() => { load(); }, [selectedWorkspace?.id]);

  const create = async () => {
    if (!selectedWorkspace?.id || !title.trim()) return;
    await createWhiteboard({ title: title.trim(), workspaceId: selectedWorkspace.id });
    setTitle('');
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this whiteboard?')) return;
    await deleteWhiteboard(id);
    load();
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Whiteboards</h1>
        </div>
        <div className="flex gap-2 mb-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New whiteboard title" className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
          <button onClick={create} className="px-3 py-2 bg-purple-600 text-white rounded">Create</button>
        </div>
        {loading ? (
          <div className="text-gray-600 dark:text-gray-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-400">No whiteboards yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((w) => (
              <div key={w.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{w.title}</div>
                  <div className="text-xs text-gray-500">Updated {new Date(w.updatedAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/app/whiteboards/${w.id}`} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm">Open</Link>
                  <button onClick={() => remove(w.id)} className="px-2 py-1 border border-red-300 text-red-600 rounded text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


