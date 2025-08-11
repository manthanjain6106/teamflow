'use client';

import { useState } from 'react';
import { 
  Archive, 
  Trash2, 
  Edit, 
  Copy, 
  Move, 
  Tag, 
  User, 
  Calendar, 
  Flag,
  CheckSquare,
  MoreHorizontal,
  X
} from 'lucide-react';

interface BulkOperationsProps {
  selectedTasks: string[];
  onClearSelection: () => void;
  onBulkUpdate: (updates: any) => void;
  onBulkDelete: () => void;
  onBulkArchive: () => void;
  onBulkMove: (listId: string) => void;
}

export default function BulkOperations({
  selectedTasks,
  onClearSelection,
  onBulkUpdate,
  onBulkDelete,
  onBulkArchive,
  onBulkMove
}: BulkOperationsProps) {
  const [showActions, setShowActions] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [bulkUpdates, setBulkUpdates] = useState({
    status: '',
    priority: '',
    assigneeId: '',
    dueDate: ''
  });

  const handleBulkUpdate = (field: string, value: any) => {
    const updates = { [field]: value };
    onBulkUpdate(updates);
    setShowUpdateModal(false);
  };

  const statusOptions = [
  { value: 'TODO', label: 'To do', color: 'bg-gray-100 text-gray-800' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'DONE', label: 'Done', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low', icon: '⬇️' },
    { value: 'NORMAL', label: 'Normal', icon: '➡️' },
    { value: 'HIGH', label: 'High', icon: '⬆️' },
    { value: 'URGENT', label: 'Urgent', icon: '🔥' }
  ];

  if (selectedTasks.length === 0) return null;

  return (
    <>
      {/* Bulk Actions Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedTasks.length} task{selectedTasks.length === 1 ? '' : 's'} selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

          <div className="flex items-center space-x-2">
            {/* Quick Actions */}
            <button
              onClick={() => setShowUpdateModal(true)}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Edit fields"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => setShowMoveModal(true)}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Move to list"
            >
              <Move className="h-4 w-4" />
              <span>Move</span>
            </button>

            <button
              onClick={onBulkArchive}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Archive tasks"
            >
              <Archive className="h-4 w-4" />
              <span>Archive</span>
            </button>

            <button
              onClick={onBulkDelete}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              title="Delete tasks"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>

            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Extended Actions */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-4 gap-2">
              <button className="flex items-center justify-center space-x-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Copy className="h-4 w-4" />
                <span>Duplicate</span>
              </button>
              <button className="flex items-center justify-center space-x-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Tag className="h-4 w-4" />
                <span>Add Tags</span>
              </button>
              <button className="flex items-center justify-center space-x-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <User className="h-4 w-4" />
                <span>Assign</span>
              </button>
              <button className="flex items-center justify-center space-x-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Calendar className="h-4 w-4" />
                <span>Set Due Date</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Update {selectedTasks.length} Task{selectedTasks.length === 1 ? '' : 's'}
              </h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleBulkUpdate('status', status.value)}
                      className={`p-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 ${status.color}`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {priorityOptions.map((priority) => (
                    <button
                      key={priority.value}
                      onClick={() => handleBulkUpdate('priority', priority.value)}
                      className="flex items-center justify-center space-x-2 p-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <span>{priority.icon}</span>
                      <span>{priority.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  onChange={(e) => e.target.value && handleBulkUpdate('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Move Tasks Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Move {selectedTasks.length} Task{selectedTasks.length === 1 ? '' : 's'}
              </h3>
              <button
                onClick={() => setShowMoveModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select a destination list:
              </p>
              
              {/* List selection would go here */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onBulkMove('target-list-id');
                    setShowMoveModal(false);
                  }}
                  className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="font-medium text-gray-900 dark:text-white">Target List</div>
                  <div className="text-sm text-gray-500">Space Name</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}