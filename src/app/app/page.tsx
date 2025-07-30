'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useStore } from '@/store/useStore';
import ClickUpTaskList from '@/app/components/views/ClickUpTaskList';
import ClickUpBoard from '@/app/components/views/ClickUpBoard';

export default function AppDashboard() {
  const { data: session } = useSession();
  const { currentView } = useStore();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'LIST':
        return <ClickUpTaskList />;
      case 'BOARD':
        return <ClickUpBoard />;
      case 'CALENDAR':
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Calendar View
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Calendar view coming soon...
              </p>
            </div>
          </div>
        );
      case 'GANTT':
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Gantt View
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Gantt chart coming soon...
              </p>
            </div>
          </div>
        );
      case 'TIMELINE':
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Timeline View
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Timeline view coming soon...
              </p>
            </div>
          </div>
        );
      default:
        return <ClickUpTaskList />;
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {renderCurrentView()}
    </div>
  );
}