'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Flag, CheckSquare, Users } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useLists } from '@/hooks/useData';
import { useStore } from '@/store/useStore';

interface Task {
  id?: string;
  name: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  dueDate?: string;
  startDate?: string;
  assigneeId?: string;
  listId: string;
}

interface WorkingTaskModalProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  defaultDueDate?: Date | null;
}

const WorkingTaskModal: React.FC<WorkingTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  defaultDueDate
}) => {
  const { selectedWorkspace, selectedSpace, selectedList, lists } = useStore();
  // Prefer the space of the provided task, fallback to selectedSpace
  const effectiveSpaceId = (task as any)?.list?.space?.id || selectedSpace?.id;
  // Ensure lists are available even if store is empty
  const { lists: fetchedLists } = useLists(effectiveSpaceId);
  const { users, loading: usersLoading } = useUsers(selectedWorkspace?.id);
  
  const [formData, setFormData] = useState<Task>({
    name: '',
    description: '',
    status: 'TODO',
    priority: 'NORMAL',
    dueDate: '',
    startDate: '',
    assigneeId: '',
    listId: selectedList?.id || (lists && lists.length > 0 ? lists[0].id : (fetchedLists && fetchedLists.length > 0 ? fetchedLists[0].id : ''))
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        startDate: task.startDate ? task.startDate.split('T')[0] : '',
        assigneeId: task.assigneeId || '',
        listId: task.listId
      });
    } else {
      // New task
      setFormData({
        name: '',
        description: '',
        status: 'TODO',
        priority: 'NORMAL',
        dueDate: defaultDueDate ? defaultDueDate.toISOString().split('T')[0] : '',
        startDate: new Date().toISOString().split('T')[0],
        assigneeId: '',
        listId: selectedList?.id || (lists && lists.length > 0 ? lists[0].id : (fetchedLists && fetchedLists.length > 0 ? fetchedLists[0].id : ''))
      });
    }
  }, [task, defaultDueDate, selectedList, lists, fetchedLists]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Task name is required');
      return;
    }

    if (!formData.listId) {
      setError('Please select a list');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        assigneeId: formData.assigneeId || undefined
      };

      if (task?.id) {
        // Update existing task
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          throw new Error('Failed to update task');
        }
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          throw new Error('Failed to create task');
        }
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'TODO', label: 'To do', color: 'bg-blue-500' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-500' },
    { value: 'IN_REVIEW', label: 'In Review', color: 'bg-purple-500' },
    { value: 'DONE', label: 'Done', color: 'bg-green-500' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-500' }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low', color: 'text-gray-500' },
    { value: 'NORMAL', label: 'Normal', color: 'text-blue-500' },
    { value: 'HIGH', label: 'High', color: 'text-orange-500' },
    { value: 'URGENT', label: 'Urgent', color: 'text-red-500' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter task name..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter task description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assignee */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="h-4 w-4" />
                  <span>Assignee</span>
                </label>
                <select
                  value={formData.assigneeId}
                  onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {usersLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading users...</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Flag className="h-4 w-4" />
                  <span>Priority</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <CheckSquare className="h-4 w-4" />
                  <span>Status</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* List */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="h-4 w-4" />
                  <span>List</span>
                </label>
                <select
                  value={formData.listId}
                  onChange={(e) => setFormData({ ...formData, listId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a list</option>
                  {(lists?.length ? lists : fetchedLists || []).map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
                {(!lists?.length && !(fetchedLists && fetchedLists.length)) && (
                  <p className="mt-2 text-xs text-gray-500">
                    No lists found. Create a Space and List first from the + menu in the header, or select a Space in the sidebar.
                  </p>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Start Date</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Due Date</span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkingTaskModal;