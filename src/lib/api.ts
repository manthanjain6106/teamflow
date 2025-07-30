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
  const searchParams = new URLSearchParams();
  if (params?.listId) searchParams.append('listId', params.listId);
  if (params?.spaceId) searchParams.append('spaceId', params.spaceId);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.assigneeId) searchParams.append('assigneeId', params.assigneeId);

  const response = await fetch(`/api/tasks?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
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
    throw new Error('Failed to create workspace');
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
}) {
  const response = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  return response.json();
}

export async function deleteTask(id: string) {
  const response = await fetch(`/api/tasks?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
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