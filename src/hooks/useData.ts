import { useState, useEffect } from 'react';
import { 
  fetchWorkspaces, 
  fetchSpaces, 
  fetchLists, 
  fetchTasks,
  fetchNotifications,
  fetchDocuments,
  fetchDocumentFolders,
  fetchGoals,
  fetchAnalytics,
  fetchUserSettings
} from '@/lib/api';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  return { workspaces, loading, error, refetch: loadWorkspaces };
}

export function useSpaces(workspaceId?: string) {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSpaces = async () => {
    if (!workspaceId) {
      setSpaces([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchSpaces(workspaceId);
      setSpaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load spaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpaces();
  }, [workspaceId]);

  return { spaces, loading, error, refetch: loadSpaces };
}

export function useLists(spaceId?: string) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLists = async () => {
    if (!spaceId) {
      setLists([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchLists(spaceId);
      setLists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, [spaceId]);

  return { lists, loading, error, refetch: loadLists };
}

export function useTasks(params?: {
  listId?: string;
  spaceId?: string;
  status?: string;
  assigneeId?: string;
}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTasks(params);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [params?.listId, params?.spaceId, params?.status, params?.assigneeId]);

  return { tasks, loading, error, refetch: loadTasks };
}

// Notifications hooks
export function useNotifications(filter?: 'unread' | 'all') {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchNotifications(filter);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  return { notifications, loading, error, refetch: loadNotifications };
}

// Documents hooks
export function useDocuments(params: {
  workspaceId?: string;
  folderId?: string;
  starred?: boolean;
}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    if (!params.workspaceId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchDocuments(params);
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [params.workspaceId, params.folderId, params.starred]);

  return { documents, loading, error, refetch: loadDocuments };
}

export function useDocumentFolders(workspaceId?: string) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFolders = async () => {
    if (!workspaceId) {
      setFolders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchDocumentFolders(workspaceId);
      setFolders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document folders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, [workspaceId]);

  return { folders, loading, error, refetch: loadFolders };
}

// Goals hooks
export function useGoals(params: {
  workspaceId?: string;
  status?: string;
}) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = async () => {
    if (!params.workspaceId) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchGoals(params);
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [params.workspaceId, params.status]);

  return { goals, loading, error, refetch: loadGoals };
}

// Analytics hooks
export function useAnalytics(params: {
  workspaceId?: string;
  period?: '7d' | '30d' | '90d';
}) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    if (!params.workspaceId) {
      setAnalytics(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchAnalytics(params);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [params.workspaceId, params.period]);

  return { analytics, loading, error, refetch: loadAnalytics };
}

// User Settings hooks
export function useUserSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserSettings();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return { settings, loading, error, refetch: loadSettings };
}

// Task Sharing hooks
export function useTaskShares(taskId?: string) {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShares = async () => {
    if (!taskId) {
      setShares([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { fetchTaskShares } = await import('@/lib/api');
      const data = await fetchTaskShares(taskId);
      setShares(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task shares');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShares();
  }, [taskId]);

  return { shares, loading, error, refetch: loadShares };
}

// Search hook
export function useSearch() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (params: {
    query: string;
    workspaceId: string;
    type?: 'task' | 'document' | 'goal' | 'comment' | 'all';
  }) => {
    if (!params.query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { searchContent } = await import('@/lib/api');
      const data = await searchContent(params);
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform search');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return { results, loading, error, search, clearResults };
}

// Attachments hooks
export function useAttachments(taskId?: string) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttachments = async () => {
    if (!taskId) {
      setAttachments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { fetchAttachments } = await import('@/lib/api');
      const data = await fetchAttachments(taskId);
      setAttachments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [taskId]);

  return { attachments, loading, error, refetch: loadAttachments };
}