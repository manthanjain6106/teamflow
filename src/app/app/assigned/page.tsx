'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { fetchTasks } from '@/lib/api';
import { CheckSquare2, Loader2 } from 'lucide-react';

export default function AssignedPage() {
  const { selectedWorkspace } = useStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTasks({ assigneeId: 'me' });
      setTasks(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedWorkspace?.id]);

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /><span>Loading...</span></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 text-red-600">{error}</div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><CheckSquare2 className="h-6 w-6 text-blue-600" /> Assigned to me</h1>
        {tasks.length === 0 ? (
          <div className="text-gray-500">No tasks assigned.</div>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.list?.space?.workspace?.name} / {t.list?.space?.name} / {t.list?.name}</div>
                </div>
                <div className="text-xs text-gray-500">{t.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


