'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ClickUpWhiteboard from '@/app/components/views/ClickUpWhiteboard';

export default function WhiteboardEditorPage() {
  const params = useParams() as { id?: string };
  const id = params?.id as string;
  const [title, setTitle] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const url = new URL('/api/whiteboards', window.location.origin);
      url.searchParams.set('id', id);
      const res = await fetch(url.toString());
      if (res.ok) {
        const wb = await res.json();
        setTitle(wb.title || '');
        setData(Array.isArray(wb.data) ? wb.data : (wb.data?.elements || []));
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  // Debounced save
  useEffect(() => {
    if (!id) return;
    const t = setTimeout(async () => {
      try {
        setSaving(true);
        await fetch('/api/whiteboards', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, title, data }) });
      } finally { setSaving(false); }
    }, 800);
    return () => clearTimeout(t);
  }, [id, title, data]);

  if (loading) return <div className="p-6 text-gray-600 dark:text-gray-400">Loading…</div>;

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm" />
        <div className="text-xs text-gray-500">{saving ? 'Saving…' : 'Saved'}</div>
      </div>
      <div className="h-[calc(100vh-52px)]">
        <ClickUpWhiteboard initialData={data as any} onChange={setData} />
      </div>
    </div>
  );
}


