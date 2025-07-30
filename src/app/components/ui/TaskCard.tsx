'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  AiOutlineCalendar, 
  AiOutlineUser, 
  AiOutlineFlag,
  AiOutlineDrag,
  AiOutlineClockCircle
} from 'react-icons/ai';

// Types
export interface TaskPriority {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export interface TaskStatus {
  id: string;
  name: string;
  color: string;
  bgColor: string;
}

export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Task {
  id: string;
  taskName: string;
  description: string;
  dueDate: string;
  assignee: TaskAssignee;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt?: string;
  updatedAt?: string;
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  className?: string;
}

export default function TaskCard({ 
  task, 
  isDragging = false, 
  onEdit, 
  onDelete, 
  className = '' 
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Generate avatar initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Check if task is overdue
  const isOverdue = () => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && task.status.id !== 'completed';
  };

  // Get due date color based on urgency
  const getDueDateColor = () => {
    if (isOverdue()) return 'text-red-600 dark:text-red-400';
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) return 'text-orange-600 dark:text-orange-400';
    if (daysDiff <= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 
        shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
        ${isSortableDragging ? 'opacity-50 rotate-3 scale-105 z-50' : ''}
        ${isDragging ? 'opacity-50' : ''}
        hover:border-blue-300 dark:hover:border-blue-600
        hover:-translate-y-1
        ${className}
      `}
      {...attributes}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing"
      >
        <AiOutlineDrag className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
      </div>

      <div className="p-4">
        {/* Header: Priority Badge and Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {/* Priority Badge */}
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${task.priority.bgColor} ${task.priority.textColor}
            `}>
              <AiOutlineFlag className="w-3 h-3 mr-1" />
              {task.priority.name}
            </span>
          </div>

          {/* Status Badge */}
          <span className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${task.status.bgColor} ${task.status.color}
          `}>
            {task.status.name}
          </span>
        </div>

        {/* Task Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {task.taskName}
        </h3>

        {/* Task Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {task.description}
        </p>

        {/* Footer: Assignee and Due Date */}
        <div className="flex items-center justify-between">
          {/* Assignee */}
          <div className="flex items-center space-x-2">
            {task.assignee.avatar ? (
              <img
                src={task.assignee.avatar}
                alt={task.assignee.name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {getInitials(task.assignee.name)}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {task.assignee.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {task.assignee.role}
              </p>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center space-x-1 text-sm">
            <AiOutlineCalendar className={`w-4 h-4 ${getDueDateColor()}`} />
            <span className={`font-medium ${getDueDateColor()}`}>
              {formatDueDate(task.dueDate)}
            </span>
            {isOverdue() && (
              <AiOutlineClockCircle className="w-4 h-4 text-red-600 dark:text-red-400 ml-1" />
            )}
          </div>
        </div>

        {/* Action Buttons (appear on hover) */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
              title="Edit task"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && task.status.id !== 'completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
              title="Delete task"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Overdue indicator */}
      {isOverdue() && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl"></div>
      )}
    </div>
  );
} 