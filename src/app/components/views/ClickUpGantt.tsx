'use client';

import React, { useState, useEffect } from 'react';
import { 
  format, 
  addDays, 
  differenceInDays,
  startOfDay,
  parseISO,
  isAfter,
  isBefore,
  addWeeks,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight, User, Calendar, Clock } from 'lucide-react';
import WorkingTaskModal from '../ui/WorkingTaskModal';

interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  dueDate?: string;
  startDate?: string;
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
}

const ClickUpGantt: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewRange, setViewRange] = useState<'week' | 'month' | 'quarter'>('month');

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Navigation functions
  const goToPrevPeriod = () => {
    if (viewRange === 'week') {
      setCurrentWeek(addWeeks(currentWeek, -1));
    } else if (viewRange === 'month') {
      setCurrentWeek(addWeeks(currentWeek, -4));
    } else {
      setCurrentWeek(addWeeks(currentWeek, -12));
    }
  };

  const goToNextPeriod = () => {
    if (viewRange === 'week') {
      setCurrentWeek(addWeeks(currentWeek, 1));
    } else if (viewRange === 'month') {
      setCurrentWeek(addWeeks(currentWeek, 4));
    } else {
      setCurrentWeek(addWeeks(currentWeek, 12));
    }
  };

  // Get date range for Gantt chart
  const getDateRange = () => {
    const start = startOfWeek(currentWeek);
    let days = 7;
    
    if (viewRange === 'month') {
      days = 30;
    } else if (viewRange === 'quarter') {
      days = 90;
    }

    const dates = [];
    for (let i = 0; i < days; i++) {
      dates.push(addDays(start, i));
    }
    return dates;
  };

  const dateRange = getDateRange();

  // Calculate task bar position and width
  const getTaskBarStyle = (task: Task) => {
    if (!task.startDate || !task.dueDate) return null;

    try {
      const taskStart = parseISO(task.startDate);
      const taskEnd = parseISO(task.dueDate);
      const rangeStart = dateRange[0];
      const rangeEnd = dateRange[dateRange.length - 1];

      // Check if task overlaps with current view
      if (isAfter(taskStart, rangeEnd) || isBefore(taskEnd, rangeStart)) {
        return null; // Task outside current view
      }

      const dayWidth = 100 / dateRange.length;
      
      // Calculate start position
      const daysFromStart = Math.max(0, differenceInDays(taskStart, rangeStart));
      const left = (daysFromStart / dateRange.length) * 100;

      // Calculate width
      const taskDuration = differenceInDays(taskEnd, taskStart) + 1;
      const visibleDuration = Math.min(
        taskDuration,
        dateRange.length - daysFromStart
      );
      const width = (visibleDuration / dateRange.length) * 100;

      return {
        left: `${Math.max(0, left)}%`,
        width: `${Math.min(width, 100 - left)}%`,
      };
    } catch (error) {
      return null;
    }
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-500';
      case 'IN_PROGRESS': return 'bg-yellow-500';
      case 'OPEN': return 'bg-blue-500';
      case 'CANCELED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Priority colors
  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'border-l-red-500';
      case 'HIGH': return 'border-l-orange-500';
      case 'NORMAL': return 'border-l-blue-500';
      case 'LOW': return 'border-l-gray-500';
      default: return 'border-l-gray-500';
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskUpdate = () => {
    fetchTasks();
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  // Filter tasks that have both start and end dates
  const validTasks = tasks.filter(task => task.startDate && task.dueDate);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Gantt Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gantt Chart
          </h1>
          
          {/* View Range Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {['week', 'month', 'quarter'].map((range) => (
              <button
                key={range}
                onClick={() => setViewRange(range as any)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize
                  ${viewRange === range 
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevPeriod}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[200px] text-center">
            {format(dateRange[0], 'MMM d')} - {format(dateRange[dateRange.length - 1], 'MMM d, yyyy')}
          </span>
          <button
            onClick={goToNextPeriod}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          {/* Date Headers */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              {/* Task column header */}
              <div className="w-80 p-4 border-r border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Task</span>
              </div>
              
              {/* Date columns */}
              <div className="flex-1 flex">
                {dateRange.map((date, index) => (
                  <div
                    key={index}
                    className="flex-1 p-2 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                  >
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {viewRange === 'week' ? format(date, 'EEE') : format(date, 'MMM')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {viewRange === 'week' ? format(date, 'd') : format(date, 'd')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {validTasks.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No tasks with dates
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Add start and due dates to your tasks to see them in the Gantt chart.
                </p>
              </div>
            ) : (
              validTasks.map((task) => {
                const barStyle = getTaskBarStyle(task);
                
                return (
                  <div key={task.id} className="flex hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    {/* Task Info Column */}
                    <div className="w-80 p-4 border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className={`w-1 h-8 rounded-full ${getPriorityBorder(task.priority)} border-l-4`}></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {task.name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {task.assignee && (
                              <div className="flex items-center space-x-1">
                                {task.assignee.image ? (
                                  <img 
                                    src={task.assignee.image} 
                                    alt={task.assignee.name}
                                    className="w-4 h-4 rounded-full"
                                  />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                    <User className="h-2.5 w-2.5 text-purple-600 dark:text-purple-400" />
                                  </div>
                                )}
                              </div>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {task.list.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gantt Bar Area */}
                    <div className="flex-1 relative p-4">
                      {barStyle && (
                        <div
                          className={`
                            absolute top-4 h-6 rounded-md cursor-pointer hover:opacity-80 transition-opacity
                            ${getStatusColor(task.status)}
                          `}
                          style={barStyle}
                          onClick={() => handleTaskClick(task)}
                          title={`${task.name} (${format(parseISO(task.startDate!), 'MMM d')} - ${format(parseISO(task.dueDate!), 'MMM d')})`}
                        >
                          <div className="h-full flex items-center px-2">
                            <span className="text-xs font-medium text-white truncate">
                              {task.name}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex">
                        {dateRange.map((_, index) => (
                          <div
                            key={index}
                            className="flex-1 border-r border-gray-100 dark:border-gray-800 last:border-r-0"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && selectedTask && (
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
};

export default ClickUpGantt;