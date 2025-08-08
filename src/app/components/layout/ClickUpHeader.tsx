'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Search, Bell, Settings, User, Plus, MoreHorizontal, Hash, FolderOpen, Command, List, LayoutGrid, Table, Calendar, BarChart3, Clock, Brain, CheckSquare2, FileText, Target } from 'lucide-react';
import GlobalSearch from '@/app/components/ui/GlobalSearch';
import { useRouter } from 'next/navigation';

interface ClickUpHeaderProps {
  title?: string;
  breadcrumbs?: Array<{
    name: string;
    href: string;
    icon: any;
  }>;
  showViewSwitcher?: boolean;
}

export default function ClickUpHeader({ title, breadcrumbs: layoutBreadcrumbs, showViewSwitcher }: ClickUpHeaderProps) {
  const { selectedWorkspace, selectedSpace, selectedList, currentView, setCurrentView } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const router = useRouter();

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

  // Close all menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is outside all menu areas
      const isOutsideMenus = !target.closest('[data-menu]');
      
      if (isOutsideMenus) {
        setShowUserMenu(false);
        setShowNotifications(false);
        setShowMoreMenu(false);
        setShowCreateMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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

  // Handle navigation actions
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCreateMenu(!showCreateMenu);
    setShowUserMenu(false);
    setShowNotifications(false);
    setShowMoreMenu(false);
  };

  const handleBellClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
    setShowMoreMenu(false);
    setShowCreateMenu(false);
  };

  const handleSettingsClick = () => {
    router.push('/app/settings');
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoreMenu(!showMoreMenu);
    setShowUserMenu(false);
    setShowNotifications(false);
    setShowCreateMenu(false);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
    setShowMoreMenu(false);
    setShowCreateMenu(false);
  };

  const handleCreateItem = (type: string) => {
    console.log(`Creating new ${type}`);
    setShowCreateMenu(false);
    
    // Here you would typically open a modal or navigate to create page
    switch (type) {
      case 'task':
        // Open task creation modal
        console.log('Open task creation modal');
        break;
      case 'list':
        // Open list creation modal
        console.log('Open list creation modal');
        break;
      case 'space':
        // Open space creation modal
        console.log('Open space creation modal');
        break;
      case 'workspace':
        // Navigate to workspace creation
        console.log('Navigate to workspace creation');
        break;
      case 'document':
        // Open document creation
        console.log('Open document creation');
        break;
      case 'goal':
        // Open goal creation
        console.log('Open goal creation');
        break;
    }
  };

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
                className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'LIST'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
                <span>List</span>
              </button>
              <button
                onClick={() => setCurrentView('BOARD')}
                className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'BOARD'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Board</span>
              </button>
              <button
                onClick={() => setCurrentView('TABLE')}
                className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'TABLE'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Table className="h-4 w-4" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setCurrentView('CALENDAR')}
                className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'CALENDAR'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => setCurrentView('GANTT')}
                className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'GANTT'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Gantt</span>
              </button>
              <button
                onClick={() => setCurrentView('TIMELINE')}
                className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'TIMELINE'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Timeline</span>
              </button>
              <button
                onClick={() => setCurrentView('MIND_MAP')}
                className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'MIND_MAP'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Brain className="h-4 w-4" />
                <span>Mind Map</span>
              </button>
            </div>
          )}

          {/* Action buttons */}
          <button 
            onClick={handlePlusClick}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative group"
            title="Create new item"
          >
            <Plus className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>
          
          <button 
            onClick={handleBellClick}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button 
            onClick={handleSettingsClick}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          
          <button 
            onClick={handleMoreClick}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="More options"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {/* User avatar */}
          <button
            onClick={handleUserClick}
            className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium hover:bg-purple-700 transition-colors"
            title="User menu"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Create Menu Dropdown */}
      {showCreateMenu && (
        <div className="absolute right-0 top-14 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50" data-menu>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Create New</h3>
          </div>
          <div className="py-2">
            <button
              onClick={() => handleCreateItem('task')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <CheckSquare2 className="h-4 w-4 mr-3 text-blue-600" />
              <div>
                <div className="font-medium">Task</div>
                <div className="text-xs text-gray-500">Create a new task</div>
              </div>
            </button>
            
            <button
              onClick={() => handleCreateItem('list')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <Hash className="h-4 w-4 mr-3 text-green-600" />
              <div>
                <div className="font-medium">List</div>
                <div className="text-xs text-gray-500">Create a new list</div>
              </div>
            </button>
            
            <button
              onClick={() => handleCreateItem('space')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <FolderOpen className="h-4 w-4 mr-3 text-purple-600" />
              <div>
                <div className="font-medium">Space</div>
                <div className="text-xs text-gray-500">Create a new space</div>
              </div>
            </button>
            
            <button
              onClick={() => handleCreateItem('workspace')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <BarChart3 className="h-4 w-4 mr-3 text-orange-600" />
              <div>
                <div className="font-medium">Workspace</div>
                <div className="text-xs text-gray-500">Create a new workspace</div>
              </div>
            </button>
            
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            
            <button
              onClick={() => handleCreateItem('document')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <FileText className="h-4 w-4 mr-3 text-yellow-600" />
              <div>
                <div className="font-medium">Document</div>
                <div className="text-xs text-gray-500">Create a new document</div>
              </div>
            </button>
            
            <button
              onClick={() => handleCreateItem('goal')}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <Target className="h-4 w-4 mr-3 text-teal-600" />
              <div>
                <div className="font-medium">Goal</div>
                <div className="text-xs text-gray-500">Create a new goal</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-14 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50" data-menu>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">No new notifications</p>
          </div>
        </div>
      )}

      {/* More Menu Dropdown */}
      {showMoreMenu && (
        <div className="absolute right-0 top-14 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50" data-menu>
          <div className="py-1">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Import data
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Export data
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Help & Support
            </button>
          </div>
        </div>
      )}

      {/* User Menu Dropdown */}
      {showUserMenu && (
        <div className="absolute right-0 top-14 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50" data-menu>
          <div className="py-1">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Profile
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Account settings
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
}