'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { FolderOpen, Hash } from 'lucide-react';
import ClickUpSidebar from '@/app/components/layout/ClickUpSidebar';
import ClickUpHeader from '@/app/components/layout/ClickUpHeader';
import { useStore } from '@/store/useStore';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { status } = useSession();
  const { selectedSpace, selectedList } = useStore();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading TeamFlow...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  const getPageTitle = () => {
    if (selectedList) {
      return selectedList.name;
    }
    if (selectedSpace) {
      return selectedSpace.name;
    }
    return 'Home';
  };

  const getBreadcrumbs = () => {
    const crumbs = [];
    
    if (selectedSpace) {
      crumbs.push({
        name: selectedSpace.name,
        href: `/app/spaces/${selectedSpace.id}`,
        icon: FolderOpen
      });
    }
    
    if (selectedList) {
      crumbs.push({
        name: selectedList.name,
        href: `/app/lists/${selectedList.id}`,
        icon: Hash
      });
    }

    return crumbs;
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <ClickUpSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <ClickUpHeader 
          title={getPageTitle()}
          breadcrumbs={getBreadcrumbs()}
          showViewSwitcher={!!(selectedSpace || selectedList)}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}