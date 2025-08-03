'use client';

import { useState } from 'react';
import { Repeat, Calendar, Clock, X, Save } from 'lucide-react';

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
  dayOfMonth?: number;
  monthOfYear?: number;
  endDate?: string;
  occurrences?: number;
}

interface RecurringTaskManagerProps {
  taskId: string;
  recurrenceRule?: RecurrenceRule;
  onUpdate: (rule: RecurrenceRule | null) => void;
  onClose: () => void;
}

export default function RecurringTaskManager({
  taskId,
  recurrenceRule,
  onUpdate,
  onClose
}: RecurringTaskManagerProps) {
  const [rule, setRule] = useState<RecurrenceRule>(recurrenceRule || {
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [1], // Monday
  });

  const [endType, setEndType] = useState<'never' | 'date' | 'occurrences'>(
    recurrenceRule?.endDate ? 'date' : 
    recurrenceRule?.occurrences ? 'occurrences' : 'never'
  );

  const weekDays = [
    { value: 0, label: 'Sunday', short: 'S' },
    { value: 1, label: 'Monday', short: 'M' },
    { value: 2, label: 'Tuesday', short: 'T' },
    { value: 3, label: 'Wednesday', short: 'W' },
    { value: 4, label: 'Thursday', short: 'T' },
    { value: 5, label: 'Friday', short: 'F' },
    { value: 6, label: 'Saturday', short: 'S' },
  ];

  const handleDayToggle = (day: number) => {
    const currentDays = rule.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    
    setRule(prev => ({ ...prev, daysOfWeek: newDays }));
  };

  const handleSave = () => {
    let finalRule = { ...rule };

    // Clean up rule based on end type
    if (endType === 'never') {
      delete finalRule.endDate;
      delete finalRule.occurrences;
    } else if (endType === 'date') {
      delete finalRule.occurrences;
    } else if (endType === 'occurrences') {
      delete finalRule.endDate;
    }

    // Clean up frequency-specific fields
    if (finalRule.frequency !== 'weekly') {
      delete finalRule.daysOfWeek;
    }
    if (finalRule.frequency !== 'monthly') {
      delete finalRule.dayOfMonth;
    }
    if (finalRule.frequency !== 'yearly') {
      delete finalRule.monthOfYear;
    }

    onUpdate(finalRule);
  };

  const getRecurrenceDescription = () => {
    const { frequency, interval = 1, daysOfWeek } = rule;
    
    let desc = `Repeat every ${interval > 1 ? interval + ' ' : ''}`;
    
    switch (frequency) {
      case 'daily':
        desc += interval === 1 ? 'day' : 'days';
        break;
      case 'weekly':
        desc += interval === 1 ? 'week' : 'weeks';
        if (daysOfWeek && daysOfWeek.length > 0) {
          const dayNames = daysOfWeek.map(d => weekDays[d].label).join(', ');
          desc += ` on ${dayNames}`;
        }
        break;
      case 'monthly':
        desc += interval === 1 ? 'month' : 'months';
        if (rule.dayOfMonth) {
          desc += ` on day ${rule.dayOfMonth}`;
        }
        break;
      case 'yearly':
        desc += interval === 1 ? 'year' : 'years';
        if (rule.monthOfYear && rule.dayOfMonth) {
          desc += ` on ${rule.monthOfYear}/${rule.dayOfMonth}`;
        }
        break;
    }

    if (endType === 'date' && rule.endDate) {
      desc += ` until ${new Date(rule.endDate).toLocaleDateString()}`;
    } else if (endType === 'occurrences' && rule.occurrences) {
      desc += ` for ${rule.occurrences} occurrence${rule.occurrences === 1 ? '' : 's'}`;
    }

    return desc;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Repeat className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recurring Task
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Frequency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Repeat
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' }
              ].map((freq) => (
                <button
                  key={freq.value}
                  onClick={() => setRule(prev => ({ ...prev, frequency: freq.value as any }))}
                  className={`p-3 text-sm rounded-md border ${
                    rule.frequency === freq.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interval */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Every
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={rule.interval}
              onChange={(e) => setRule(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {rule.frequency === 'daily' ? 'day(s)' :
               rule.frequency === 'weekly' ? 'week(s)' :
               rule.frequency === 'monthly' ? 'month(s)' : 'year(s)'}
            </span>
          </div>

          {/* Weekly Options */}
          {rule.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Repeat on
              </label>
              <div className="flex space-x-1">
                {weekDays.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => handleDayToggle(day.value)}
                    className={`w-10 h-10 text-sm rounded-full border ${
                      (rule.daysOfWeek || []).includes(day.value)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Options */}
          {rule.frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Day of month
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={rule.dayOfMonth || ''}
                onChange={(e) => setRule(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) || undefined }))}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="15"
              />
            </div>
          )}

          {/* Yearly Options */}
          {rule.frequency === 'yearly' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={rule.monthOfYear || ''}
                  onChange={(e) => setRule(prev => ({ ...prev, monthOfYear: parseInt(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={rule.dayOfMonth || ''}
                  onChange={(e) => setRule(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="25"
                />
              </div>
            </div>
          )}

          {/* End Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Ends
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={endType === 'never'}
                  onChange={() => setEndType('never')}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Never</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={endType === 'date'}
                  onChange={() => setEndType('date')}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">On</span>
                <input
                  type="date"
                  disabled={endType !== 'date'}
                  value={rule.endDate || ''}
                  onChange={(e) => setRule(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={endType === 'occurrences'}
                  onChange={() => setEndType('occurrences')}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">After</span>
                <input
                  type="number"
                  min="1"
                  disabled={endType !== 'occurrences'}
                  value={rule.occurrences || ''}
                  onChange={(e) => setRule(prev => ({ ...prev, occurrences: parseInt(e.target.value) || undefined }))}
                  className="w-20 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">occurrences</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Preview
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getRecurrenceDescription()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onUpdate(null)}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
          >
            Remove Recurrence
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
          >
            <Save className="h-4 w-4" />
            <span>Save Recurrence</span>
          </button>
        </div>
      </div>
    </div>
  );
}