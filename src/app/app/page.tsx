'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useStore } from '@/store/useStore';
import ClickUpTaskList from '@/app/components/views/ClickUpTaskList';
import ClickUpBoard from '@/app/components/views/ClickUpBoard';
import ClickUpCalendar from '@/app/components/views/ClickUpCalendar';
import ClickUpGantt from '@/app/components/views/ClickUpGantt';
import ClickUpTimeline from '@/app/components/views/ClickUpTimeline';
import ClickUpTableView from '@/app/components/views/ClickUpTableView';
// Mind Map removed

export default function AppDashboard() {
  const { data: session } = useSession();
  const { currentView } = useStore();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'LIST':
        return <ClickUpTaskList />;
      case 'BOARD':
        return <ClickUpBoard />;
      case 'TABLE':
        return <ClickUpTableView />;
      case 'CALENDAR':
        return <ClickUpCalendar />;
      case 'GANTT':
        return <ClickUpGantt />;
      case 'TIMELINE':
        return <ClickUpTimeline />;
      // MIND_MAP removed
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