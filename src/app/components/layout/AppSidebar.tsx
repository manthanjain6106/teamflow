'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useStore } from '@/store/useStore';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Home,
  Folder,
  List,
  Calendar,
  BarChart3,
  Settings,
  Users,
  Search,
  Bell,
  Clock,
  Target,
  BookOpen,
  Archive,
  Hash,
  FolderOpen,
  MoreHorizontal
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export default function AppSidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    selectedWorkspace, 
    selectedSpace,
    workspaces,
    spaces,
    lists
  } = useStore();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    spaces: true,
    favorites: false,
    everything: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navigationItems = [
    {
      name: 'Home',
      href: '/app',
      icon: Home,
      active: pathname === '/app'
    },
    {
      name: 'My Tasks',
      href: '/app/tasks',
      icon: List,
      active: pathname === '/app/tasks'
    },
    {
      name: 'Calendar',
      href: '/app/calendar',
      icon: Calendar,
      active: pathname === '/app/calendar'
    },
    {
      name: 'Goals',
      href: '/app/goals',
      icon: Target,
      active: pathname === '/app/goals'
    },
    {
      name: 'Time Tracking',
      href: '/app/time',
      icon: Clock,
      active: pathname === '/app/time'
    },
    {
      name: 'Reports',
      href: '/app/reports',
      icon: BarChart3,
      active: pathname === '/app/reports'
    }
  ];

  if (sidebarCollapsed) {
    return (
      <div className={`w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col ${className}`}>
        {/* Collapsed Sidebar Content */}
        <div className="p-3">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg hover:bg-blue-700 transition-colors"
            title="Expand sidebar"
          >
            T
          </button>
        </div>
        
        <div className="flex-1 px-2 space-y-1">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`w-full h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={item.name}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              T
            </button>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">TeamFlow</h1>
              {selectedWorkspace && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                  {selectedWorkspace.name}
                </p>
              )}
            </div>
          </div>
          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1 mb-6">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.name}
            </Link>
          ))}
        </div>

        {/* Spaces Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('spaces')}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center">
              {expandedSections.spaces ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              Spaces
            </div>
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <Plus className="h-3 w-3" />
            </button>
          </button>

          {expandedSections.spaces && (
            <div className="ml-6 mt-2 space-y-1">
              {spaces.map((space) => (
                <div key={space.id} className="group">
                  <Link
                    href={`/app/spaces/${space.id}`}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedSpace?.id === space.id
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded mr-3 flex-shrink-0"
                      style={{ backgroundColor: space.color || '#6b7280' }}
                    />
                    <span className="truncate">{space.name}</span>
                    <button className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <MoreHorizontal className="h-3 w-3" />
                    </button>
                  </Link>

                  {/* Lists under each space */}
                  {selectedSpace?.id === space.id && (
                    <div className="ml-6 mt-1 space-y-1">
                      {lists
                        .filter(list => list.spaceId === space.id)
                        .map((list) => (
                          <Link
                            key={list.id}
                            href={`/app/lists/${list.id}`}
                            className="flex items-center px-3 py-1.5 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Hash className="h-3 w-3 mr-2" />
                            <span className="truncate">{list.name}</span>
                          </Link>
                        ))}
                      <button className="flex items-center px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full">
                        <Plus className="h-3 w-3 mr-2" />
                        Add List
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {spaces.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
                  No spaces yet
                </div>
              )}
            </div>
          )}
        </div>

        {/* Everything Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('everything')}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center">
              {expandedSections.everything ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              Everything
            </div>
          </button>

          {expandedSections.everything && (
            <div className="ml-6 mt-2 space-y-1">
              <Link
                href="/app/docs"
                className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <BookOpen className="h-4 w-4 mr-3" />
                Docs
              </Link>
              <Link
                href="/app/archive"
                className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Archive className="h-4 w-4 mr-3" />
                Archive
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <Link
            href="/app/settings"
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}