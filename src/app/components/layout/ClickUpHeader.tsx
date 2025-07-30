'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Search, Bell, Settings, User, Plus, MoreHorizontal, Hash, FolderOpen, Command } from 'lucide-react';
import GlobalSearch from '@/app/components/ui/GlobalSearch';

export default function ClickUpHeader() {
  const { selectedWorkspace, selectedSpace, selectedList, currentView, setCurrentView } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);

  // Handle Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate page title and breadcrumbs
  const getPageTitle = () => {
    if (selectedList) return selectedList.name;
    if (selectedSpace) return selectedSpace.name;
    if (selectedWorkspace) return selectedWorkspace.name;
    return 'TeamFlow';
  };

  const getBreadcrumbs = () => {
    const crumbs = [];
    
    if (selectedWorkspace) {
      crumbs.push({
        label: selectedWorkspace.name,
        icon: <div className="w-4 h-4 bg-purple-600 text-white rounded text-xs flex items-center justify-center font-bold">
          {selectedWorkspace.name[0]?.toUpperCase()}
        </div>
      });
    }
    
    if (selectedSpace) {
      crumbs.push({
        label: selectedSpace.name,
        icon: <FolderOpen className="h-4 w-4 text-blue-600" />
      });
    }
    
    if (selectedList) {
      crumbs.push({
        label: selectedList.name,
        icon: <Hash className="h-4 w-4 text-green-600" />
      });
    }
    
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-14 flex items-center justify-between px-6">
        {/* Left side - Breadcrumbs and Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center space-x-2">
                {index > 0 && <span>/</span>}
                <div className="flex items-center space-x-1">
                  {crumb.icon}
                  <span>{crumb.label}</span>
                </div>
              </div>
            ))}
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Search className="h-4 w-4 mr-2" />
            <span className="flex-1 text-left">Search tasks, docs, goals...</span>
            <div className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded">
                {navigator.platform.indexOf('Mac') !== -1 ? '⌘' : 'Ctrl'}
              </kbd>
              <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded">
                K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-3">
          {/* View switcher */}
          {(selectedList || selectedSpace) && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('LIST')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'LIST'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setCurrentView('BOARD')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'BOARD'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Board
              </button>
              <button
                onClick={() => setCurrentView('CALENDAR')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'CALENDAR'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setCurrentView('GANTT')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'GANTT'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Gantt
              </button>
            </div>
          )}

          {/* Action buttons */}
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Plus className="h-5 w-5" />
          </button>
          
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Bell className="h-5 w-5" />
          </button>
          
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Settings className="h-5 w-5" />
          </button>
          
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {/* User avatar */}
          <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
            <User className="h-4 w-4" />
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}