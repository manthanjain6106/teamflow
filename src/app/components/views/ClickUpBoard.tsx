'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '@/store/useStore';
import { useTasks } from '@/hooks/useData';
import { createTask, updateTask, deleteTask } from '@/lib/api';
import WorkingTaskModal from '../ui/WorkingTaskModal';

interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  dueDate?: string;
  startDate?: string;
  assigneeId?: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  list: {
    id: string;
    name: string;
    color?: string;
  };
  tags?: Array<{ tag: { name: string } }>;
  _count?: {
    comments: number;
    attachments: number;
  };
  timeEntries?: Array<{ duration: number }>;
}

import {
  Plus,
  MoreHorizontal,
  Calendar,
  User,
  MessageSquare,
  Paperclip,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle,
  Circle,
  Loader2
} from 'lucide-react';

interface BoardColumn {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
  limit?: number;
}

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: (task: Task) => void;
}

function TaskCard({ task, isDragging = false, onClick }: TaskCardProps) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-2 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${
        isSortableDragging ? 'opacity-50 rotate-2 scale-105' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getPriorityIcon(task.priority)}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            #{task.id.slice(-6)}
          </span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <MoreHorizontal className="h-3 w-3 text-gray-400" />
        </button>
      </div>

      {/* Task Title */}
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
        {task.name}
      </h3>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tagRelation: any, index: number) => (
            <span
              key={index}
              className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full"
            >
              {tagRelation.tag?.name || tagRelation}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-gray-400">+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between">
        {/* Left side - Due date */}
        <div className="flex items-center space-x-2">
          {task.dueDate && (
            <div className={`flex items-center space-x-1 text-xs ${
              isOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-500'
            }`}>
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Right side - Stats and assignee */}
        <div className="flex items-center space-x-2">
          {/* Comments count */}
          {task._count?.comments > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <MessageSquare className="h-3 w-3" />
              <span>{task._count.comments}</span>
            </div>
          )}

          {/* Attachments count */}
          {task._count?.attachments > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Paperclip className="h-3 w-3" />
              <span>{task._count.attachments}</span>
            </div>
          )}

          {/* Time tracked */}
          {task.timeEntries?.length > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>
                {Math.floor(task.timeEntries.reduce((total: number, entry: any) => total + entry.duration, 0) / 3600)}h
              </span>
            </div>
          )}

          {/* Assignee */}
          {task.assignee ? (
            <div className="flex items-center">
              {task.assignee.image ? (
                <img
                  src={task.assignee.image}
                  alt={task.assignee.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                  {task.assignee.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          ) : (
            <User className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}

interface ClickUpBoardProps {
  listId?: string;
  spaceId?: string;
}

export default function ClickUpBoard({ listId, spaceId }: ClickUpBoardProps) {
  const { selectedSpace, selectedList } = useStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [boardColumns, setBoardColumns] = useState<BoardColumn[]>([]);
  const [newTaskNames, setNewTaskNames] = useState<Record<string, string>>({});
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState<Record<string, boolean>>({});

  // Fetch real tasks data
  const { tasks: allTasks, loading, error, refetch } = useTasks({
    listId: listId || selectedList?.id,
    spaceId: spaceId || selectedSpace?.id
  });

  // Define board columns based on task statuses
  const defaultColumns: BoardColumn[] = [
    {
      id: 'TODO',
      name: 'To Do',
      color: '#6b7280',
      tasks: []
    },
    {
      id: 'IN_PROGRESS',
      name: 'In Progress',
      color: '#3b82f6',
      tasks: []
    },
    {
      id: 'IN_REVIEW',
      name: 'In Review',
      color: '#f59e0b',
      tasks: []
    },
    {
      id: 'DONE',
      name: 'Done',
      color: '#10b981',
      tasks: []
    }
  ];

  // Organize tasks by status
  useEffect(() => {
    const columns = defaultColumns.map(column => ({
      ...column,
      tasks: allTasks.filter(task => task.status === column.id)
    }));
    setBoardColumns(columns);
  }, [allTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = allTasks.find(t => t.id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Find the task
    const task = allTasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    try {
      // Update task status
      await updateTask(taskId, { status: newStatus });
      refetch();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleCreateTask = async (status: string) => {
    const taskName = newTaskNames[status]?.trim();
    if (!taskName || !selectedList?.id) return;

    try {
      setIsCreating(prev => ({ ...prev, [status]: true }));
      await createTask({
        name: taskName,
        listId: selectedList.id,
        status: status as any,
        priority: 'NORMAL'
      });
      setNewTaskNames(prev => ({ ...prev, [status]: '' }));
      refetch();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsCreating(prev => ({ ...prev, [status]: false }));
    }
  };

  // Uncomment when delete functionality is needed
  // const handleDeleteTask = async (taskId: string) => {
  //   try {
  //     await deleteTask(taskId);
  //     refetch();
  //   } catch (error) {
  //     console.error('Failed to delete task:', error);
  //   }
  // };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskUpdate = () => {
    refetch();
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleCreateTaskWithModal = (status: string) => {
    const newTask: Partial<Task> = {
      name: '',
      description: '',
      status: status as Task['status'],
      priority: 'NORMAL',
      assigneeId: ''
    };
    setSelectedTask(newTask as Task);
    setShowTaskModal(true);
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading board...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load board</p>
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
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 overflow-hidden">
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <div className="flex space-x-4 h-full overflow-x-auto">
          {boardColumns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              {/* Column Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {column.name}
                    </h3>
                    <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      {column.tasks.length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Plus className="h-4 w-4 text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Column Content */}
              <div className="p-4 flex-1 overflow-y-auto">
                <SortableContext 
                  items={column.tasks.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {column.tasks.map((task) => (
                      <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
                    ))}
                  </div>
                </SortableContext>

                {/* Add Task Input */}
                {selectedList && (
                  <div className="mt-3">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Add a task..."
                          value={newTaskNames[column.id] || ''}
                          onChange={(e) => setNewTaskNames(prev => ({ 
                            ...prev, 
                            [column.id]: e.target.value 
                          }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleCreateTask(column.id)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                        />
                        {newTaskNames[column.id]?.trim() && (
                          <button
                            onClick={() => handleCreateTask(column.id)}
                            disabled={isCreating[column.id]}
                            className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-1"
                          >
                            {isCreating[column.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleCreateTaskWithModal(column.id)}
                        className="w-full px-3 py-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors flex items-center justify-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create with details</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add Column Button */}
          <div className="flex-shrink-0 w-80">
            <button className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 dark:hover:border-gray-500 dark:hover:text-gray-400 transition-colors">
              <div className="text-center">
                <Plus className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Add column</span>
              </div>
            </button>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Modal */}
      {showTaskModal && (
        <WorkingTaskModal
          task={selectedTask}
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onSave={handleTaskUpdate}
        />
      )}
    </div>
  );
}