'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import TaskCard, { Task } from './TaskCard';

// Column configuration interface
export interface BoardColumn {
  id: string;
  title: string;
  description?: string;
  color?: string;
  maxTasks?: number;
  allowDrop?: boolean;
}

// Project board props
export interface ProjectBoardProps {
  columns: BoardColumn[];
  tasks: Task[];
  onTaskMove?: (taskId: string, sourceColumnId: string, targetColumnId: string, newIndex: number) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onColumnAdd?: (columnId: string) => void;
  className?: string;
  showStats?: boolean;
  allowReorder?: boolean;
  emptyStateMessage?: string;
}

// Default column colors
const defaultColumnColors: Record<string, string> = {
  'todo': 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700',
  'in-progress': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
  'review': 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700',
  'done': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
  'blocked': 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
  'testing': 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
};

export default function ProjectBoard({
  columns,
  tasks,
  onTaskMove,
  onTaskEdit,
  onTaskDelete,
  onColumnAdd,
  className = '',
  showStats = true,
  allowReorder = true,
  emptyStateMessage = 'No tasks in this column',
}: ProjectBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Get tasks for a specific column
  const getColumnTasks = (columnId: string): Task[] => {
    return tasks.filter((task) => task.status.id === columnId);
  };

  // Get column statistics
  const getColumnStats = (columnId: string) => {
    const columnTasks = getColumnTasks(columnId);
    const total = columnTasks.length;
    const urgent = columnTasks.filter((task) => task.priority?.id === 'urgent').length;
    const overdue = columnTasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today && task.status.id !== 'completed' && task.status.id !== 'done';
    }).length;

    return { total, urgent, overdue };
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeTask = tasks.find((task) => task.id === active.id);
    setActiveTask(activeTask || null);
  };

  // Handle drag over (for visual feedback)
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? String(over.id) : null);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverId(null);

    if (!over || !activeTask) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    // Find source column
    const sourceColumn = columns.find(col => 
      getColumnTasks(col.id).some(task => task.id === activeId)
    );
    
    if (!sourceColumn) return;

    // Determine target column
    let targetColumnId = sourceColumn.id;
    let newIndex = 0;

    // Check if dropped on a column
    const targetColumn = columns.find(col => col.id === overId);
    if (targetColumn) {
      targetColumnId = targetColumn.id;
      newIndex = getColumnTasks(targetColumnId).length;
    } else {
      // Dropped on a task - find which column and position
      const targetTask = tasks.find(task => task.id === overId);
      if (targetTask) {
        targetColumnId = targetTask.status.id;
        const columnTasks = getColumnTasks(targetColumnId);
        newIndex = columnTasks.findIndex(task => task.id === overId);
      }
    }

    // Check if column allows drops
    const targetCol = columns.find(col => col.id === targetColumnId);
    if (targetCol?.allowDrop === false) return;

    // Check max tasks limit
    if (targetCol?.maxTasks && getColumnTasks(targetColumnId).length >= targetCol.maxTasks && targetColumnId !== sourceColumn.id) {
      return;
    }

    // Call the move handler
    if (onTaskMove && (targetColumnId !== sourceColumn.id || allowReorder)) {
      onTaskMove(activeId, sourceColumn.id, targetColumnId, newIndex);
    }
  };

  // Get column color class
  const getColumnColor = (column: BoardColumn): string => {
    if (column.color) return column.color;
    return defaultColumnColors[column.id] || defaultColumnColors['todo'];
  };

  // Check if column is over capacity
  const isColumnOverCapacity = (column: BoardColumn): boolean => {
    if (!column.maxTasks) return false;
    return getColumnTasks(column.id).length >= column.maxTasks;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Board Statistics */}
      {showStats && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {columns.map((column) => {
            const stats = getColumnStats(column.id);
            return (
              <div
                key={`stats-${column.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {column.title}
                  </h3>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </span>
                </div>
                <div className="flex space-x-2 text-xs">
                  {stats.urgent > 0 && (
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {stats.urgent} urgent
                    </span>
                  )}
                  {stats.overdue > 0 && (
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      {stats.overdue} overdue
                    </span>
                  )}
                  {column.maxTasks && (
                    <span className={`font-medium ${
                      isColumnOverCapacity(column) 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      max {column.maxTasks}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Kanban Board */}
        <div className="grid gap-6" style={{ 
          gridTemplateColumns: `repeat(${columns.length}, minmax(280px, 1fr))` 
        }}>
          {columns.map((column) => {
            const columnTasks = getColumnTasks(column.id);
            const isOverCapacity = isColumnOverCapacity(column);
            const isDropTarget = overId === column.id;
            
            return (
              <div
                key={column.id}
                className={`
                  ${getColumnColor(column)} 
                  rounded-xl p-4 border-2 transition-all duration-200
                  ${isDropTarget ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-400/20' : ''}
                  ${isOverCapacity ? 'border-red-300 dark:border-red-600' : ''}
                  min-h-[600px]
                `}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                        {column.title}
                      </h2>
                      {column.maxTasks && (
                        <span className={`
                          text-xs px-2 py-1 rounded-full font-medium
                          ${isOverCapacity 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }
                        `}>
                          {columnTasks.length}/{column.maxTasks}
                        </span>
                      )}
                    </div>
                    {column.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {column.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm">
                      {columnTasks.length}
                    </span>
                    {onColumnAdd && (
                      <button
                        onClick={() => onColumnAdd(column.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded transition-colors"
                        title={`Add task to ${column.title}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tasks Container */}
                <div className="space-y-3 min-h-[500px]">
                  <SortableContext
                    items={columnTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={onTaskEdit}
                        onDelete={onTaskDelete}
                        className={activeTask?.id === task.id ? 'opacity-50' : ''}
                      />
                    ))}
                  </SortableContext>

                  {/* Drop Zone Indicator */}
                  {isDropTarget && columnTasks.length === 0 && (
                    <div className="border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg p-8 text-center">
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        Drop task here
                      </p>
                    </div>
                  )}

                  {/* Empty State */}
                  {columnTasks.length === 0 && !isDropTarget && (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-500">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm text-center">{emptyStateMessage}</p>
                    </div>
                  )}

                  {/* Column Capacity Warning */}
                  {isOverCapacity && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
                      <p className="text-red-800 dark:text-red-300 text-sm font-medium">
                        Column at maximum capacity ({column.maxTasks} tasks)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              isDragging={true}
              className="rotate-3 scale-105 shadow-2xl"
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}