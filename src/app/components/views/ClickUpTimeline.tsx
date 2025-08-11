'use client';

import React, { useState, useEffect } from 'react';
import { 
  format, 
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth
} from 'date-fns';
import { ChevronLeft, ChevronRight, User, Clock, Calendar as CalendarIcon, Filter } from 'lucide-react';
import TaskModal from '../ui/TaskModal';

interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  dueDate?: string;
  startDate?: string;
  createdAt: string;
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

const ClickUpTimeline: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timelineView, setTimelineView] = useState<'day' | 'week' | 'month'>('week');
  const [statusFilter, setStatusFilter] = useState<string[]>(['TODO', 'IN_PROGRESS']);

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
    if (timelineView === 'day') {
      setCurrentDate(subDays(currentDate, 1));
    } else if (timelineView === 'week') {
      setCurrentDate(subDays(currentDate, 7));
    } else {
      setCurrentDate(subDays(currentDate, 30));
    }
  };

  const goToNextPeriod = () => {
    if (timelineView === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    } else if (timelineView === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 30));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Get timeline range
  const getTimelineRange = () => {
    switch (timelineView) {
      case 'day':
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate),
          label: format(currentDate, 'EEEE, MMMM d, yyyy')
        };
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return {
          start: weekStart,
          end: weekEnd,
          label: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
        };
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return {
          start: monthStart,
          end: monthEnd,
          label: format(currentDate, 'MMMM yyyy')
        };
      default:
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate),
          label: format(currentDate, 'MMM d, yyyy')
        };
    }
  };

  const timelineRange = getTimelineRange();

  // Filter tasks for timeline
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Status filter
      if (!statusFilter.includes(task.status)) return false;

      // Date filter - show tasks that are due or created within the range
      const taskCreated = parseISO(task.createdAt);
      const taskDue = task.dueDate ? parseISO(task.dueDate) : null;
      const taskStart = task.startDate ? parseISO(task.startDate) : null;

      return (
        isWithinInterval(taskCreated, { start: timelineRange.start, end: timelineRange.end }) ||
        (taskDue && isWithinInterval(taskDue, { start: timelineRange.start, end: timelineRange.end })) ||
        (taskStart && isWithinInterval(taskStart, { start: timelineRange.start, end: timelineRange.end }))
      );
    });
  };

  const filteredTasks = getFilteredTasks();

  // Group tasks by date
  const groupTasksByDate = () => {
    const grouped: { [key: string]: Task[] } = {};
    
    filteredTasks.forEach(task => {
      let groupDate: string;
      
      // Use due date if available, otherwise use creation date
      if (task.dueDate) {
        const dueDate = parseISO(task.dueDate);
        if (isWithinInterval(dueDate, { start: timelineRange.start, end: timelineRange.end })) {
          groupDate = format(dueDate, 'yyyy-MM-dd');
        } else {
          groupDate = format(parseISO(task.createdAt), 'yyyy-MM-dd');
        }
      } else {
        groupDate = format(parseISO(task.createdAt), 'yyyy-MM-dd');
      }

      if (!grouped[groupDate]) {
        grouped[groupDate] = [];
      }
      grouped[groupDate].push(task);
    });

    return grouped;
  };

  const groupedTasks = groupTasksByDate();

  // Generate timeline dates
  const getTimelineDates = () => {
    const dates = [];
    let currentDateInRange = timelineRange.start;
    
    while (currentDateInRange <= timelineRange.end) {
      dates.push(currentDateInRange);
      currentDateInRange = addDays(currentDateInRange, 1);
    }
    
    return dates;
  };

  const timelineDates = getTimelineDates();

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-500 text-white';
      case 'IN_PROGRESS': return 'bg-yellow-500 text-white';
      case 'OPEN': return 'bg-blue-500 text-white';
      case 'CANCELED': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Priority indicators
  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '🔴';
      case 'HIGH': return '🟠';
      case 'NORMAL': return '🔵';
      case 'LOW': return '⚪';
      default: return '⚪';
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

  const handleStatusFilterChange = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Timeline Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline</h1>
          
          {/* View Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {['day', 'week', 'month'].map((view) => (
              <button
                key={view}
                onClick={() => setTimelineView(view as any)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize
                  ${timelineView === view 
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                {view}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            {['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELED'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                className={`
                  px-2 py-1 text-xs rounded-md transition-colors
                  ${statusFilter.includes(status) 
                    ? getStatusColor(status)
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }
                `}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
          >
            Today
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevPeriod}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[200px] text-center">
              {timelineRange.label}
            </span>
            <button
              onClick={goToNextPeriod}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks in timeline
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Tasks will appear here based on their creation and due dates within the selected time range.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {timelineDates.map(date => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const dateTasks = groupedTasks[dateKey] || [];
              
              if (dateTasks.length === 0) return null;
              
              return (
                <div key={dateKey} className="relative">
                  {/* Date Header */}
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {format(date, 'MMM d')}
                    </div>
                    {format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && (
                      <span className="ml-2 text-xs text-purple-600 font-medium">Today</span>
                    )}
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 ml-4"></div>
                  </div>

                  {/* Tasks for this date */}
                  <div className="ml-8 space-y-3">
                    {dateTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className="group flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        {/* Priority Indicator */}
                        <span className="text-lg mt-0.5">{getPriorityIndicator(task.priority)}</span>
                        
                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                              {task.name}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{task.list.name}</span>
                            </span>
                            
                            {task.assignee && (
                              <span className="flex items-center space-x-1">
                                {task.assignee.image ? (
                                  <img 
                                    src={task.assignee.image} 
                                    alt={task.assignee.name}
                                    className="w-4 h-4 rounded-full"
                                  />
                                ) : (
                                  <User className="h-3 w-3" />
                                )}
                                <span>{task.assignee.name}</span>
                              </span>
                            )}
                            
                            {task.dueDate && (
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>Due {format(parseISO(task.dueDate), 'MMM d')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && selectedTask && (
        <TaskModal
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

export default ClickUpTimeline;