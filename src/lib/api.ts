// API utility functions for fetching data
import { useSession } from 'next-auth/react';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

// Fetch functions
export async function fetchWorkspaces() {
  const response = await fetch('/api/workspaces');
  if (!response.ok) {
    throw new Error('Failed to fetch workspaces');
  }
  return response.json();
}

export async function fetchWorkspaceMembers(workspaceId: string) {
  const res = await fetch(`/api/workspaces/${workspaceId}/members`)
  if (!res.ok) throw new Error('Failed to fetch members')
  return res.json()
}

export async function addWorkspaceMember(workspaceId: string, email: string, role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST' = 'MEMBER') {
  const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to add member')
  }
  return res.json()
}

export async function updateWorkspaceMemberRole(workspaceId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST') {
  const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role })
  })
  if (!res.ok) throw new Error('Failed to update role')
  return res.json()
}

export async function removeWorkspaceMember(workspaceId: string, userId: string) {
  const res = await fetch(`/api/workspaces/${workspaceId}/members?userId=${userId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to remove member')
  return res.json()
}

export async function fetchSpaces(workspaceId: string) {
  const response = await fetch(`/api/spaces?workspaceId=${workspaceId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch spaces');
  }
  return response.json();
}

export async function fetchLists(spaceId: string) {
  const response = await fetch(`/api/lists?spaceId=${spaceId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch lists');
  }
  return response.json();
}

export async function fetchTasks(params?: {
  listId?: string;
  spaceId?: string;
  status?: string;
  assigneeId?: string;
}) {
  try {
    const searchParams = new URLSearchParams();
    if (params?.listId) searchParams.append('listId', params.listId);
    if (params?.spaceId) searchParams.append('spaceId', params.spaceId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.assigneeId) searchParams.append('assigneeId', params.assigneeId);

    const response = await fetch(`/api/tasks?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    });
    
    // Gracefully handle unauthorized/forbidden by returning an empty list
    if (response.status === 401 || response.status === 403) {
      return [];
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `Failed to fetch tasks (${response.status})`;
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error('fetchTasks error:', error);
    throw error;
  }
}

// Create functions
export async function createWorkspace(data: {
  name: string;
  description?: string;
  slug: string;
}) {
  const response = await fetch('/api/workspaces', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({} as { error?: string }));
    throw new Error(err.error || 'Failed to create workspace');
  }
  return response.json();
}

export async function createSpace(data: {
  name: string;
  description?: string;
  workspaceId: string;
}) {
  const response = await fetch('/api/spaces', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create space');
  }
  return response.json();
}

export async function deleteSpace(id: string) {
  const response = await fetch(`/api/spaces?id=${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete space');
  return response.json();
}

export async function createList(data: {
  name: string;
  description?: string;
  spaceId: string;
}) {
  const response = await fetch('/api/lists', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create list');
  }
  return response.json();
}

export async function deleteList(id: string) {
  const response = await fetch(`/api/lists?id=${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete list');
  return response.json();
}

export async function createTask(data: {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  listId: string;
  assigneeId?: string;
  dueDate?: string;
}) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  return response.json();
}

// Update functions
export async function updateTask(data: {
  id: string;
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  dueDate?: string;
  startDate?: string;
  parentTaskId?: string;
  position?: number;
}) {
  const { id, ...updateData } = data;
  const attempt = async () => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      const msg = error.error || '';
      // Retry on write conflict/deadlock
      if (/write conflict|deadlock/i.test(msg)) throw new Error('RETRYABLE');
      throw new Error(msg || 'Failed to update task');
    }
    return res.json();
  };

  const maxRetries = 3;
  let delay = 150;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await attempt();
    } catch (e: unknown) {
      const message = typeof e === 'object' && e && 'message' in e ? String((e as { message?: unknown }).message) : '';
      if (message !== 'RETRYABLE' || i === maxRetries - 1) throw e;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

export async function deleteTask(id: string) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete task');
  }
  return response.json();
}

export async function fetchTask(id: string) {
  const response = await fetch(`/api/tasks/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch task');
  }
  return response.json();
}

// Notifications API
export async function fetchNotifications(filter?: 'unread' | 'all') {
  const searchParams = new URLSearchParams();
  if (filter) searchParams.append('filter', filter);

  const response = await fetch(`/api/notifications?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
}

export async function createNotification(data: {
  type: string;
  title: string;
  message: string;
  userId?: string;
}) {
  const response = await fetch('/api/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create notification');
  }
  return response.json();
}

export async function updateNotification(data: {
  id?: string;
  read?: boolean;
  markAllAsRead?: boolean;
}) {
  const response = await fetch('/api/notifications', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update notification');
  }
  return response.json();
}

export async function deleteNotification(id: string) {
  const response = await fetch(`/api/notifications?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }
  return response.json();
}

// Documents API
export async function fetchDocuments(params: {
  workspaceId: string;
  folderId?: string;
  starred?: boolean;
}) {
  const searchParams = new URLSearchParams();
  searchParams.append('workspaceId', params.workspaceId);
  if (params.folderId) searchParams.append('folderId', params.folderId);
  if (params.starred) searchParams.append('starred', 'true');

  const response = await fetch(`/api/documents?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  return response.json();
}

export async function createDocument(data: {
  title: string;
  content?: string;
  workspaceId: string;
  folderId?: string;
  starred?: boolean;
}) {
  const response = await fetch('/api/documents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create document');
  }
  return response.json();
}

export async function updateDocument(data: {
  id: string;
  title?: string;
  content?: string;
  starred?: boolean;
  folderId?: string;
}) {
  const response = await fetch('/api/documents', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update document');
  }
  return response.json();
}

export async function deleteDocument(id: string) {
  const response = await fetch(`/api/documents?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete document');
  }
  return response.json();
}

// Document Folders API
export async function fetchDocumentFolders(workspaceId: string) {
  const response = await fetch(`/api/document-folders?workspaceId=${workspaceId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch document folders');
  }
  return response.json();
}

// Document Comments API
export async function fetchDocumentComments(documentId: string) {
  const response = await fetch(`/api/document-comments?documentId=${documentId}`);
  if (!response.ok) throw new Error('Failed to fetch comments');
  return response.json();
}

export async function addDocumentComment(data: { documentId: string; content: string }) {
  const response = await fetch('/api/document-comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add comment');
  return response.json();
}

export async function deleteDocumentComment(id: string, documentId: string) {
  const response = await fetch(`/api/document-comments?id=${id}&documentId=${documentId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete comment');
  return response.json();
}

// Document Versions API
export async function fetchDocumentVersions(documentId: string) {
  const response = await fetch(`/api/document-versions?documentId=${documentId}`);
  if (!response.ok) throw new Error('Failed to fetch versions');
  return response.json();
}

// Document Shares API
export async function fetchDocumentShares(documentId: string) {
  const response = await fetch(`/api/document-shares?documentId=${documentId}`);
  if (!response.ok) throw new Error('Failed to fetch shares');
  return response.json();
}

export async function shareDocument(data: { documentId: string; userEmail: string; permission: 'view' | 'comment' | 'edit' | 'admin' | string }) {
  const response = await fetch('/api/document-shares', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to share document');
  return response.json();
}

export async function removeDocumentShare(documentId: string, userId: string) {
  const response = await fetch(`/api/document-shares?documentId=${documentId}&userId=${userId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to remove share');
  return response.json();
}

export async function createDocumentFolder(data: {
  name: string;
  color?: string;
  workspaceId: string;
}) {
  const response = await fetch('/api/document-folders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create document folder');
  }
  return response.json();
}

export async function updateDocumentFolder(data: {
  id: string;
  name?: string;
  color?: string;
}) {
  const response = await fetch('/api/document-folders', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update document folder');
  }
  return response.json();
}

export async function deleteDocumentFolder(id: string) {
  const response = await fetch(`/api/document-folders?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete document folder');
  }
  return response.json();
}

// Goals API
export async function fetchGoals(params: {
  workspaceId: string;
  status?: string;
}) {
  const searchParams = new URLSearchParams();
  searchParams.append('workspaceId', params.workspaceId);
  if (params.status) searchParams.append('status', params.status);

  const response = await fetch(`/api/goals?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch goals');
  }
  return response.json();
}

export async function fetchSprints(params: { workspaceId: string }) {
  const url = new URL('/api/sprints', window.location.origin)
  url.searchParams.set('workspaceId', params.workspaceId)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch sprints')
  return res.json()
}

export async function createSprint(data: { name: string; goal?: string; startDate: string; endDate: string; workspaceId: string; }) {
  const res = await fetch('/api/sprints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to create sprint')
  return res.json()
}

export async function updateSprint(data: { id: string; name?: string; goal?: string; startDate?: string; endDate?: string; status?: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' }) {
  const res = await fetch('/api/sprints', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  let payload: any = null
  try { payload = await res.json() } catch {}
  if (!res.ok) throw new Error(payload?.error || 'Failed to update sprint')
  return payload
}

export async function fetchSprintTasks(sprintId: string) {
  const res = await fetch(`/api/sprints/${sprintId}/tasks`)
  if (!res.ok) throw new Error('Failed to fetch sprint tasks')
  return res.json()
}

export async function fetchSprintMetrics(sprintId: string) {
  const url = new URL('/api/sprints/metrics', window.location.origin)
  url.searchParams.set('sprintId', sprintId)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch sprint metrics')
  return res.json()
}

export async function fetchSprintGoals(sprintId: string) {
  const res = await fetch(`/api/sprints/${sprintId}/goals`)
  if (!res.ok) throw new Error('Failed to fetch sprint goals')
  return res.json()
}

export async function addSprintGoal(sprintId: string, content: string, order = 0) {
  const res = await fetch(`/api/sprints/${sprintId}/goals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, order }) })
  if (!res.ok) throw new Error('Failed to add sprint goal')
  return res.json()
}

export async function updateSprintGoal(data: { id: string; content?: string; completed?: boolean; order?: number }) {
  const res = await fetch(`/api/sprints/${(data as any).sprintId || ''}/goals`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to update sprint goal')
  return res.json()
}

export async function deleteSprintGoal(id: string) {
  const url = new URL('/api/sprints/any/goals', window.location.origin)
  url.searchParams.set('id', id)
  const res = await fetch(url.toString(), { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete sprint goal')
  return res.json()
}

export async function fetchSprintCapacity(sprintId: string) {
  const res = await fetch(`/api/sprints/${sprintId}/capacity`)
  if (!res.ok) throw new Error('Failed to fetch capacity')
  return res.json()
}

export async function upsertSprintCapacity(sprintId: string, userId: string, hours?: number, points?: number) {
  const res = await fetch(`/api/sprints/${sprintId}/capacity`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, hours, points }) })
  if (!res.ok) throw new Error('Failed to update capacity')
  return res.json()
}

export async function deleteSprintCapacity(sprintId: string, userId: string) {
  const url = new URL(`/api/sprints/${sprintId}/capacity`, window.location.origin)
  url.searchParams.set('userId', userId)
  const res = await fetch(url.toString(), { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete capacity')
  return res.json()
}

// Whiteboards
export async function fetchWhiteboards(workspaceId: string) {
  const url = new URL('/api/whiteboards', window.location.origin)
  url.searchParams.set('workspaceId', workspaceId)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch whiteboards')
  return res.json()
}

export async function createWhiteboard(data: { title: string; workspaceId: string; initialData?: any }) {
  const res = await fetch('/api/whiteboards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: data.title, workspaceId: data.workspaceId, data: data.initialData || {} }) })
  if (!res.ok) throw new Error('Failed to create whiteboard')
  return res.json()
}

export async function saveWhiteboard(data: { id: string; title?: string; data?: any }) {
  const res = await fetch('/api/whiteboards', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to save whiteboard')
  return res.json()
}

export async function deleteWhiteboard(id: string) {
  const url = new URL('/api/whiteboards', window.location.origin)
  url.searchParams.set('id', id)
  const res = await fetch(url.toString(), { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete whiteboard')
  return res.json()
}

export async function addTaskToSprint(sprintId: string, taskId: string) {
  const res = await fetch(`/api/sprints/${sprintId}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId }) })
  if (!res.ok) throw new Error('Failed to add task to sprint')
  return res.json()
}

export async function removeTaskFromSprint(sprintId: string, taskId: string) {
  const url = new URL(`/api/sprints/${sprintId}/tasks`, window.location.origin)
  url.searchParams.set('taskId', taskId)
  const res = await fetch(url.toString(), { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to remove sprint task')
  return res.json()
}

export async function fetchTaskRelations(taskId: string) {
  const url = new URL('/api/task-relations', window.location.origin)
  url.searchParams.set('taskId', taskId)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch task relations')
  return res.json()
}

export async function addTaskRelation(data: { fromTaskId: string; toTaskId: string; type: 'RELATES' | 'BLOCKS' | 'IS_BLOCKED_BY' | 'DUPLICATES' | 'IS_DUPLICATED_BY' }) {
  const res = await fetch('/api/task-relations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to add relation')
  return res.json()
}

export async function removeTaskRelation(id: string) {
  const url = new URL('/api/task-relations', window.location.origin)
  url.searchParams.set('id', id)
  const res = await fetch(url.toString(), { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to remove relation')
  return res.json()
}

export async function fetchChecklist(taskId: string) {
  const url = new URL('/api/checklists', window.location.origin)
  url.searchParams.set('taskId', taskId)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch checklist')
  return res.json()
}

export async function addChecklistItem(data: { taskId: string; content: string; order?: number }) {
  const res = await fetch('/api/checklists', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to add checklist item')
  return res.json()
}

export async function updateChecklistItem(data: { id: string; content?: string; completed?: boolean; order?: number }) {
  const res = await fetch('/api/checklists', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to update checklist item')
  return res.json()
}

export async function deleteChecklistItem(id: string) {
  const url = new URL('/api/checklists', window.location.origin)
  url.searchParams.set('id', id)
  const res = await fetch(url.toString(), { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete checklist item')
  return res.json()
}

export async function fetchTaskAssignments(taskId: string) {
  const url = new URL('/api/task-assignments', window.location.origin)
  url.searchParams.set('taskId', taskId)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch assignments')
  return res.json()
}

export async function addTaskAssignment(data: { taskId: string; userId: string; role?: string }) {
  const res = await fetch('/api/task-assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to add assignment')
  return res.json()
}

export async function removeTaskAssignment(taskId: string, userId: string) {
  const url = new URL('/api/task-assignments', window.location.origin)
  url.searchParams.set('taskId', taskId)
  url.searchParams.set('userId', userId)
  const res = await fetch(url.toString(), { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to remove assignment')
  return res.json()
}

export async function fetchAutomations(workspaceId: string) {
  const url = new URL('/api/automations', window.location.origin)
  url.searchParams.set('workspaceId', workspaceId)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch automations')
  return res.json()
}

export async function createAutomation(data: { workspaceId: string; name: string; description?: string; active?: boolean; trigger: any; actions: any }) {
  const res = await fetch('/api/automations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to create automation')
  return res.json()
}

export async function updateAutomation(data: { id: string; name?: string; description?: string; active?: boolean; trigger?: any; actions?: any }) {
  const res = await fetch('/api/automations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to update automation')
  return res.json()
}

export async function deleteAutomation(id: string) {
  const url = new URL('/api/automations', window.location.origin)
  url.searchParams.set('id', id)
  const res = await fetch(url.toString(), { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete automation')
  return res.json()
}

export async function fetchReminders() {
  const res = await fetch('/api/reminders')
  if (!res.ok) throw new Error('Failed to fetch reminders')
  return res.json()
}

export async function createReminder(data: { title: string; remindAt: string; taskId?: string }) {
  const res = await fetch('/api/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to create reminder')
  return res.json()
}

export async function deleteReminder(id: string) {
  const url = new URL('/api/reminders', window.location.origin)
  url.searchParams.set('id', id)
  const res = await fetch(url.toString(), { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete reminder')
  return res.json()
}

export async function fetchMilestones(workspaceId: string) {
  const url = new URL('/api/milestones', window.location.origin)
  url.searchParams.set('workspaceId', workspaceId)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch milestones')
  return res.json()
}

export async function createMilestone(data: { title: string; description?: string; targetDate: string; workspaceId: string; spaceId?: string }) {
  const res = await fetch('/api/milestones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to create milestone')
  return res.json()
}

export async function updateMilestone(data: { id: string; title?: string; description?: string; targetDate?: string }) {
  const res = await fetch('/api/milestones', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('Failed to update milestone')
  return res.json()
}

export async function deleteMilestone(id: string) {
  const url = new URL('/api/milestones', window.location.origin)
  url.searchParams.set('id', id)
  const res = await fetch(url.toString(), { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete milestone')
  return res.json()
}

export async function createGoal(data: {
  title: string;
  description?: string;
  dueDate?: string;
  workspaceId: string;
  keyResults?: Array<{
    name: string;
    target: number;
    current?: number;
  }>;
}) {
  const response = await fetch('/api/goals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create goal');
  }
  return response.json();
}

export async function updateGoal(data: {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  progress?: number;
  dueDate?: string;
}) {
  const response = await fetch('/api/goals', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update goal');
  }
  return response.json();
}

export async function deleteGoal(id: string) {
  const response = await fetch(`/api/goals?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete goal');
  }
  return response.json();
}

// Analytics API
export async function fetchAnalytics(params: {
  workspaceId: string;
  period?: '7d' | '30d' | '90d';
}) {
  const searchParams = new URLSearchParams();
  searchParams.append('workspaceId', params.workspaceId);
  if (params.period) searchParams.append('period', params.period);

  const response = await fetch(`/api/analytics?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }
  return response.json();
}

// User Settings API
export async function fetchUserSettings() {
  const response = await fetch('/api/user-settings');
  if (!response.ok) {
    throw new Error('Failed to fetch user settings');
  }
  return response.json();
}

export async function updateUserSettings(data: {
  theme?: string;
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  taskAssigned?: boolean;
  taskCompleted?: boolean;
  mentions?: boolean;
  dueDates?: boolean;
}) {
  const response = await fetch('/api/user-settings', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update user settings');
  }
  return response.json();
}

// Task Sharing API
export async function fetchTaskShares(taskId: string) {
  const response = await fetch(`/api/task-shares?taskId=${taskId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch task shares');
  }
  return response.json();
}

export async function shareTask(data: {
  taskId: string;
  userEmail: string;
  permission: 'read' | 'write' | 'admin';
}) {
  const response = await fetch('/api/task-shares', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to share task');
  }
  return response.json();
}

export async function removeTaskShare(shareId: string) {
  const response = await fetch(`/api/task-shares?shareId=${shareId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove task share');
  }
  return response.json();
}

// Search API
export async function searchContent(params: {
  query: string;
  workspaceId: string;
  type?: 'task' | 'document' | 'goal' | 'comment' | 'all';
}) {
  const searchParams = new URLSearchParams();
  searchParams.append('q', params.query);
  searchParams.append('workspaceId', params.workspaceId);
  if (params.type) searchParams.append('type', params.type);

  const response = await fetch(`/api/search?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to perform search');
  }
  return response.json();
}

export async function updateSearchIndex(data: {
  entityId: string;
  title: string;
  content: string;
  type: string;
  workspaceId: string;
}) {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update search index');
  }
  return response.json();
}

// Attachments API
export async function fetchAttachments(taskId: string) {
  const response = await fetch(`/api/attachments?taskId=${taskId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch attachments');
  }
  return response.json();
}

export async function uploadAttachment(file: File, taskId: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('taskId', taskId);

  const response = await fetch('/api/attachments', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload attachment');
  }
  return response.json();
}

export async function deleteAttachment(attachmentId: string) {
  const response = await fetch(`/api/attachments?id=${attachmentId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete attachment');
  }
  return response.json();
}