'use client';

import { useState } from 'react';
import { createGoal, updateGoal, deleteGoal } from '@/lib/api';

export function CreateGoalModal({ isOpen, onClose, workspaceId, onCreated }: { isOpen: boolean; onClose: () => void; workspaceId: string; onCreated: () => void; }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [keyResults, setKeyResults] = useState<Array<{ name: string; target: number; current: number }>>([{ name: '', target: 100, current: 0 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const addKR = () => setKeyResults((k) => [...k, { name: '', target: 100, current: 0 }]);
  const removeKR = (i: number) => setKeyResults((k) => k.filter((_, idx) => idx !== i));

  const computedProgress = keyResults.length
    ? Math.min(
        100,
        Math.round(
          (keyResults
            .filter((kr) => kr.name.trim())
            .reduce((acc, kr) => acc + (Number(kr.current || 0) / Math.max(1, Number(kr.target || 0))), 0) /
            Math.max(1, keyResults.filter((kr) => kr.name.trim()).length)) * 100
        )
      )
    : 0;

  const submit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createGoal({ title: title.trim(), description: description.trim() || undefined, dueDate: dueDate || undefined, workspaceId, keyResults: keyResults.filter((kr) => kr.name.trim()) });
      onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold">Create Goal</h3>
          <button onClick={onClose} className="text-sm text-gray-600 dark:text-gray-300">Close</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Goal title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title" className="mt-1 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
            {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="mt-1 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Due date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Key Results</div>
              <div className="text-xs text-gray-500">Projected progress: {computedProgress}%</div>
            </div>
            <div className="hidden sm:grid sm:grid-cols-12 text-xs text-gray-500 mt-2">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Target</div>
              <div className="col-span-3">Current</div>
              <div className="col-span-1" />
            </div>
            <div className="space-y-2 mt-1">
              {keyResults.map((kr, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={kr.name} onChange={(e) => setKeyResults((arr) => arr.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} placeholder="Name" className="col-span-12 sm:col-span-6 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                  <input type="number" min={0} value={kr.target} onChange={(e) => setKeyResults((arr) => arr.map((x, idx) => idx === i ? { ...x, target: Math.max(0, Number(e.target.value)) } : x))} placeholder="Target" className="col-span-6 sm:col-span-2 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                  <input type="number" min={0} value={kr.current} onChange={(e) => setKeyResults((arr) => arr.map((x, idx) => idx === i ? { ...x, current: Math.max(0, Number(e.target.value)) } : x))} placeholder="Current" className="col-span-5 sm:col-span-3 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                  <button onClick={() => removeKR(i)} className="col-span-1 px-2 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded">×</button>
                </div>
              ))}
            </div>
            <button onClick={addKR} className="mt-2 text-sm text-purple-600">+ Add key result</button>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800">Cancel</button>
          <button onClick={submit} disabled={saving || !title.trim()} className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}

export function EditGoalModal({ isOpen, onClose, goal, onUpdated }: { isOpen: boolean; onClose: () => void; goal: any; onUpdated: () => void; }) {
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [status, setStatus] = useState(goal?.status || 'ON_TRACK');
  const [dueDate, setDueDate] = useState(goal?.dueDate ? goal.dueDate.slice(0, 10) : '');
  const [keyResults, setKeyResults] = useState<Array<{ name: string; target: number; current: number }>>(goal?.keyResults || []);
  const projected = keyResults.length
    ? Math.min(
        100,
        Math.round(
          (keyResults
            .filter((kr) => kr.name?.trim())
            .reduce((acc, kr) => acc + (Number(kr.current || 0) / Math.max(1, Number(kr.target || 0))), 0) /
            Math.max(1, keyResults.filter((kr) => kr.name?.trim()).length)) * 100
        )
      )
    : 0;

  if (!isOpen || !goal) return null;

  const save = async () => {
    await updateGoal({ id: goal.id, title, description, status, dueDate: dueDate || undefined, keyResults });
    onUpdated();
    onClose();
  };

  const remove = async () => {
    if (!confirm('Delete this goal?')) return;
    await deleteGoal(goal.id);
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold">Edit Goal</h3>
          <button onClick={onClose} className="text-sm text-gray-600 dark:text-gray-300">Close</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                <option value="ON_TRACK">On track</option>
                <option value="AT_RISK">At risk</option>
                <option value="OFF_TRACK">Off track</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Due date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Key Results</div>
              <div className="text-xs text-gray-500">Projected progress: {projected}%</div>
            </div>
            <div className="hidden sm:grid sm:grid-cols-12 text-xs text-gray-500 mt-2">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Target</div>
              <div className="col-span-3">Current</div>
              <div className="col-span-1" />
            </div>
            <div className="space-y-2 mt-1">
              {keyResults.map((kr, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={kr.name} onChange={(e) => setKeyResults((arr) => arr.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} placeholder="Name" className="col-span-12 sm:col-span-6 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                  <input type="number" min={0} value={kr.target} onChange={(e) => setKeyResults((arr) => arr.map((x, idx) => idx === i ? { ...x, target: Math.max(0, Number(e.target.value)) } : x))} placeholder="Target" className="col-span-6 sm:col-span-2 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                  <input type="number" min={0} value={kr.current} onChange={(e) => setKeyResults((arr) => arr.map((x, idx) => idx === i ? { ...x, current: Math.max(0, Number(e.target.value)) } : x))} placeholder="Current" className="col-span-5 sm:col-span-3 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                  <button onClick={() => setKeyResults((arr) => arr.filter((_, idx) => idx !== i))} className="col-span-1 px-2 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded">×</button>
                </div>
              ))}
            </div>
            <button onClick={() => setKeyResults((k) => [...k, { name: '', target: 100, current: 0 }])} className="mt-2 text-sm text-purple-600">+ Add key result</button>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-between">
          <button onClick={remove} className="px-4 py-2 rounded bg-red-600 text-white">Delete</button>
          <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800">Cancel</button>
            <button onClick={save} className="px-4 py-2 rounded bg-purple-600 text-white">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}


