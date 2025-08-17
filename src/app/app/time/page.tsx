'use client';

import { useEffect, useState } from 'react';
import { Timer, Users } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useUsers } from '@/hooks/useUsers';

type TimeEntry = { id: string; duration: number; startTime: string; user: { id: string; name?: string; email: string } };

export default function TimeTrackingPage() {
  const { selectedWorkspace } = useStore();
  const { users } = useUsers(selectedWorkspace?.id);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!users || users.length === 0) return;
      setLoading(true);
      try {
        const all: TimeEntry[] = [] as any;
        for (const u of users) {
          const url = new URL('/api/time-entries', window.location.origin);
          url.searchParams.set('userId', u.id);
          const res = await fetch(url.toString());
          if (res.ok) {
            const data = await res.json();
            all.push(...data);
          }
        }
        setEntries(all);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [users]);

  // Aggregate by user
  const byUser: Record<string, { user: { id: string; name?: string; email: string }, seconds: number }> = {};
  for (const e of entries) {
    const key = e.user.id;
    if (!byUser[key]) byUser[key] = { user: e.user, seconds: 0 };
    byUser[key].seconds += e.duration || 0;
  }

  const rows = Object.values(byUser).sort((a, b) => b.seconds - a.seconds);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><Timer className="h-6 w-6" /> Workload</h1>
        {loading ? (
          <div className="text-gray-600 dark:text-gray-400">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-400">No time entries yet.</div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-50 dark:bg-gray-900/40">
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Total time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.user.id} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3 flex items-center gap-2"><Users className="h-4 w-4 text-gray-500"/>{r.user.name || r.user.email}</td>
                    <td className="px-4 py-3">{fmt(r.seconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


