'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useTasks } from '@/hooks/useData';
import { createTask, updateTask, deleteTask } from '@/lib/api';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  CheckSquare2,
  Square,
  Calendar,
  User,
  Flag,
  Clock,
  MessageSquare,
  Paperclip,
  Star,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle,
  Circle,
  Loader2
} from 'lucide-react';

interface ClickUpTaskListProps {
  listId?: string;
  spaceId?: string;
}

export default function ClickUpTaskList({ listId, spaceId }: ClickUpTaskListProps) {
  const { currentView, selectedSpace, selectedList } = useStore();
  const [groupBy, setGroupBy] = useState('status');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch real tasks data
  const { tasks: allTasks, loading, error, refetch } = useTasks({
    listId: listId || selectedList?.id,
    spaceId: spaceId || selectedSpace?.id
  });

  // Group tasks
  const groupTasks = (tasks: any[]) => {
    const groups: Record<string, any[]> = {};
    
    tasks.forEach(task => {
      let groupKey = '';
      let groupName = '';
      
      switch (groupBy) {
        case 'status':
          groupKey = task.status || 'TODO';
          groupName = formatStatusName(task.status || 'TODO');
          break;
        case 'priority':
          groupKey = task.priority || 'NORMAL';
          groupName = formatPriorityName(task.priority || 'NORMAL');
          break;
        case 'assignee':
          groupKey = task.assigneeId || 'unassigned';
          groupName = task.assignee ? task.assignee.name : 'Unassigned';
          break;
        case 'dueDate':
          if (!task.dueDate) {
            groupKey = 'no-due-date';
            groupName = 'No Due Date';
          } else {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff < 0) {
              groupKey = 'overdue';
              groupName = 'Overdue';
            } else if (daysDiff === 0) {
              groupKey = 'today';
              groupName = 'Today';
            } else if (daysDiff <= 7) {
              groupKey = 'this-week';
              groupName = 'This Week';
            } else {
              groupKey = 'later';
              groupName = 'Later';
            }
          }
          break;
        default:
          groupKey = 'all';
          groupName = 'All Tasks';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
        groups[groupKey].groupName = groupName;
        groups[groupKey].groupKey = groupKey;
      }
      
      groups[groupKey].push(task);
    });
    
    return groups;
  };

  const formatStatusName = (status: string) => {
    switch (status) {
      case 'TODO': return 'To Do';
      case 'IN_PROGRESS': return 'In Progress';
      case 'IN_REVIEW': return 'In Review';
      case 'DONE': return 'Done';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const formatPriorityName = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'Urgent';
      case 'HIGH': return 'High';
      case 'NORMAL': return 'Normal';
      case 'LOW': return 'Low';
      default: return priority;
    }
  };

  const groupedTasks = groupTasks(allTasks);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleCreateTask = async () => {
    if (!newTaskName.trim() || !selectedList?.id) return;

    try {
      setIsCreating(true);
      await createTask({
        name: newTaskName.trim(),
        listId: selectedList.id,
        status: 'TODO',
        priority: 'NORMAL'
      });
      setNewTaskName('');
      refetch();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: any) => {
    try {
      await updateTask(taskId, updates);
      refetch();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      refetch();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'HIGH':
        return <ArrowUp className="h-3 w-3 text-orange-500" />;
      case 'NORMAL':
        return <Minus className="h-3 w-3 text-yellow-500" />;
      case 'LOW':
        return <ArrowDown className="h-3 w-3 text-green-500" />;
      default:
        return <Circle className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckSquare2 className="h-4 w-4 text-green-500" />;
      default:
        return <Square className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#ef4444';
      case 'HIGH': return '#f59e0b';
      case 'NORMAL': return '#8b5cf6';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return '#6b7280';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'IN_REVIEW': return '#f59e0b';
      case 'DONE': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Initialize expanded groups
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    Object.keys(groupedTasks).forEach(key => {
      initialExpanded[key] = true;
    });
    setExpandedGroups(initialExpanded);
  }, [groupBy, allTasks]);

  if (loading) {
    return (
      <div className="flex-1 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load tasks</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button 
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white dark:bg-gray-900">
      {/* List Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {/* Controls Row */}
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Group By Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 font-medium">Group by:</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="text-xs border-0 bg-transparent text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer"
              >
                <option value="status">Status</option>
                <option value="priority">Priority</option>
                <option value="assignee">Assignee</option>
                <option value="dueDate">Due Date</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <Eye className="h-4 w-4 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
            <div className="w-8"></div>
            <div className="flex-1">Task name</div>
            <div className="w-20 text-center">Assignee</div>
            <div className="w-16 text-center">Priority</div>
            <div className="w-20 text-center">Due date</div>
            <div className="w-16 text-center">Time</div>
            <div className="w-12 text-center">
              <MessageSquare className="h-3 w-3 mx-auto" />
            </div>
            <div className="w-12 text-center">
              <Paperclip className="h-3 w-3 mx-auto" />
            </div>
            <div className="w-8"></div>
          </div>
        </div>
      </div>

      {/* Task Groups */}
      <div className="flex-1 overflow-auto">
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <CheckSquare2 className="h-12 w-12 mx-auto mb-2" />
              <p>No tasks found</p>
              <p className="text-sm">Create your first task to get started</p>
            </div>
            {selectedList && (
              <div className="flex items-center justify-center space-x-2 mt-4">
                <input
                  type="text"
                  placeholder="Task name"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleCreateTask}
                  disabled={isCreating || !newTaskName.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-1"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span>Add Task</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          Object.entries(groupedTasks).map(([groupKey, tasks]) => (
            <div key={groupKey} className="border-b border-gray-100 dark:border-gray-800">
              {/* Group Header */}
              <div
                className="px-4 py-2 bg-gray-50 dark:bg-gray-800 flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => toggleGroup(groupKey)}
              >
                {expandedGroups[groupKey] ? (
                  <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                )}
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ 
                      backgroundColor: groupBy === 'status' 
                        ? getStatusColor(groupKey) 
                        : groupBy === 'priority' 
                        ? getPriorityColor(groupKey) 
                        : '#6b7280' 
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {(tasks as any).groupName}
                  </span>
                  <span className="text-xs text-gray-500">({tasks.length})</span>
                </div>
              </div>

              {/* Group Tasks */}
              {expandedGroups[groupKey] && (
                <div>
                  {tasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 group"
                    >
                      <div className="flex items-center text-sm">
                        {/* Checkbox */}
                        <div className="w-8 flex justify-center">
                          <button
                            onClick={() => toggleTaskSelection(task.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {selectedTasks.includes(task.id) ? (
                              <CheckSquare2 className="h-4 w-4 text-blue-500" />
                            ) : (
                              getStatusIcon(task.status)
                            )}
                          </button>
                        </div>

                        {/* Task Name */}
                        <div className="flex-1 flex items-center space-x-2">
                          {getPriorityIcon(task.priority)}
                          <span className="text-gray-900 dark:text-white font-medium">
                            {task.name}
                          </span>
                          {task.description && (
                            <span className="text-xs text-gray-500">
                              {task.description.substring(0, 50)}...
                            </span>
                          )}
                        </div>

                        {/* Assignee */}
                        <div className="w-20 text-center">
                          {task.assignee ? (
                            <div className="flex items-center justify-center">
                              {task.assignee.image ? (
                                <img
                                  src={task.assignee.image}
                                  alt={task.assignee.name}
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                                  {task.assignee.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                          ) : (
                            <User className="h-4 w-4 text-gray-400 mx-auto" />
                          )}
                        </div>

                        {/* Priority */}
                        <div className="w-16 flex justify-center">
                          <div className="flex items-center space-x-1">
                            {getPriorityIcon(task.priority)}
                          </div>
                        </div>

                        {/* Due Date */}
                        <div className="w-20 text-center">
                          {task.dueDate ? (
                            <div className="text-xs text-gray-500">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          ) : (
                            <Calendar className="h-4 w-4 text-gray-400 mx-auto" />
                          )}
                        </div>

                        {/* Time Tracked */}
                        <div className="w-16 text-center">
                          <div className="text-xs text-gray-500">
                            {task.timeEntries?.length > 0 ? (
                              `${Math.floor(task.timeEntries.reduce((total: number, entry: any) => total + entry.duration, 0) / 3600)}h`
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400 mx-auto" />
                            )}
                          </div>
                        </div>

                        {/* Comments */}
                        <div className="w-12 text-center">
                          <div className="text-xs text-gray-500">
                            {task._count?.comments > 0 && task._count.comments}
                          </div>
                        </div>

                        {/* Attachments */}
                        <div className="w-12 text-center">
                          <div className="text-xs text-gray-500">
                            {task._count?.attachments > 0 && task._count.attachments}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="w-8 flex justify-center">
                          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Task Row */}
                  {selectedList && groupKey === 'TODO' && (
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 flex justify-center">
                          <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Add a task..."
                          value={newTaskName}
                          onChange={(e) => setNewTaskName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
                          className="flex-1 bg-transparent border-0 focus:ring-0 text-sm text-gray-600 dark:text-gray-400 placeholder-gray-400"
                        />
                        {newTaskName.trim() && (
                          <button
                            onClick={handleCreateTask}
                            disabled={isCreating}
                            className="text-blue-500 hover:text-blue-600 text-sm font-medium disabled:opacity-50"
                          >
                            {isCreating ? 'Adding...' : 'Add'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}