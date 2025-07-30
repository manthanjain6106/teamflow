'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { 
  AiOutlineClose, 
  AiOutlineCalendar, 
  AiOutlineUser, 
  AiOutlineFlag, 
  AiOutlineCheck,
  AiOutlineDown 
} from 'react-icons/ai';
import { sendSlackMessage } from '@/lib/slack';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (taskData: TaskData) => void;
  initialData?: Partial<TaskData>;
  title?: string;
}

export interface TaskData {
  taskName: string;
  description: string;
  dueDate: string;
  assignee: TeamMember | null;
  priority: Priority;
  status: TaskStatus;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface Priority {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
}

interface TaskStatus {
  id: string;
  name: string;
  color: string;
  bgColor: string;
}

// Sample data - in real app, these would come from API
const teamMembers: TeamMember[] = [
  { id: '1', name: 'John Doe', email: 'john@teamflow.com', role: 'Team Lead' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@teamflow.com', role: 'Designer' },
  { id: '3', name: 'Mike Chen', email: 'mike@teamflow.com', role: 'Developer' },
  { id: '4', name: 'Emily Davis', email: 'emily@teamflow.com', role: 'Product Manager' },
  { id: '5', name: 'Alex Wilson', email: 'alex@teamflow.com', role: 'Developer' },
];

const priorities: Priority[] = [
  { id: 'low', name: 'Low', color: 'text-green-700', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  { id: 'medium', name: 'Medium', color: 'text-yellow-700', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  { id: 'high', name: 'High', color: 'text-red-700', bgColor: 'bg-red-100', textColor: 'text-red-800' },
];

const taskStatuses: TaskStatus[] = [
  { id: 'todo', name: 'To Do', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  { id: 'in-progress', name: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { id: 'review', name: 'In Review', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  { id: 'done', name: 'Done', color: 'text-green-700', bgColor: 'bg-green-100' },
];

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = {},
  title = 'Create New Task'
}: TaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState<TaskData>({
    taskName: initialData.taskName || '',
    description: initialData.description || '',
    dueDate: initialData.dueDate || '',
    assignee: initialData.assignee || null,
    priority: initialData.priority || priorities[1], // Default to Medium
    status: initialData.status || taskStatuses[0], // Default to To Do
  });

  const resetForm = () => {
    setFormData({
      taskName: '',
      description: '',
      dueDate: '',
      assignee: null,
      priority: priorities[1],
      status: taskStatuses[0],
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.taskName.trim()) {
      newErrors.taskName = 'Task name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (!formData.assignee) {
      newErrors.assignee = 'Please select an assignee';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call parent onSubmit if provided
      if (onSubmit) {
        onSubmit(formData);
      }

      // Send Slack notification
      const slackMessage = [
        '📋 *New Task Created*',
        '',
        `*Task:* ${formData.taskName}`,
        `*Description:* ${formData.description}`,
        `*Assigned to:* ${formData.assignee?.name}`,
        `*Due Date:* ${new Date(formData.dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
        `*Priority:* ${formData.priority.name}`,
        `*Status:* ${formData.status.name}`,
        `*Created:* ${new Date().toLocaleString()}`,
        '',
        '🎯 *Ready to start!* Task has been added to the project board.'
      ].join('\n');

      await sendSlackMessage(slackMessage, {
        username: 'TeamFlow Tasks',
        icon_emoji: ':clipboard:',
      });

      // Close modal and reset form
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      setErrors({ submit: 'Failed to create task. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // Get minimum date (today) for date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCancel}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={handleCancel}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <AiOutlineClose className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Task Name */}
                  <div>
                    <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Task Name *
                    </label>
                    <input
                      type="text"
                      id="taskName"
                      value={formData.taskName}
                      onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.taskName 
                          ? 'border-red-300 dark:border-red-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter task name..."
                      disabled={isSubmitting}
                    />
                    {errors.taskName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.taskName}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${
                        errors.description 
                          ? 'border-red-300 dark:border-red-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Describe the task in detail..."
                      disabled={isSubmitting}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                    )}
                  </div>

                  {/* Due Date and Priority Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Due Date */}
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Due Date *
                      </label>
                      <div className="relative">
                        <AiOutlineCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          id="dueDate"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          min={today}
                          className={`w-full pl-12 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            errors.dueDate 
                              ? 'border-red-300 dark:border-red-600' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.dueDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dueDate}</p>
                      )}
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority *
                      </label>
                      <Listbox value={formData.priority} onChange={(priority) => setFormData({ ...formData, priority })}>
                        <div className="relative">
                          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-700 py-3 pl-4 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <div className="flex items-center space-x-3">
                              <AiOutlineFlag className={`w-4 h-4 ${formData.priority.color}`} />
                              <span className="block truncate text-gray-900 dark:text-white">
                                {formData.priority.name}
                              </span>
                            </div>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <AiOutlineDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </Listbox.Button>
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                              {priorities.map((priority) => (
                                <Listbox.Option
                                  key={priority.id}
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-4 pr-10 ${
                                      active ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                                    }`
                                  }
                                  value={priority}
                                >
                                  {({ selected }) => (
                                    <>
                                      <div className="flex items-center space-x-3">
                                        <AiOutlineFlag className={`w-4 h-4 ${priority.color}`} />
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                          {priority.name}
                                        </span>
                                      </div>
                                      {selected && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                                          <AiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      )}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>
                  </div>

                  {/* Assignee and Status Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Assignee */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Assignee *
                      </label>
                      <Listbox value={formData.assignee} onChange={(assignee) => setFormData({ ...formData, assignee })}>
                        <div className="relative">
                          <Listbox.Button className={`relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-700 py-3 pl-4 pr-10 text-left border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.assignee 
                              ? 'border-red-300 dark:border-red-600' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <AiOutlineUser className="w-4 h-4 text-gray-400" />
                              <span className="block truncate text-gray-900 dark:text-white">
                                {formData.assignee ? formData.assignee.name : 'Select assignee...'}
                              </span>
                            </div>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <AiOutlineDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </Listbox.Button>
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                              {teamMembers.map((member) => (
                                <Listbox.Option
                                  key={member.id}
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-4 pr-10 ${
                                      active ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                                    }`
                                  }
                                  value={member}
                                >
                                  {({ selected }) => (
                                    <>
                                      <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                          <span className="text-white text-xs font-medium">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                          </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                            {member.name}
                                          </span>
                                          <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                                            {member.role}
                                          </span>
                                        </div>
                                      </div>
                                      {selected && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                                          <AiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      )}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </Listbox>
                      {errors.assignee && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.assignee}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <Listbox value={formData.status} onChange={(status) => setFormData({ ...formData, status })}>
                        <div className="relative">
                          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-700 py-3 pl-4 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${formData.status.bgColor}`}></div>
                              <span className="block truncate text-gray-900 dark:text-white">
                                {formData.status.name}
                              </span>
                            </div>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <AiOutlineDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </Listbox.Button>
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                              {taskStatuses.map((status) => (
                                <Listbox.Option
                                  key={status.id}
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-4 pr-10 ${
                                      active ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                                    }`
                                  }
                                  value={status}
                                >
                                  {({ selected }) => (
                                    <>
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${status.bgColor}`}></div>
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                          {status.name}
                                        </span>
                                      </div>
                                      {selected && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                                          <AiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      )}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-800 dark:text-red-200 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-initial px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <AiOutlineCheck className="w-4 h-4" />
                          <span>Save Task</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 font-medium rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 