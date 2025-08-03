'use client';

import { useState } from 'react';
import { Plus, Check, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
  dueDate?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  subtasks?: Subtask[];
}

interface SubtaskManagerProps {
  taskId: string;
  subtasks: Subtask[];
  onUpdate: (subtasks: Subtask[]) => void;
}

export default function SubtaskManager({ taskId, subtasks, onUpdate }: SubtaskManagerProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());

  const addSubtask = (parentId?: string) => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title: newSubtaskTitle,
      completed: false,
      priority: 'NORMAL'
    };

    if (parentId) {
      // Add nested subtask
      const updateSubtasks = (tasks: Subtask[]): Subtask[] => {
        return tasks.map(task => {
          if (task.id === parentId) {
            return {
              ...task,
              subtasks: [...(task.subtasks || []), newSubtask]
            };
          }
          if (task.subtasks) {
            return {
              ...task,
              subtasks: updateSubtasks(task.subtasks)
            };
          }
          return task;
        });
      };
      onUpdate(updateSubtasks(subtasks));
    } else {
      // Add root level subtask
      onUpdate([...subtasks, newSubtask]);
    }

    setNewSubtaskTitle('');
  };

  const toggleSubtask = (id: string) => {
    const updateSubtasks = (tasks: Subtask[]): Subtask[] => {
      return tasks.map(task => {
        if (task.id === id) {
          return { ...task, completed: !task.completed };
        }
        if (task.subtasks) {
          return {
            ...task,
            subtasks: updateSubtasks(task.subtasks)
          };
        }
        return task;
      });
    };
    onUpdate(updateSubtasks(subtasks));
  };

  const deleteSubtask = (id: string) => {
    const removeSubtask = (tasks: Subtask[]): Subtask[] => {
      return tasks.filter(task => task.id !== id).map(task => ({
        ...task,
        subtasks: task.subtasks ? removeSubtask(task.subtasks) : undefined
      }));
    };
    onUpdate(removeSubtask(subtasks));
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedSubtasks);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSubtasks(newExpanded);
  };

  const renderSubtask = (subtask: Subtask, depth = 0) => {
    const hasSubtasks = subtask.subtasks && subtask.subtasks.length > 0;
    const isExpanded = expandedSubtasks.has(subtask.id);

    return (
      <div key={subtask.id} className={`ml-${depth * 4}`}>
        <div className="flex items-center space-x-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md group">
          {hasSubtasks && (
            <button
              onClick={() => toggleExpanded(subtask.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          
          <button
            onClick={() => toggleSubtask(subtask.id)}
            className={`flex-shrink-0 w-4 h-4 border-2 rounded flex items-center justify-center ${
              subtask.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            {subtask.completed && <Check className="h-3 w-3" />}
          </button>

          <span
            className={`flex-1 ${
              subtask.completed
                ? 'line-through text-gray-500 dark:text-gray-400'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {subtask.title}
          </span>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => addSubtask(subtask.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => deleteSubtask(subtask.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {hasSubtasks && isExpanded && (
          <div className="ml-6">
            {subtask.subtasks!.map(sub => renderSubtask(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const completedCount = subtasks.filter(s => s.completed).length;
  const totalCount = subtasks.length;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-500">
            {completedCount}/{totalCount}
          </span>
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-1">
        {subtasks.map(subtask => renderSubtask(subtask))}
      </div>

      {/* Add New Subtask */}
      <div className="flex items-center space-x-2 p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
        <Plus className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Add subtask..."
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
          className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500"
        />
        {newSubtaskTitle && (
          <button
            onClick={() => addSubtask()}
            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}