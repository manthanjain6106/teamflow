'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone,
  Key,
  Trash2,
  Save,
  Camera,
  Users,
  Trash2 as Trash
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { fetchWorkspaceMembers, addWorkspaceMember, updateWorkspaceMemberRole, removeWorkspaceMember, fetchUserSettings, updateUserSettings } from '@/lib/api';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const { selectedWorkspace } = useStore();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskAssigned: true,
    taskCompleted: false,
    mentions: true,
    dueDates: true
  });
  const [profile, setProfile] = useState({ name: '', image: '' });
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>('system');
  const [security, setSecurity] = useState({ twoFactor: false });

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchUserSettings();
        setAppearance((s?.theme as any) || 'system');
        setNotifications({
          email: s?.emailNotifications ?? true,
          push: s?.pushNotifications ?? true,
          taskAssigned: s?.taskAssigned ?? true,
          taskCompleted: s?.taskCompleted ?? false,
          mentions: s?.mentions ?? true,
          dueDates: s?.dueDates ?? true,
        });
        setProfile({ name: session?.user?.name || '', image: session?.user?.image || '' });
      } catch {}
    })();
  }, [session?.user?.id]);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'integrations', name: 'Integrations', icon: Smartphone },
    { id: 'members', name: 'Members & Roles', icon: Users }
  ];

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Profile Information
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <span className="text-2xl font-medium text-gray-600 dark:text-gray-300">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-1 bg-purple-600 text-white rounded-full hover:bg-purple-700">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Change photo
              </button>
              <p className="text-xs text-gray-500 mt-1">
                JPG, GIF or PNG. Max size of 800KB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input type="email" value={session?.user?.email || ''} readOnly className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Title
              </label>
              <input
                type="text"
                placeholder="Product Manager"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Zone
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>UTC-8 (Pacific Time)</option>
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC+0 (GMT)</option>
                <option>UTC+1 (Central European Time)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Email Notifications
              </h4>
              <p className="text-sm text-gray-500">
                Receive notifications via email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() => handleNotificationChange('email')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Push Notifications
              </h4>
              <p className="text-sm text-gray-500">
                Receive push notifications in browser
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={() => handleNotificationChange('push')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Notification Types
            </h4>
            <div className="space-y-3">
              {[
                { key: 'taskAssigned', label: 'Task Assigned', desc: 'When a task is assigned to you' },
                { key: 'taskCompleted', label: 'Task Completed', desc: 'When your assigned tasks are completed' },
                { key: 'mentions', label: 'Mentions', desc: 'When you are mentioned in comments' },
                { key: 'dueDates', label: 'Due Dates', desc: 'Reminders for upcoming due dates' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.desc}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications] as boolean}
                      onChange={() => handleNotificationChange(item.key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Security Settings
        </h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Change Password
            </h4>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="password"
                placeholder="New password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Two-Factor Authentication
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Add an extra layer of security to your account by enabling 2FA.
            </p>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Key className="h-4 w-4" />
              <span>Enable 2FA</span>
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-sm font-medium text-red-600 mb-3">
              Danger Zone
            </h4>
            <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Delete Account
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Appearance Settings
        </h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Theme
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {(['Light', 'Dark', 'System'] as const).map((theme) => (
                <div key={theme} className="relative">
                  <input
                    type="radio"
                    name="theme"
                    id={theme.toLowerCase()}
                    className="sr-only peer"
                    checked={appearance === (theme.toLowerCase() as any)}
                    onChange={() => setAppearance(theme.toLowerCase() as any)}
                  />
                  <label
                    htmlFor={theme.toLowerCase()}
                    className="flex items-center justify-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer peer-checked:border-purple-500 peer-checked:bg-purple-50 dark:peer-checked:bg-purple-900/30 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {theme}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Language
            </h4>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Members & Roles
  const [members, setMembers] = useState<Array<{ id: string; name: string | null; email: string; image?: string | null; role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'; joinedAt: string }>>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'>('MEMBER');
  const [membersError, setMembersError] = useState<string | null>(null);

  const loadMembers = async () => {
    if (!selectedWorkspace?.id) return;
    try {
      setMembersLoading(true);
      setMembersError(null);
      const data = await fetchWorkspaceMembers(selectedWorkspace.id);
      setMembers(data.members || []);
    } catch (e) {
      setMembersError(e instanceof Error ? e.message : 'Failed to load members');
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'members') {
      loadMembers();
    }
  }, [activeTab, selectedWorkspace?.id]);

  const handleInvite = async () => {
    if (!selectedWorkspace?.id || !inviteEmail.trim()) return;
    try {
      await addWorkspaceMember(selectedWorkspace.id, inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      await loadMembers();
      alert('Invite sent or member added');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to invite member');
    }
  };

  const handleChangeRole = async (userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST') => {
    if (!selectedWorkspace?.id) return;
    try {
      await updateWorkspaceMemberRole(selectedWorkspace.id, userId, role);
      await loadMembers();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update role');
    }
  };

  const handleRemove = async (userId: string) => {
    if (!selectedWorkspace?.id) return;
    if (!confirm('Remove this member from the workspace?')) return;
    try {
      await removeWorkspaceMember(selectedWorkspace.id, userId);
      await loadMembers();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to remove member');
    }
  };

  const renderMembersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Members of {selectedWorkspace?.name || 'Workspace'}</h3>
          <p className="text-sm text-gray-500">Invite people and manage roles</p>
        </div>
      </div>

      {/* Invite form */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invite by email</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {['MEMBER','ADMIN','GUEST'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <button
            onClick={handleInvite}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            disabled={!inviteEmail.trim() || !selectedWorkspace?.id}
          >
            Invite
          </button>
        </div>
      </div>

      {/* Members table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Members</span>
          {membersLoading && <span className="text-xs text-gray-500">Loading...</span>}
        </div>
        {membersError ? (
          <div className="p-4 text-sm text-red-500">{membersError}</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    {m.image ? (
                      <img src={m.image} alt={m.name || m.email} className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="text-xs text-gray-700 dark:text-gray-300">{(m.name || m.email)[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{m.name || m.email}</div>
                    <div className="text-xs text-gray-500">{m.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={m.role}
                    onChange={(e) => handleChangeRole(m.id, e.target.value as any)}
                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {['OWNER','ADMIN','MEMBER','GUEST'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemove(m.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    title="Remove"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {(!members || members.length === 0) && (
              <div className="p-4 text-sm text-gray-500">No members yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Integrations
        </h3>
        <div className="space-y-4">
          {[
            { name: 'Slack', description: 'Get notifications in Slack', connected: true },
            { name: 'Google Calendar', description: 'Sync tasks with your calendar', connected: false },
            { name: 'GitHub', description: 'Link commits to tasks', connected: true },
            { name: 'Figma', description: 'Attach design files to tasks', connected: false }
          ].map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {integration.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {integration.description}
                </p>
              </div>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  integration.connected
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {integration.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'notifications': return renderNotificationsTab();
      case 'security': return renderSecurityTab();
      case 'appearance': return renderAppearanceTab();
      case 'integrations': return renderIntegrationsTab();
      case 'members': return renderMembersTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              {renderContent()}
              
              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                <button
                  onClick={async () => {
                    try {
                      await updateUserSettings({
                        theme: appearance,
                        emailNotifications: notifications.email,
                        pushNotifications: notifications.push,
                        taskAssigned: notifications.taskAssigned,
                        taskCompleted: notifications.taskCompleted,
                        mentions: notifications.mentions,
                        dueDates: notifications.dueDates,
                      });
                    } catch (e) {
                      alert('Failed to update settings');
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}