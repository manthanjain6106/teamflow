'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock, MoreHorizontal, Edit, Trash2, Calendar } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface TimeEntry {
  id: string;
  description?: string;
  duration: number; // in seconds
  startTime: Date;
  endTime?: Date;
  taskId?: string;
  taskName?: string;
  isRunning?: boolean;
}

interface TimeTrackerProps {
  taskId?: string;
  taskName?: string;
  compact?: boolean;
}

export default function TimeTracker({ taskId, taskName, compact = false }: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [description, setDescription] = useState('');
  const [showEntries, setShowEntries] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing time entries
  useEffect(() => {
    if (taskId) {
      fetchTimeEntries();
    }
  }, [taskId]);

  // Update current entry every second when tracking
  useEffect(() => {
    if (isTracking && currentEntry) {
      intervalRef.current = setInterval(() => {
        setCurrentEntry(prev => {
          if (!prev) return null;
          return {
            ...prev,
            duration: Math.floor((Date.now() - prev.startTime.getTime()) / 1000)
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, currentEntry]);

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch(`/api/time-entries?taskId=${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTimeEntries(data);
      }
    } catch (error) {
      console.error('Failed to fetch time entries:', error);
    }
  };

  const startTracking = () => {
    const entry: TimeEntry = {
      id: `temp-${Date.now()}`,
      description: description.trim() || undefined,
      duration: 0,
      startTime: new Date(),
      taskId,
      taskName,
      isRunning: true
    };

    setCurrentEntry(entry);
    setIsTracking(true);
  };

  const pauseTracking = () => {
    if (currentEntry) {
      setIsTracking(false);
      // Save the entry
      saveTimeEntry(currentEntry);
    }
  };

  const stopTracking = () => {
    if (currentEntry) {
      setIsTracking(false);
      saveTimeEntry(currentEntry);
      setCurrentEntry(null);
      setDescription('');
    }
  };

  const saveTimeEntry = async (entry: TimeEntry) => {
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: entry.description,
          duration: entry.duration,
          startTime: entry.startTime.toISOString(),
          endTime: new Date().toISOString(),
          taskId: entry.taskId
        }),
      });

      if (response.ok) {
        fetchTimeEntries();
      }
    } catch (error) {
      console.error('Failed to save time entry:', error);
    }
  };

  const deleteTimeEntry = async (entryId: string) => {
    try {
      const response = await fetch(`/api/time-entries?id=${entryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTimeEntries();
      }
    } catch (error) {
      console.error('Failed to delete time entry:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTotalTime = () => {
    const total = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const currentTime = currentEntry ? currentEntry.duration : 0;
    return total + currentTime;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>{formatTime(getTotalTime())}</span>
        </div>
        {!isTracking ? (
          <button
            onClick={startTracking}
            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
            title="Start tracking"
          >
            <Play className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center space-x-1">
            <button
              onClick={pauseTracking}
              className="p-1 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded"
              title="Pause"
            >
              <Pause className="h-4 w-4" />
            </button>
            <button
              onClick={stopTracking}
              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
              title="Stop"
            >
              <Square className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Time Tracker</span>
        </h3>
        <div className="text-2xl font-mono font-bold text-purple-600">
          {formatTime(currentEntry?.duration || 0)}
        </div>
      </div>

      {/* Current Tracking */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
            disabled={isTracking}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!isTracking ? (
              <button
                onClick={startTracking}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>Start</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={pauseTracking}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </button>
                <button
                  onClick={stopTracking}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Square className="h-4 w-4" />
                  <span>Stop</span>
                </button>
              </div>
            )}
          </div>

          {taskName && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Tracking: {taskName}
            </div>
          )}
        </div>
      </div>

      {/* Total Time */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Time Today
          </span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatTime(getTotalTime())}
          </span>
        </div>
      </div>

      {/* Time Entries */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recent Entries
          </h4>
          <button
            onClick={() => setShowEntries(!showEntries)}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            {showEntries ? 'Hide' : 'Show All'}
          </button>
        </div>

        {showEntries && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {timeEntries.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {entry.description || 'No description'}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(entry.startTime).toLocaleDateString()}</span>
                    <span>{new Date(entry.startTime).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                    {formatTime(entry.duration)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingEntry(entry.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => deleteTimeEntry(entry.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {timeEntries.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No time entries yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}