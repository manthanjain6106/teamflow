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
import { useUsers } from '@/hooks/useUsers';
import { useStore } from '@/store/useStore';
import { addChecklistItem, addTaskAssignment, addTaskRelation } from '@/lib/api';

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
  assignees: TeamMember[];
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

// Team members come from workspace members; fallback to empty
const teamMembers: TeamMember[] = [];

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
  const { selectedWorkspace } = useStore();
  const { users } = useUsers(selectedWorkspace?.id);
  const [checklistItems, setChecklistItems] = useState<Array<{ content: string; completed: boolean }>>([]);
  const [relationsDraft, setRelationsDraft] = useState<Array<{ toTaskId: string; type: 'RELATES' | 'BLOCKS' | 'IS_BLOCKED_BY' | 'DUPLICATES' | 'IS_DUPLICATED_BY' }>>([]);
  const [newRelation, setNewRelation] = useState<{ toTaskId: string; type: 'RELATES' | 'BLOCKS' | 'IS_BLOCKED_BY' | 'DUPLICATES' | 'IS_DUPLICATED_BY' }>({ toTaskId: '', type: 'BLOCKS' });

  // Form state
  const [formData, setFormData] = useState<TaskData>({
    taskName: initialData.taskName || '',
    description: initialData.description || '',
    dueDate: initialData.dueDate || '',
    assignees: Array.isArray((initialData as any).assignees) ? (initialData as any).assignees : [],
    priority: initialData.priority || priorities[1], // Default to Medium
    status: initialData.status || taskStatuses[0], // Default to To Do
  });

  const resetForm = () => {
    setFormData({
      taskName: '',
      description: '',
      dueDate: '',
      assignees: [],
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

    if (!formData.assignees || formData.assignees.length === 0) {
      newErrors.assignees = 'Please select at least one assignee';
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

      // Persist via API when possible
      const listId = (initialData as any)?.listId as string | undefined;
      const editingTaskId = (initialData as any)?.id as string | undefined;
      if (editingTaskId) {
        // Update task basic fields
        await fetch(`/api/tasks/${editingTaskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.taskName, description: formData.description, dueDate: formData.dueDate || undefined })
        });
        const taskId = editingTaskId;
        if (formData.assignees?.length) {
          await Promise.all(formData.assignees.map(a => addTaskAssignment({ taskId, userId: a.id })));
        }
        if (checklistItems.length) {
          await Promise.all(checklistItems.map((it, idx) => addChecklistItem({ taskId, content: it.content, order: idx })));
        }
        if (relationsDraft.length) {
          await Promise.all(relationsDraft.map(r => addTaskRelation({ fromTaskId: taskId, toTaskId: r.toTaskId, type: r.type })));
        }
      } else if (listId) {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.taskName,
            description: formData.description,
            dueDate: formData.dueDate || undefined,
            listId,
          })
        });
        if (res.ok) {
          const created = await res.json();
          const taskId: string = created.id;

          // Assign all selected members
          if (formData.assignees?.length) {
            await Promise.all(
              formData.assignees.map(a => addTaskAssignment({ taskId, userId: a.id }))
            );
          }

          // Checklist items
          if (checklistItems.length) {
            await Promise.all(
              checklistItems.map((it, idx) => addChecklistItem({ taskId, content: it.content, order: idx }))
            );
          }

          // Task relations (dependencies)
          if (relationsDraft.length) {
            await Promise.all(
              relationsDraft.map(r => addTaskRelation({ fromTaskId: taskId, toTaskId: r.toTaskId, type: r.type }))
            );
          }
        }
      }

      // Send Slack notification
      const slackMessage = [
        '📋 *New Task Created*',
        '',
        `*Task:* ${formData.taskName}`,
        `*Description:* ${formData.description}`,
        `*Assigned to:* ${formData.assignees.map(a => a.name).join(', ') || '—'}`,
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

  // Simple inline checklist field (local-only for now; wire to API where taskId available)
  function ChecklistField({ items, setItems }: { items: Array<{ content: string; completed: boolean }>; setItems: React.Dispatch<React.SetStateAction<Array<{ content: string; completed: boolean }>>> }) {
    const [newItem, setNewItem] = useState('');

    const addItem = () => {
      if (!newItem.trim()) return;
      setItems(prev => [...prev, { content: newItem.trim(), completed: false }]);
      setNewItem('');
    };

    const toggle = (idx: number) => {
      setItems(prev => prev.map((it, i) => i === idx ? { ...it, completed: !it.completed } : it));
    };

    const remove = (idx: number) => {
      setItems(prev => prev.filter((_, i) => i !== idx));
    };

    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            placeholder="Add checklist item"
            className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="button" onClick={addItem} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm">Add</button>
        </div>
        <ul className="space-y-1">
          {items.map((it, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <input type="checkbox" checked={it.completed} onChange={() => toggle(idx)} />
              <span className={`flex-1 ${it.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{it.content}</span>
              <button type="button" onClick={() => remove(idx)} className="text-xs text-red-600 hover:underline">Remove</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

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

                  {/* Assignees and Status Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Assignees (multiple) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Assignees *
                      </label>
                      <Listbox multiple value={formData.assignees} onChange={(assignees: TeamMember[]) => setFormData({ ...formData, assignees })}>
                        <div className="relative">
                          <Listbox.Button className={`relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-700 py-3 pl-4 pr-10 text-left border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.assignees 
                              ? 'border-red-300 dark:border-red-600' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <AiOutlineUser className="w-4 h-4 text-gray-400" />
                              <span className="block truncate text-gray-900 dark:text-white">
                                {formData.assignees.length > 0 ? `${formData.assignees.length} selected` : 'Select assignees...'}
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
                               {(users as any[] || []).map((member: any) => (
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
                                             {member.email}
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
                      {errors.assignees && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.assignees}</p>
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

                  {/* Checklist */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Checklist
                    </label>
                    <ChecklistField items={checklistItems} setItems={setChecklistItems} />
                  </div>

                  {/* Dependencies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dependencies
                    </label>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col md:flex-row gap-2">
                        <select
                          value={newRelation.type}
                          onChange={(e) => setNewRelation(r => ({ ...r, type: e.target.value as any }))}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                        >
                          {(['BLOCKS','IS_BLOCKED_BY','RELATES','DUPLICATES','IS_DUPLICATED_BY'] as const).map(t => (
                            <option key={t} value={t}>{t.replaceAll('_',' ')}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Target task ID"
                          value={newRelation.toTaskId}
                          onChange={(e) => setNewRelation(r => ({ ...r, toTaskId: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newRelation.toTaskId.trim()) return;
                            setRelationsDraft(prev => [...prev, { ...newRelation }]);
                            setNewRelation({ toTaskId: '', type: newRelation.type });
                          }}
                          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                        >
                          Add
                        </button>
                      </div>
                      {relationsDraft.length > 0 && (
                        <ul className="text-sm space-y-1">
                          {relationsDraft.map((r, idx) => (
                            <li key={`${r.toTaskId}-${idx}`} className="flex items-center justify-between px-2 py-1 border border-gray-200 dark:border-gray-700 rounded">
                              <span className="text-gray-700 dark:text-gray-300">{r.type.replaceAll('_',' ')} → {r.toTaskId}</span>
                              <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => setRelationsDraft(prev => prev.filter((_, i) => i !== idx))}>Remove</button>
                            </li>
                          ))}
                        </ul>
                      )}
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