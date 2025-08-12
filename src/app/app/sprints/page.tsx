'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { fetchSprints, createSprint, updateSprint, fetchSprintTasks, addTaskToSprint, removeTaskFromSprint, fetchSprintMetrics, fetchSprintGoals, addSprintGoal, updateSprintGoal, deleteSprintGoal, fetchSprintCapacity, upsertSprintCapacity, deleteSprintCapacity } from '@/lib/api';
import { Calendar, Plus, Target } from 'lucide-react';

export default function SprintsPage() {
  const { selectedWorkspace } = useStore();
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', goal: '', startDate: '', endDate: '' });
  const [selectedSprint, setSelectedSprint] = useState<any | null>(null);
  const [sprintTasks, setSprintTasks] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [taskQuery, setTaskQuery] = useState('');
  const [metrics, setMetrics] = useState<any | null>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [capacity, setCapacity] = useState<any[]>([]);

  const load = async () => {
    if (!selectedWorkspace?.id) return;
    setLoading(true);
    try {
      const data = await fetchSprints({ workspaceId: selectedWorkspace.id });
      setSprints(data);
    } finally {
      setLoading(false);
    }
  };

  // Reload sprints and reopen a specific sprint by id
  const reloadAndReopen = async (sprintId: string) => {
    if (!selectedWorkspace?.id) return;
    setLoading(true);
    try {
      const data = await fetchSprints({ workspaceId: selectedWorkspace.id });
      setSprints(data);
      const found = (data || []).find((s: any) => s.id === sprintId);
      if (found) await openSprint(found);
      else setSelectedSprint(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedWorkspace?.id]);

  const openSprint = async (s: any) => {
    setSelectedSprint(s);
    try {
      const items = await fetchSprintTasks(s.id);
      setSprintTasks(items || []);
    } catch {}
    try {
      // Fetch all accessible tasks once to power search (client-side filter)
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const tasks = await res.json();
        setAllTasks(Array.isArray(tasks) ? tasks : []);
      }
    } catch {}
    try {
      const m = await fetchSprintMetrics(s.id);
      setMetrics(m);
    } catch {}
    try {
      const g = await fetchSprintGoals(s.id);
      setGoals(g || []);
    } catch {}
    try {
      const cap = await fetchSprintCapacity(s.id);
      setCapacity(cap || []);
    } catch {}
  };

  const create = async () => {
    if (!selectedWorkspace?.id) return;
    if (!form.name || !form.startDate || !form.endDate) return;
    await createSprint({ name: form.name, goal: form.goal || undefined, startDate: form.startDate, endDate: form.endDate, workspaceId: selectedWorkspace.id });
    setShowCreate(false);
    setForm({ name: '', goal: '', startDate: '', endDate: '' });
    load();
  };

  if (!selectedWorkspace) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 text-gray-600 dark:text-gray-400">Select a workspace to view sprints.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Target className="h-6 w-6"/>Sprints</h1>
          <button onClick={() => setShowCreate(true)} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center gap-2 text-sm"><Plus className="h-4 w-4"/>New Sprint</button>
        </div>

        {showCreate && (
          <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input className="px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" placeholder="Goal (optional)" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} />
              <input type="date" className="px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              <input type="date" className="px-3 py-2 rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={create} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">Create</button>
              <button onClick={() => setShowCreate(false)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm">Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-gray-600 dark:text-gray-400">Loading…</div>
        ) : sprints.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-400">No sprints yet.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              {sprints.map((sprint: any) => (
                <div key={sprint.id} className={`p-4 border rounded-lg ${selectedSprint?.id === sprint.id ? 'border-purple-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800`}> 
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{sprint.name}</div>
                      {sprint.goal && <div className="text-sm text-gray-600 dark:text-gray-400">{sprint.goal}</div>}
                      <div className="text-xs mt-1">Status: <span className="uppercase">{sprint.status}</span></div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4"/>
                      <span>{new Date(sprint.startDate).toLocaleDateString()} – {new Date(sprint.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => openSprint(sprint)} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs">Open</button>
                    {sprint.status !== 'ACTIVE' && <button onClick={async () => { await updateSprint({ id: sprint.id, status: 'ACTIVE' }); await reloadAndReopen(sprint.id); }} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Start</button>}
                    {sprint.status === 'ACTIVE' && <button onClick={async () => { await updateSprint({ id: sprint.id, status: 'COMPLETED' }); await reloadAndReopen(sprint.id); }} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Complete</button>}
                    {sprint.status !== 'CANCELLED' && (
                      <button
                        onClick={async () => {
                          try {
                            await updateSprint({ id: sprint.id, status: 'CANCELLED' });
                            await reloadAndReopen(sprint.id);
                          } catch (e: any) {
                            alert(e?.message || 'Failed to cancel sprint');
                          }
                        }}
                        className="px-2 py-1 bg-yellow-600 text-white rounded text-xs"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        const sure = confirm('Delete this sprint permanently? This cannot be undone.');
                        if (!sure) return;
                        const url = new URL('/api/sprints', window.location.origin);
                        url.searchParams.set('id', sprint.id);
                        const res = await fetch(url.toString(), { method: 'DELETE' });
                        if (!res.ok) {
                          const msg = await res.json().catch(() => ({ error: 'Failed to delete sprint' }));
                          alert(msg.error || 'Failed to delete sprint');
                          return;
                        }
                        load();
                      }}
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Sprint detail */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 min-h-[300px]">
              {selectedSprint ? (
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">{selectedSprint.name} – Tasks</div>

                  {/* Task picker */}
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input
                        value={taskQuery}
                        onChange={(e) => setTaskQuery(e.target.value)}
                        className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        placeholder="Search tasks to add by name"
                      />
                      <button
                        onClick={() => setTaskQuery('')}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm"
                      >Clear</button>
                    </div>
                    {taskQuery.trim() && (
                      <div className="mt-2 max-h-40 overflow-auto border border-gray-200 dark:border-gray-700 rounded">
                        {allTasks
                          .filter(t => t.name?.toLowerCase().includes(taskQuery.toLowerCase()))
                          .filter(t => !sprintTasks.some((st: any) => st.taskId === t.id))
                          .slice(0, 10)
                          .map(t => (
                            <div key={t.id} className="flex items-center justify-between px-2 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                              <span className="truncate">{t.name}</span>
                              <button onClick={async () => { await addTaskToSprint(selectedSprint.id, t.id); await openSprint(selectedSprint); }} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Add</button>
                            </div>
                          ))}
                        {allTasks.filter(t => t.name?.toLowerCase().includes(taskQuery.toLowerCase())).length === 0 && (
                          <div className="px-2 py-1 text-sm text-gray-500">No results</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metrics */}
                  <SprintHeaderMetrics metrics={metrics} />

                  {/* Goals checklist */}
                  <SprintGoals
                    goals={goals}
                    onAdd={async (content) => { if (!selectedSprint) return; await addSprintGoal(selectedSprint.id, content, goals.length); await openSprint(selectedSprint); }}
                    onToggle={async (id, completed) => { await updateSprintGoal({ id, completed }); if (selectedSprint) await openSprint(selectedSprint); }}
                    onDelete={async (id) => { await deleteSprintGoal(id); if (selectedSprint) await openSprint(selectedSprint); }}
                  />

                  {/* Burndown chart */}
                  <SprintBurndown sprint={selectedSprint} items={sprintTasks} />

                  {/* Board view */}
                  <SprintBoard items={sprintTasks} onStatusChange={async (taskId, status) => { await fetch(`/api/tasks/${taskId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); await openSprint(selectedSprint); }} />

                  {/* Capacity planning */}
                  <SprintCapacity
                    items={capacity}
                    onUpsert={async (userId, hours, points) => { if (!selectedSprint) return; await upsertSprintCapacity(selectedSprint.id, userId, hours, points); await openSprint(selectedSprint); }}
                    onDelete={async (userId) => { if (!selectedSprint) return; await deleteSprintCapacity(selectedSprint.id, userId); await openSprint(selectedSprint); }}
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400">Select a sprint to view tasks.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SprintBurndown({ sprint, items }: { sprint: any; items: any[] }) {
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const dates: Date[] = [];
  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 24*3600*1000)) dates.push(new Date(d));
  const total = items.length;
  const remaining = dates.map((d) => total - items.filter((it: any) => it.task?.completedAt && new Date(it.task.completedAt) <= d).length);
  const ideal = dates.map((_, i) => Math.round(total - (total / Math.max(1, dates.length - 1)) * i));

  const width = 500; const height = 140; const padding = 30;
  const x = (i: number) => padding + (i * (width - 2*padding)) / Math.max(1, dates.length - 1);
  const y = (v: number) => padding + ((height - 2*padding) * (v / Math.max(1, total)));
  const toPath = (arr: number[]) => arr.map((v, i) => `${i===0?'M':'L'} ${x(i)} ${y(v)}`).join(' ');

  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Burndown</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-full border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900">
        <path d={toPath(ideal)} stroke="#94a3b8" fill="none" strokeDasharray="4 4"/>
        <path d={toPath(remaining)} stroke="#7c3aed" fill="none" strokeWidth={2}/>
        {/* Axes */}
        <line x1={padding} y1={y(0)} x2={width-padding} y2={y(0)} stroke="#e5e7eb"/>
        <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#e5e7eb"/>
      </svg>
      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Remaining: {remaining[remaining.length-1] ?? total} / {total}</div>
    </div>
  );
}

function SprintHeaderMetrics({ metrics }: { metrics: any | null }) {
  if (!metrics) return null;
  const cards = [
    { label: 'Total tasks', value: metrics.totalTasks },
    { label: 'Completed', value: metrics.completedTasks },
    { label: 'Total points', value: metrics.totalPoints },
    { label: 'Velocity', value: metrics.velocity },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {cards.map(c => (
        <div key={c.label} className="p-3 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900">
          <div className="text-xs text-gray-500">{c.label}</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{c.value}</div>
        </div>
      ))}
    </div>
  )
}

function SprintGoals({ goals, onAdd, onToggle, onDelete }: { goals: Array<{ id: string; content: string; completed: boolean }>; onAdd: (content: string) => Promise<void>; onToggle: (id: string, completed: boolean) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const [newGoal, setNewGoal] = useState('');
  return (
    <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-900">
      <div className="text-sm font-medium mb-2">Sprint goals</div>
      <div className="flex gap-2 mb-2">
        <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="Add a goal" />
        <button onClick={async () => { if (!newGoal.trim()) return; await onAdd(newGoal.trim()); setNewGoal(''); }} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">Add</button>
      </div>
      <div className="space-y-2">
        {goals.length === 0 ? (
          <div className="text-xs text-gray-500">No goals yet.</div>
        ) : (
          goals.map(g => (
            <div key={g.id} className="flex items-center justify-between px-2 py-1 border border-gray-200 dark:border-gray-700 rounded">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={g.completed} onChange={(e) => onToggle(g.id, e.target.checked)} />
                <span className={`text-sm ${g.completed ? 'line-through text-gray-400' : ''}`}>{g.content}</span>
              </label>
              <button onClick={() => onDelete(g.id)} className="text-xs text-red-600 hover:underline">Remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function SprintCapacity({ items, onUpsert, onDelete }: { items: Array<{ user: { id: string; name?: string | null; email: string }; hours?: number; points?: number }>; onUpsert: (userId: string, hours?: number, points?: number) => Promise<void>; onDelete: (userId: string) => Promise<void> }) {
  const [userId, setUserId] = useState('');
  const [hours, setHours] = useState<number | undefined>(undefined);
  const [points, setPoints] = useState<number | undefined>(undefined);
  return (
    <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-900">
      <div className="text-sm font-medium mb-2">Capacity planning</div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
        <input value={hours ?? ''} onChange={(e) => setHours(e.target.value ? Number(e.target.value) : undefined)} placeholder="Hours" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
        <input value={points ?? ''} onChange={(e) => setPoints(e.target.value ? Number(e.target.value) : undefined)} placeholder="Points" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" />
        <button onClick={() => onUpsert(userId, hours, points)} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">Set</button>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-xs text-gray-500">No capacity set.</div>
        ) : (
          items.map(it => (
            <div key={it.user.id} className="flex items-center justify-between px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm">
              <div className="truncate">{it.user.name || it.user.email}</div>
              <div className="flex items-center gap-3">
                <span>Hours: {it.hours ?? '-'}</span>
                <span>Points: {it.points ?? '-'}</span>
                <button onClick={() => onDelete(it.user.id)} className="text-xs text-red-600 hover:underline">Remove</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function SprintBoard({ items, onStatusChange }: { items: any[]; onStatusChange: (taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED') => Promise<void> }) {
  const columns: Array<{ key: any; title: string }> = [
    { key: 'TODO', title: 'To do' },
    { key: 'IN_PROGRESS', title: 'In progress' },
    { key: 'IN_REVIEW', title: 'In review' },
    { key: 'DONE', title: 'Done' },
    { key: 'CANCELLED', title: 'Cancelled' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      {columns.map(col => (
        <div key={col.key} className="border border-gray-200 dark:border-gray-700 rounded p-2">
          <div className="text-sm font-medium mb-2">{col.title}</div>
          <div className="space-y-2 min-h-[60px]">
            {items.filter((it: any) => it.task?.status === col.key).map((it: any) => (
              <div key={it.id} className="p-2 rounded bg-gray-50 dark:bg-gray-800 text-sm flex items-center justify-between">
                <span className="truncate mr-2">{it.task?.name || it.taskId}</span>
                <select
                  value={it.task?.status}
                  onChange={(e) => onStatusChange(it.taskId, e.target.value as any)}
                  className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                >
                  {columns.map(c => <option key={c.key} value={c.key}>{c.title}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


