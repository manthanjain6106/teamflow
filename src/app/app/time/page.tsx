'use client';

import { Timer } from 'lucide-react';

export default function TimeTrackingPage() {
  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><Timer className="h-6 w-6 text-gray-700" /> Time tracking</h1>
        <p className="text-gray-600 dark:text-gray-400">Time tracking reports will appear here. We can integrate with `time_entries` later.</p>
      </div>
    </div>
  );
}


