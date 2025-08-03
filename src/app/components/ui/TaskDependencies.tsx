'use client';

import { useState, useEffect } from 'react';
import { Link, Unlink, Search, X } from 'lucide-react';
import { useTasks } from '@/hooks/useData';

interface Task {
  id: string;
  name: string;
  status: string;
  priority: string;
  list: { name: string; color?: string };
  assignee?: { name: string; image?: string };
}

interface TaskDependenciesProps {
  taskId: string;
  dependencies: string[];
  blockedBy: string[];
  onUpdate: (dependencies: string[], blockedBy: string[]) => void;
}

export default function TaskDependencies({
  taskId,
  dependencies,
  blockedBy,
  onUpdate
}: TaskDependenciesProps) {
  const { data: allTasks } = useTasks();
  const [showAddDependency, setShowAddDependency] = useState(false);
  const [dependencyType, setDependencyType] = useState<'blocks' | 'blocked_by'>('blocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Filter tasks for dependency selection
  useEffect(() => {
    if (!allTasks || !searchQuery) {
      setFilteredTasks([]);
      return;
    }

    const filtered = allTasks.filter((task: Task) => 
      task.id !== taskId && 
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !dependencies.includes(task.id) &&
      !blockedBy.includes(task.id)
    );
    setFilteredTasks(filtered.slice(0, 10)); // Limit to 10 results
  }, [allTasks, searchQuery, taskId, dependencies, blockedBy]);

  const getDependentTasks = (taskIds: string[]) => {
    if (!allTasks) return [];
    return allTasks.filter((task: Task) => taskIds.includes(task.id));
  };

  const addDependency = (targetTaskId: string) => {
    if (dependencyType === 'blocks') {
      onUpdate([...dependencies, targetTaskId], blockedBy);
    } else {
      onUpdate(dependencies, [...blockedBy, targetTaskId]);
    }
    setSearchQuery('');
    setShowAddDependency(false);
  };

  const removeDependency = (targetTaskId: string, type: 'blocks' | 'blocked_by') => {
    if (type === 'blocks') {
      onUpdate(dependencies.filter(id => id !== targetTaskId), blockedBy);
    } else {
      onUpdate(dependencies, blockedBy.filter(id => id !== targetTaskId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'DONE': return 'bg-green-100 text-green-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const dependentTasks = getDependentTasks(dependencies);
  const blockingTasks = getDependentTasks(blockedBy);

  return (
    <div className="space-y-6">
      {/* This task blocks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
            <Link className="h-4 w-4 mr-2 text-orange-500" />
            This task blocks ({dependentTasks.length})
          </h4>
          <button
            onClick={() => {
              setDependencyType('blocks');
              setShowAddDependency(true);
            }}
            className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
          >
            + Add
          </button>
        </div>

        {dependentTasks.length > 0 ? (
          <div className="space-y-2">
            {dependentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-800"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: task.list.color || '#6b7280' }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {task.list.name} • {task.assignee?.name || 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => removeDependency(task.id, 'blocks')}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No blocking dependencies</p>
        )}
      </div>

      {/* This task is blocked by */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
            <Unlink className="h-4 w-4 mr-2 text-red-500" />
            This task is blocked by ({blockingTasks.length})
          </h4>
          <button
            onClick={() => {
              setDependencyType('blocked_by');
              setShowAddDependency(true);
            }}
            className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
          >
            + Add
          </button>
        </div>

        {blockingTasks.length > 0 ? (
          <div className="space-y-2">
            {blockingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: task.list.color || '#6b7280' }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {task.list.name} • {task.assignee?.name || 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => removeDependency(task.id, 'blocked_by')}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No blocking dependencies</p>
        )}
      </div>

      {/* Add Dependency Modal */}
      {showAddDependency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add {dependencyType === 'blocks' ? 'Blocking' : 'Blocked By'} Dependency
              </h3>
              <button
                onClick={() => setShowAddDependency(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
            </div>

            {searchQuery && (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => addDependency(task.id)}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: task.list.color || '#6b7280' }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {task.list.name} • {task.assignee?.name || 'Unassigned'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic p-3">
                    No tasks found matching "{searchQuery}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}