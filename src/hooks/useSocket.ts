import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { io, Socket } from 'socket.io-client'
import { useStore } from '@/store/useStore'
import type { 
  ClientToServerEvents, 
  ServerToClientEvents, 
  SocketNotification,
  TaskUpdate,
  CommentData,
  UserPresence
} from '@/lib/websocket'

export type { SocketNotification, TaskUpdate, CommentData, UserPresence }

interface UseSocketReturn {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null
  connected: boolean
  notifications: SocketNotification[]
  onlineUsers: UserPresence[]
  typingUsers: Record<string, string[]> // taskId -> userIds
  addNotification: (notification: SocketNotification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  joinWorkspace: (workspaceId: string) => void
  leaveWorkspace: (workspaceId: string) => void
  joinTask: (taskId: string) => void
  leaveTask: (taskId: string) => void
  startTyping: (taskId: string) => void
  stopTyping: (taskId: string) => void
  sendTaskUpdate: (taskId: string, updates: Partial<TaskUpdate>) => void
  sendComment: (taskId: string, content: string, mentions?: string[]) => void
  markNotificationRead: (notificationId: string) => void
  markAllNotificationsRead: () => void
}

export const useSocket = (): UseSocketReturn => {
  const { data: session } = useSession()
  const { selectedWorkspace } = useStore()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<SocketNotification[]>([])
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([])
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({})
  
  const currentTaskId = useRef<string | null>(null)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)

  // Initialize socket connection
  useEffect(() => {
    if (!session?.user?.id) return

    const socketInstance = io(process.env.NODE_ENV === 'production' 
      ? 'wss://your-domain.com' // Replace with your production WebSocket URL
      : 'ws://localhost:3000', {
      transports: ['websocket', 'polling'],
      upgrade: true,
      forceNew: true
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
      setConnected(true)
      
      // Send user data after connection
      socketInstance.emit('user-online', {
        id: session.user.id!,
        name: session.user.name || 'Unknown',
        image: session.user.image
      })
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnected(false)
    })

    // Handle notifications
    socketInstance.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 19)]) // Keep last 20
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id
        })
      }
    })

    // Handle task updates
    socketInstance.on('task-updated', (update) => {
      console.log('Task updated:', update)
      // You can dispatch this to your global state management
      // or emit a custom event that components can listen to
      window.dispatchEvent(new CustomEvent('taskUpdated', { detail: update }))
    })

    socketInstance.on('task-created', (task) => {
      console.log('Task created:', task)
      window.dispatchEvent(new CustomEvent('taskCreated', { detail: task }))
    })

    socketInstance.on('task-deleted', (taskId) => {
      console.log('Task deleted:', taskId)
      window.dispatchEvent(new CustomEvent('taskDeleted', { detail: { taskId } }))
    })

    socketInstance.on('task-moved', (data) => {
      console.log('Task moved:', data)
      window.dispatchEvent(new CustomEvent('taskMoved', { detail: data }))
    })

    // Handle comments
    socketInstance.on('comment-added', (comment) => {
      console.log('Comment added:', comment)
      window.dispatchEvent(new CustomEvent('commentAdded', { detail: comment }))
    })

    // Handle user presence
    socketInstance.on('user-joined', (user) => {
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.userId !== user.userId)
        return [...filtered, user]
      })
    })

    socketInstance.on('user-left', (userId) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== userId))
    })

    socketInstance.on('users-online', (users) => {
      setOnlineUsers(users)
    })

    // Handle typing indicators
    socketInstance.on('user-typing', ({ userId, taskId, isTyping }) => {
      setTypingUsers(prev => {
        const taskTyping = prev[taskId] || []
        if (isTyping) {
          if (!taskTyping.includes(userId)) {
            return {
              ...prev,
              [taskId]: [...taskTyping, userId]
            }
          }
        } else {
          return {
            ...prev,
            [taskId]: taskTyping.filter(id => id !== userId)
          }
        }
        return prev
      })
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [session?.user?.id])

  // Join workspace when selected workspace changes
  useEffect(() => {
    if (socket && connected && selectedWorkspace?.id) {
      socket.emit('join-workspace', selectedWorkspace.id)
      
      return () => {
        socket.emit('leave-workspace', selectedWorkspace.id)
      }
    }
  }, [socket, connected, selectedWorkspace?.id])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const addNotification = useCallback((notification: SocketNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 19)])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (socket) {
      socket.emit('mark-notification-read', id)
    }
  }, [socket])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    if (socket) {
      socket.emit('mark-all-notifications-read')
    }
  }, [socket])

  const joinWorkspace = useCallback((workspaceId: string) => {
    if (socket) {
      socket.emit('join-workspace', workspaceId)
    }
  }, [socket])

  const leaveWorkspace = useCallback((workspaceId: string) => {
    if (socket) {
      socket.emit('leave-workspace', workspaceId)
    }
  }, [socket])

  const joinTask = useCallback((taskId: string) => {
    if (socket) {
      if (currentTaskId.current) {
        socket.emit('leave-task', currentTaskId.current)
      }
      socket.emit('join-task', taskId)
      currentTaskId.current = taskId
    }
  }, [socket])

  const leaveTask = useCallback((taskId: string) => {
    if (socket) {
      socket.emit('leave-task', taskId)
      if (currentTaskId.current === taskId) {
        currentTaskId.current = null
      }
    }
  }, [socket])

  const startTyping = useCallback((taskId: string) => {
    if (!socket) return
    
    socket.emit('start-typing', taskId)
    
    // Clear existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current)
    }
    
    // Auto-stop typing after 3 seconds of inactivity
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop-typing', taskId)
    }, 3000)
  }, [socket])

  const stopTyping = useCallback((taskId: string) => {
    if (!socket) return
    
    socket.emit('stop-typing', taskId)
    
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current)
      typingTimeout.current = null
    }
  }, [socket])

  const sendTaskUpdate = useCallback((taskId: string, updates: Partial<TaskUpdate>) => {
    if (socket) {
      socket.emit('update-task', taskId, updates)
    }
  }, [socket])

  const sendComment = useCallback((taskId: string, content: string, mentions?: string[]) => {
    if (socket) {
      socket.emit('add-comment', { taskId, content, mentions })
    }
  }, [socket])

  const markNotificationRead = useCallback((notificationId: string) => {
    removeNotification(notificationId)
  }, [removeNotification])

  const markAllNotificationsRead = useCallback(() => {
    clearNotifications()
  }, [clearNotifications])

  return {
    socket,
    connected,
    notifications,
    onlineUsers,
    typingUsers,
    addNotification,
    removeNotification,
    clearNotifications,
    joinWorkspace,
    leaveWorkspace,
    joinTask,
    leaveTask,
    startTyping,
    stopTyping,
    sendTaskUpdate,
    sendComment,
    markNotificationRead,
    markAllNotificationsRead
  }
}

// Custom hook for notifications only
export const useNotifications = (filter?: 'all' | 'unread') => {
  const [notifications, setNotifications] = useState<SocketNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications${filter === 'unread' ? '?unread=true' : ''}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      
      const data = await response.json()
      setNotifications(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications
  }
}

// Hook for real-time task collaboration
export const useTaskCollaboration = (taskId: string) => {
  const { socket, joinTask, leaveTask, startTyping, stopTyping, typingUsers } = useSocket()
  const [taskUpdates, setTaskUpdates] = useState<TaskUpdate[]>([])
  const [comments, setComments] = useState<CommentData[]>([])

  useEffect(() => {
    if (taskId) {
      joinTask(taskId)
      
      return () => {
        leaveTask(taskId)
      }
    }
  }, [taskId, joinTask, leaveTask])

  useEffect(() => {
    const handleTaskUpdate = (event: CustomEvent<TaskUpdate>) => {
      if (event.detail.id === taskId) {
        setTaskUpdates(prev => [event.detail, ...prev.slice(0, 9)]) // Keep last 10
      }
    }

    const handleCommentAdded = (event: CustomEvent<CommentData>) => {
      if (event.detail.taskId === taskId) {
        setComments(prev => [event.detail, ...prev])
      }
    }

    window.addEventListener('taskUpdated', handleTaskUpdate as EventListener)
    window.addEventListener('commentAdded', handleCommentAdded as EventListener)

    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdate as EventListener)
      window.removeEventListener('commentAdded', handleCommentAdded as EventListener)
    }
  }, [taskId])

  const currentTypingUsers = typingUsers[taskId] || []

  return {
    taskUpdates,
    comments,
    typingUsers: currentTypingUsers,
    startTyping: () => startTyping(taskId),
    stopTyping: () => stopTyping(taskId)
  }
}