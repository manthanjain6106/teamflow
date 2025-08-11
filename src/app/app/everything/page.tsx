'use client';

import { useEffect, useState } from 'react';
import { fetchTasks } from '@/lib/api';
import { Grid, Loader2 } from 'lucide-react';

export default function EverythingPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchTasks({});
      setTasks(data || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><Grid className="h-6 w-6 text-gray-700" /> Everything</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tasks.map((t) => (
            <div key={t.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
              <div className="font-medium text-gray-900 dark:text-white">{t.name}</div>
              <div className="text-xs text-gray-500">{t.list?.space?.workspace?.name} / {t.list?.space?.name} / {t.list?.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


