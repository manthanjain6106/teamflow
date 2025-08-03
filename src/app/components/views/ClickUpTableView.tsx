'use client';

import { useState, useMemo } from 'react';
import { 
  Table, 
  ChevronDown, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Plus,
  MoreHorizontal,
  Edit,
  Calendar,
  User,
  Flag,
  CheckSquare,
  Archive,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTasks } from '@/hooks/useData';
import { useStore } from '@/store/useStore';
import WorkingTaskModal from '../ui/WorkingTaskModal';

interface TableColumn {
  key: string;
  label: string;
  width: number;
  sortable: boolean;
  type: 'text' | 'status' | 'priority' | 'assignee' | 'date' | 'progress' | 'custom';
  visible: boolean;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export default function ClickUpTableView() {
  const { selectedSpace, selectedList } = useStore();
  const { data: tasks = [], loading, refetch } = useTasks(selectedList?.id, selectedSpace?.id);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const [columns, setColumns] = useState<TableColumn[]>([
    { key: 'select', label: '', width: 50, sortable: false, type: 'text', visible: true },
    { key: 'name', label: 'Task name', width: 300, sortable: true, type: 'text', visible: true },
    { key: 'assignee', label: 'Assignee', width: 150, sortable: true, type: 'assignee', visible: true },
    { key: 'status', label: 'Status', width: 150, sortable: true, type: 'status', visible: true },
    { key: 'priority', label: 'Priority', width: 120, sortable: true, type: 'priority', visible: true },
    { key: 'dueDate', label: 'Due date', width: 150, sortable: true, type: 'date', visible: true },
    { key: 'tags', label: 'Tags', width: 150, sortable: false, type: 'text', visible: true },
    { key: 'timeTracked', label: 'Time tracked', width: 150, sortable: true, type: 'text', visible: false },
    { key: 'created', label: 'Created', width: 150, sortable: true, type: 'date', visible: false },
    { key: 'updated', label: 'Updated', width: 150, sortable: true, type: 'date', visible: false },
  ]);

  // Sort and filter tasks
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(task => {
          switch (key) {
            case 'status':
              return task.status === value;
            case 'priority':
              return task.priority === value;
            case 'assignee':
              return task.assigneeId === value;
            default:
              return true;
          }
        });
      }
    });

    // Apply sorting
    result.sort((a, b) => {
      const aValue = getTaskValue(a, sortConfig.key);
      const bValue = getTaskValue(b, sortConfig.key);
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, filters, sortConfig]);

  const getTaskValue = (task: any, key: string) => {
    switch (key) {
      case 'name': return task.name?.toLowerCase() || '';
      case 'assignee': return task.assignee?.name?.toLowerCase() || '';
      case 'status': return task.status || '';
      case 'priority': return task.priority || '';
      case 'dueDate': return task.dueDate || '';
      case 'created': return task.createdAt || '';
      case 'updated': return task.updatedAt || '';
      default: return '';
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRowSelect = (taskId: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedRows(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === processedTasks.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(processedTasks.map(task => task.id)));
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleCreateTask = () => {
    const newTask = {
      name: '',
      description: '',
      status: 'OPEN',
      priority: 'NORMAL',
      listId: selectedList?.id || '',
      assigneeId: ''
    };
    setSelectedTask(newTask);
    setShowTaskModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DONE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CANCELED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 font-bold';
      case 'HIGH': return 'text-orange-600 font-semibold';
      case 'NORMAL': return 'text-blue-600';
      case 'LOW': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const visibleColumns = columns.filter(col => col.visible);

  if (loading) {
    return (
      <div className="flex-1 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <span>Loading table view...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Table className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Table View
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <EyeOff className="h-4 w-4" />
              <span>Columns</span>
            </button>
            
            <button className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {selectedRows.size > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900 rounded">
              <span className="text-sm text-purple-800 dark:text-purple-200">
                {selectedRows.size} selected
              </span>
              <button className="text-purple-600 hover:text-purple-700">
                <Archive className="h-4 w-4" />
              </button>
              <button className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <button
            onClick={handleCreateTask}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                >
                  {column.key === 'select' ? (
                    <input
                      type="checkbox"
                      checked={selectedRows.size === processedTasks.length && processedTasks.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  ) : (
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {sortConfig.key === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <SortAsc className="h-3 w-3" />
                            ) : (
                              <SortDesc className="h-3 w-3" />
                            )
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {processedTasks.map((task, index) => (
              <tr
                key={task.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedRows.has(task.id) ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
              >
                {visibleColumns.map((column) => (
                  <td
                    key={column.key}
                    className="px-4 py-3 text-sm border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                  >
                    {column.key === 'select' ? (
                      <input
                        type="checkbox"
                        checked={selectedRows.has(task.id)}
                        onChange={() => handleRowSelect(task.id)}
                        className="rounded"
                      />
                    ) : column.key === 'name' ? (
                      <button
                        onClick={() => handleTaskClick(task)}
                        className="text-left hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {task.name}
                        </div>
                        {task.description && (
                          <div className="text-gray-500 text-xs mt-1 truncate max-w-xs">
                            {task.description}
                          </div>
                        )}
                      </button>
                    ) : column.key === 'assignee' ? (
                      <div className="flex items-center space-x-2">
                        {task.assignee?.image ? (
                          <img
                            src={task.assignee.image}
                            alt={task.assignee.name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-gray-600" />
                          </div>
                        )}
                        <span className="text-gray-900 dark:text-white">
                          {task.assignee?.name || 'Unassigned'}
                        </span>
                      </div>
                    ) : column.key === 'status' ? (
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    ) : column.key === 'priority' ? (
                      <div className={`flex items-center space-x-1 ${getPriorityColor(task.priority)}`}>
                        <Flag className="h-3 w-3" />
                        <span>{task.priority}</span>
                      </div>
                    ) : column.key === 'dueDate' ? (
                      task.dueDate ? (
                        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )
                    ) : column.key === 'tags' ? (
                      <div className="flex flex-wrap gap-1">
                        {task.tags?.map((tag: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                          >
                            {tag.tag.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {processedTasks.length === 0 && (
          <div className="text-center py-12">
            <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks yet
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first task
            </p>
            <button
              onClick={handleCreateTask}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </button>
          </div>
        )}
      </div>

      {/* Column Settings */}
      {showColumnSettings && (
        <div className="absolute top-16 right-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-10 w-64">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Show/Hide Columns
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {columns.filter(col => col.key !== 'select').map((column) => (
              <label key={column.key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={column.visible}
                  onChange={(e) => {
                    setColumns(prev => prev.map(col =>
                      col.key === column.key ? { ...col, visible: e.target.checked } : col
                    ));
                  }}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {column.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <WorkingTaskModal
          task={selectedTask}
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onSave={() => {
            refetch();
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}