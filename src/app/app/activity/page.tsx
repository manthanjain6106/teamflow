'use client';

import { useEffect, useState } from 'react';
import { Activity as ActivityIcon, Loader2 } from 'lucide-react';

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Placeholder: activity feed can be wired to /api/activities later
    setTimeout(() => { setActivities([]); setLoading(false); }, 300);
  }, []);

  if (loading) return <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><ActivityIcon className="h-6 w-6 text-gray-700" /> Activity</h1>
        {activities.length === 0 ? <div className="text-gray-500">No recent activity.</div> : null}
      </div>
    </div>
  );
}


