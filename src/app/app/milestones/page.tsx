'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { createMilestone, fetchMilestones, updateMilestone, deleteMilestone, fetchSprintTasks } from '@/lib/api';
import { Flag, Plus, Calendar } from 'lucide-react';

export default function MilestonesPage() {
  const { selectedWorkspace } = useStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', targetDate: '' });
  const [openMilestone, setOpenMilestone] = useState<any | null>(null);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [linkedTasks, setLinkedTasks] = useState<any[]>([]);

  const load = async () => {
    if (!selectedWorkspace?.id) return;
    setLoading(true);
    try {
      const data = await fetchMilestones(selectedWorkspace.id);
      setItems(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedWorkspace?.id]);

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) setAvailableTasks(await res.json());
    } catch {}
  };

  const loadLinked = async (milestoneId: string) => {
    try {
      const url = new URL('/api/milestones/tasks', window.location.origin);
      url.searchParams.set('milestoneId', milestoneId);
      const res = await fetch(url.toString());
      if (res.ok) setLinkedTasks(await res.json());
    } catch {}
  };

  const create = async () => {
    if (!selectedWorkspace?.id || !form.title || !form.targetDate) return;
    await createMilestone({ title: form.title, description: form.description || undefined, targetDate: form.targetDate, workspaceId: selectedWorkspace.id });
    setShowCreate(false);
    setForm({ title: '', description: '', targetDate: '' });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this milestone?')) return;
    await deleteMilestone(id);
    load();
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Flag className="h-6 w-6"/>Milestones</h1>
          <button onClick={() => setShowCreate(true)} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center gap-2 text-sm"><Plus className="h-4 w-4"/>New</button>
        </div>

        {showCreate && (
          <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className="px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <input className="px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input type="date" className="px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={create} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">Create</button>
              <button onClick={() => setShowCreate(false)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm">Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-gray-600 dark:text-gray-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-400">No milestones yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((m: any) => (
              <div key={m.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{m.title}</div>
                    {m.description && <div className="text-sm text-gray-600 dark:text-gray-400">{m.description}</div>}
                    <div className="text-xs mt-1">Status: {m.status}</div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4"/>
                    <span>{new Date(m.targetDate).toLocaleDateString()}</span>
                    {m.status !== 'ACTIVE' && <button onClick={async () => { await updateMilestone({ id: m.id, status: 'ACTIVE' } as any); load(); }} className="px-2 py-1 bg-blue-600 text-white rounded">Start</button>}
                    {m.status === 'ACTIVE' && <button onClick={async () => { await updateMilestone({ id: m.id, status: 'COMPLETED' } as any); load(); }} className="px-2 py-1 bg-green-600 text-white rounded">Complete</button>}
                    <button onClick={() => remove(m.id)} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded">Delete</button>
                  </div>
                </div>

                {/* Attach tasks */}
                <div className="mt-3">
                  <div className="text-sm font-medium mb-1">Attach tasks</div>
                  <button onClick={async () => { setOpenMilestone(m); await loadTasks(); await loadLinked(m.id); }} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">Add tasks</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {openMilestone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setOpenMilestone(null)}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-4 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-medium mb-2">Add tasks to {openMilestone.title}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium mb-1">All tasks</div>
                <div className="max-h-72 overflow-auto space-y-1">
                  {availableTasks.length === 0 ? (
                    <div className="text-xs text-gray-500">No tasks available.</div>
                  ) : (
                    availableTasks.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm">
                        <div className="truncate">{t.name}</div>
                        <button onClick={async () => { await fetch('/api/milestones/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ milestoneId: openMilestone.id, taskId: t.id }) }); await loadLinked(openMilestone.id); }} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Add</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium mb-1">Linked tasks</div>
                <div className="max-h-72 overflow-auto space-y-1">
                  {linkedTasks.length === 0 ? (
                    <div className="text-xs text-gray-500">None</div>
                  ) : (
                    linkedTasks.map((lt: any) => (
                      <div key={lt.id} className="flex items-center justify-between px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm">
                        <div className="truncate">{lt.task?.name || lt.taskId}</div>
                        <button onClick={async () => { const u = new URL('/api/milestones/tasks', window.location.origin); u.searchParams.set('milestoneId', openMilestone.id); u.searchParams.set('taskId', lt.taskId); await fetch(u.toString(), { method: 'DELETE' }); await loadLinked(openMilestone.id); }} className="text-xs text-red-600 hover:underline">Remove</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 text-right">
              <button onClick={() => setOpenMilestone(null)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


