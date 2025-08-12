'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useStore } from '@/store/useStore';
import { useWorkspaces, useSpaces, useLists } from '@/hooks/useData';
import { createWorkspace, createSpace, createList, deleteList, deleteSpace, addWorkspaceMember } from '@/lib/api';
import WorkspaceMembersModal from '@/app/components/ui/WorkspaceMembersModal';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Home,
  Clock,
  CheckSquare2,
  Calendar,
  Target,
  BarChart3,
  Settings,
  Search,
  Bell,
  Hash,
  FolderOpen,
  MoreHorizontal,
  Star,
  Archive,
  Trash2,
  Users,
  Zap,
  FileText,
  Inbox,
  Timer,
  PieChart,
  TrendingUp,
  Filter,
  Bookmark,
  Eye,
  MessageSquare,
  Activity,
  Loader2,
  Grid,
  Shapes
} from 'lucide-react';

interface ClickUpSidebarProps {
  className?: string;
}

export default function ClickUpSidebar({ className = '' }: ClickUpSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    selectedWorkspace, 
    selectedSpace,
    selectedList,
    setSelectedWorkspace,
    setSelectedSpace,
    setSelectedList,
    setWorkspaces,
    setSpaces,
    setLists
  } = useStore();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    favorites: true,
    spaces: true,
    everything: false,
    dashboards: false
  });

  const [hoverSection, setHoverSection] = useState<string | null>(null);
  const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>({});
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  // Fetch real data
  const { workspaces, loading: workspacesLoading, error: workspacesError } = useWorkspaces();
  const { spaces, loading: spacesLoading, error: spacesError } = useSpaces(selectedWorkspace?.id);
  const { lists, loading: listsLoading, error: listsError } = useLists(selectedSpace?.id);

  // Update store with fetched data
  useEffect(() => {
    if (workspaces && workspaces.length > 0) {
      setWorkspaces(workspaces);
      
      // Auto-select first workspace if none selected
      if (!selectedWorkspace) {
        setSelectedWorkspace(workspaces[0]);
      }
    }
  }, [workspaces, selectedWorkspace, setWorkspaces, setSelectedWorkspace]);

  useEffect(() => {
    if (spaces) {
      setSpaces(spaces);
    }
  }, [spaces, setSpaces]);

  useEffect(() => {
    if (lists) {
      setLists(lists);
    }
  }, [lists, setLists]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleSpace = (spaceId: string) => {
    setExpandedSpaces(prev => ({
      ...prev,
      [spaceId]: !prev[spaceId]
    }));
  };

  const handleSpaceClick = (space: any) => {
    setSelectedSpace(space);
    setSelectedList(undefined);
    toggleSpace(space.id);
  };

  const handleListClick = (list: any) => {
    setSelectedList(list);
  };

  // ClickUp's exact navigation structure
  const mainNavigation = [
    {
      name: 'Home',
      href: '/app',
      icon: Home,
      active: pathname === '/app',
      color: 'text-purple-600'
    },
    {
      name: 'My Work',
      href: '/app/my-work',
      icon: CheckSquare2,
      active: pathname === '/app/my-work',
      color: 'text-blue-600'
    },
    {
      name: 'Inbox',
      href: '/app/inbox',
      icon: Inbox,
      active: pathname === '/app/inbox',
      color: 'text-green-600'
    },
    {
      name: 'Docs',
      href: '/app/docs',
      icon: FileText,
      active: pathname === '/app/docs',
      color: 'text-orange-600'
    },
    {
      name: 'Whiteboards',
      href: '/app/whiteboards',
      icon: Shapes,
      active: pathname === '/app/whiteboards',
      color: 'text-indigo-600'
    },
    {
      name: 'Dashboards',
      href: '/app/dashboards',
      icon: BarChart3,
      active: pathname === '/app/dashboards',
      color: 'text-pink-600'
    },
    {
      name: 'Sprints',
      href: '/app/sprints',
      icon: Grid,
      active: pathname === '/app/sprints',
      color: 'text-indigo-600'
    },
    {
      name: 'Goals',
      href: '/app/goals',
      icon: Target,
      active: pathname === '/app/goals',
      color: 'text-teal-600'
    },
    {
      name: 'Milestones',
      href: '/app/milestones',
      icon: Target,
      active: pathname === '/app/milestones',
      color: 'text-emerald-600'
    }
  ];

  // Favorites hidden until backed by real data
  const favorites: Array<{ name: string; href: string; icon: any; color: string }> = [];

  // Everything section items
  const everything = [
    { name: 'Assigned to me', href: '/app/assigned', icon: CheckSquare2 },
    { name: 'Created by me', href: '/app/created', icon: Plus },
    { name: 'Watching', href: '/app/watching', icon: Eye },
    { name: 'All', href: '/app/everything', icon: Grid },
    { name: 'Recently viewed', href: '/app/recent', icon: Clock },
    { name: 'Time tracking', href: '/app/time', icon: Timer },
    { name: 'Activity', href: '/app/activity', icon: Activity },
  ];

  if (sidebarCollapsed) {
    return (
      <div className={`w-12 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col ${className}`}>
        {/* Collapsed Header */}
        <div className="h-12 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center text-white font-bold hover:bg-purple-700 transition-colors"
            title="Expand sidebar"
          >
            C
          </button>
        </div>
        
        {/* Collapsed Navigation */}
        <div className="flex-1 py-2">
          {mainNavigation.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                console.log(`🔗 [Collapsed] Clicked navigation link: ${item.name} -> ${item.href}`);
                console.log(`📍 Current pathname: ${pathname}`);
                console.log(`✅ Link is active: ${item.active}`);
                
                // Force navigation
                window.location.href = item.href;
              }}
              className={`w-full h-8 flex items-center justify-center mx-1 rounded transition-colors relative group ${
                item.active
                  ? 'bg-purple-100 dark:bg-purple-900/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={item.name}
            >
              <item.icon className={`h-4 w-4 ${item.active ? item.color : 'text-gray-600 dark:text-gray-400'}`} />
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* User Avatar */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="User"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col ${className}`}>
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 relative">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold hover:bg-purple-700 transition-colors"
          >
            C
          </button>
          <div className="flex items-center space-x-1">
            <button onClick={() => setShowWorkspaceMenu((v) => !v)} className="flex items-center space-x-1">
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {workspacesLoading ? 'Loading...' : selectedWorkspace?.name || 'Workspace'}
              </span>
              <ChevronDown className="h-3 w-3 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            onClick={async () => {
              if (!selectedWorkspace?.id) return alert('Select a workspace first');
              setShowMembersModal(true);
            }}
            title="Manage members"
          >
            <Users className="h-3 w-3 text-gray-500" />
          </button>
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors relative">
            <Bell className="h-3 w-3 text-gray-500" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
      {showWorkspaceMenu && (
        <div className="absolute left-2 right-2 top-12 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
          <button
            onClick={() => {
              setShowWorkspaceMenu(false);
              setShowMembersModal(true);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Manage members
          </button>
          <button
            onClick={async () => {
              setShowWorkspaceMenu(false);
              if (!selectedWorkspace?.id) return;
              const name = prompt('Rename workspace', selectedWorkspace.name || '')
              if (!name || name === selectedWorkspace.name) return;
              try {
                await fetch(`/api/workspaces/${selectedWorkspace.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
                window.location.reload();
              } catch (e) {
                alert('Failed to rename workspace')
              }
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Rename workspace
          </button>
          <button
            onClick={async () => {
              setShowWorkspaceMenu(false);
              if (!selectedWorkspace?.id) return;
              if (!confirm('Delete this workspace? All data will be removed.')) return;
              try {
                await fetch(`/api/workspaces/${selectedWorkspace.id}`, { method: 'DELETE' })
                window.location.reload();
              } catch (e) {
                alert('Failed to delete workspace')
              }
            }}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
          >
            Delete workspace
          </button>
        </div>
      )}
      {selectedWorkspace?.id && (
        <WorkspaceMembersModal
          workspaceId={selectedWorkspace.id}
          open={showMembersModal}
          onClose={() => setShowMembersModal(false)}
        />
      )}

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks, docs, people..."
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 border-0 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700">
        {mainNavigation.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              console.log(`🔗 Clicked navigation link: ${item.name} -> ${item.href}`);
              console.log(`📍 Current pathname: ${pathname}`);
              console.log(`✅ Link is active: ${item.active}`);
              
              // Force navigation
              window.location.href = item.href;
            }}
            className={`flex items-center px-2 py-1.5 rounded text-sm font-medium transition-colors relative group ${
              item.active
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <item.icon className={`h-4 w-4 mr-2.5 ${item.active ? item.color : 'text-gray-500'}`} />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Favorites (render only if real data available) */}
      {favorites.length > 0 && (
      <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700">
        <div
          onMouseEnter={() => setHoverSection('favorites')}
          onMouseLeave={() => setHoverSection(null)}
          className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <button
            onClick={() => toggleSection('favorites')}
            className="flex items-center flex-1 min-w-0"
          >
            {expandedSections.favorites ? (
              <ChevronDown className="h-3 w-3 mr-1" />
            ) : (
              <ChevronRight className="h-3 w-3 mr-1" />
            )}
            <Star className="h-3 w-3 mr-1.5" />
            <span>FAVORITES</span>
          </button>
          {hoverSection === 'favorites' && (
            <button 
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                // Handle add favorite click here
                console.log('Add to favorites');
              }}
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
        </div>

        {expandedSections.favorites && (
          <div className="mt-1 space-y-0.5">
            {favorites.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <div 
                  className="w-2 h-2 rounded-full mr-2.5 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <item.icon className="h-3 w-3 mr-2" />
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Spaces */}
      <div className="flex-1 px-2 py-2 overflow-y-auto">
        <div
          onMouseEnter={() => setHoverSection('spaces')}
          onMouseLeave={() => setHoverSection(null)}
          className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <button
            onClick={() => toggleSection('spaces')}
            className="flex items-center flex-1 min-w-0"
          >
            {expandedSections.spaces ? (
              <ChevronDown className="h-3 w-3 mr-1" />
            ) : (
              <ChevronRight className="h-3 w-3 mr-1" />
            )}
            <span>SPACES</span>
          </button>
          {hoverSection === 'spaces' && (
            <button 
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                // Handle add space click here
                console.log('Create new space');
              }}
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
        </div>

        {expandedSections.spaces && (
          <div className="mt-1 space-y-0.5">
            {workspacesLoading && (
              <div className="flex items-center px-2 py-1 text-xs text-gray-400">
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                <span>Loading workspaces...</span>
              </div>
            )}

            {workspacesError && (
              <div className="px-2 py-1 text-xs text-red-500">
                Failed to load workspaces: {workspacesError}
              </div>
            )}

            {spacesLoading && (
              <div className="flex items-center px-2 py-1 text-xs text-gray-400">
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                <span>Loading spaces...</span>
              </div>
            )}

            {spacesError && (
              <div className="px-2 py-1 text-xs text-red-500">
                Failed to load spaces: {spacesError}
              </div>
            )}

            {spaces && spaces.map((space: any) => (
              <div key={space.id} className="group">
                <div className={`flex items-center w-full px-2 py-1 text-xs transition-colors rounded ${
                  selectedSpace?.id === space.id
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                  <button
                    onClick={() => handleSpaceClick(space)}
                    className="flex items-center flex-1 min-w-0"
                  >
                    {expandedSpaces[space.id] ? (
                      <ChevronDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ChevronRight className="h-3 w-3 mr-1" />
                    )}
                    <div
                      className="w-2 h-2 rounded mr-2.5 flex-shrink-0"
                      style={{ backgroundColor: space.color || '#8b5cf6' }}
                    />
                    <FolderOpen className="h-3 w-3 mr-2" />
                    <span className="flex-1 truncate text-left">{space.name}</span>
                  </button>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                    <button 
                      className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0"
                      title="Delete space"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Delete space "${space.name}"? All lists and tasks inside may be removed.`)) {
                          try {
                            await deleteSpace(space.id);
                            window.location.reload();
                          } catch (err) {
                            alert(err instanceof Error ? err.message : 'Failed to delete space');
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <button className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Lists under space */}
                {expandedSpaces[space.id] && (
                  <div className="ml-6 mt-0.5 space-y-0.5">
                    {listsLoading && selectedSpace?.id === space.id && (
                      <div className="flex items-center px-2 py-0.5 text-xs text-gray-400">
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        <span>Loading lists...</span>
                      </div>
                    )}

                    {listsError && selectedSpace?.id === space.id && (
                      <div className="px-2 py-0.5 text-xs text-red-500">
                        Failed to load lists: {listsError}
                      </div>
                    )}

                    {lists
                      .filter((list: any) => list.spaceId === space.id)
                      .map((list: any) => (
                        <div
                          key={list.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleListClick(list)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleListClick(list);
                            }
                          }}
                          className={`flex items-center w-full px-2 py-0.5 text-xs transition-colors rounded ${
                            selectedList?.id === list.id
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                              : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <Hash className="h-3 w-3 mr-2" />
                          <span className="truncate text-left">{list.name}</span>
                          <button
                            className="ml-auto p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="Delete list"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm(`Delete list "${list.name}"?`)) {
                                try {
                                  await deleteList(list.id);
                                  window.location.reload();
                                } catch (err) {
                                  alert(err instanceof Error ? err.message : 'Failed to delete list');
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    <button 
                      className="flex items-center px-2 py-0.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors w-full"
                      onClick={() => console.log('Add new list to space:', space.name)}
                    >
                      <Plus className="h-3 w-3 mr-2" />
                      <span>Add List</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {!spacesLoading && spaces && spaces.length === 0 && (
              <div className="px-2 py-2 text-xs text-gray-400 dark:text-gray-500">
                No spaces yet. Create your first space to get started.
              </div>
            )}
          </div>
        )}

        {/* Everything */}
        <div className="mt-4">
          <button
            onClick={() => toggleSection('everything')}
            className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <div className="flex items-center">
              {expandedSections.everything ? (
                <ChevronDown className="h-3 w-3 mr-1" />
              ) : (
                <ChevronRight className="h-3 w-3 mr-1" />
              )}
              <span>EVERYTHING</span>
            </div>
          </button>

          {expandedSections.everything && (
            <div className="mt-1 space-y-0.5">
              {everything.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center justify-between px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <div className="flex items-center">
                    <item.icon className="h-3 w-3 mr-2.5" />
                    <span>{item.name}</span>
                  </div>
                  {/* Counts removed until backed by real data */}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="User"
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {selectedWorkspace?.name || 'Workspace'}
              </p>
            </div>
          </div>
          <Link
            href="/app/settings"
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
          >
            <Settings className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}