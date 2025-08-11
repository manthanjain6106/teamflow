'use client';

import { useEffect, useState } from 'react';
import { X, Users, Trash2 } from 'lucide-react';
import { fetchWorkspaceMembers, addWorkspaceMember, updateWorkspaceMemberRole, removeWorkspaceMember } from '@/lib/api';

type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';

interface WorkspaceMembersModalProps {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
}

export default function WorkspaceMembersModal({ workspaceId, open, onClose }: WorkspaceMembersModalProps) {
  const [members, setMembers] = useState<Array<{ id: string; name: string | null; email: string; image?: string | null; role: Role; joinedAt: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('MEMBER');

  const load = async () => {
    if (!workspaceId || !open) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWorkspaceMembers(workspaceId);
      setMembers(data.members || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [workspaceId, open]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await addWorkspaceMember(workspaceId, inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      await load();
      alert('Invite sent or member added');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to invite');
    }
  };

  const changeRole = async (userId: string, role: Role) => {
    try {
      await updateWorkspaceMemberRole(workspaceId, userId, role);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update role');
    }
  };

  const remove = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      await removeWorkspaceMember(workspaceId, userId);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to remove');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Members & Roles</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invite by email</label>
                <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} type="email" placeholder="name@example.com" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as Role)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  {['MEMBER','ADMIN','GUEST'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <button onClick={handleInvite} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700" disabled={!inviteEmail.trim()}>Invite</button>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 flex justify-between">
                <span>Members</span>
                {loading && <span>Loading...</span>}
              </div>
              {error ? (
                <div className="p-4 text-sm text-red-500">{error}</div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {members.map(m => (
                    <div key={m.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          {m.image ? <img src={m.image} alt={m.name || m.email} className="w-8 h-8 rounded-full" /> : <span className="text-xs text-gray-700 dark:text-gray-300">{(m.name || m.email)[0]?.toUpperCase()}</span>}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{m.name || m.email}</div>
                          <div className="text-xs text-gray-500">{m.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value as Role)} className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                          {['OWNER','ADMIN','MEMBER','GUEST'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button onClick={() => remove(m.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <div className="p-4 text-sm text-gray-500">No members yet.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


