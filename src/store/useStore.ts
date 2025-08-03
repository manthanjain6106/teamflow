import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Types
interface User {
  id: string
  email: string
  name?: string
  image?: string
  role: 'ADMIN' | 'MEMBER'
}

interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'
}

interface Space {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  private: boolean
  workspaceId: string
}

interface List {
  id: string
  name: string
  description?: string
  color?: string
  position: number
  archived: boolean
  spaceId: string
}

interface Task {
  id: string
  name: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'
  position: number
  startDate?: Date
  dueDate?: Date
  completedAt?: Date
  listId: string
  creatorId: string
  assigneeId?: string
  parentTaskId?: string
}

interface AppStore {
  // UI State
  sidebarCollapsed: boolean
  currentView: 'LIST' | 'BOARD' | 'CALENDAR' | 'GANTT' | 'TIMELINE' | 'TABLE' | 'MIND_MAP'
  selectedWorkspace?: Workspace
  selectedSpace?: Space
  selectedList?: List
  
  // Data
  user?: User
  workspaces: Workspace[]
  spaces: Space[]
  lists: List[]
  tasks: Task[]
  
  // Loading states
  isLoading: boolean
  isTasksLoading: boolean
  
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void
  setCurrentView: (view: 'LIST' | 'BOARD' | 'CALENDAR' | 'GANTT' | 'TIMELINE' | 'TABLE' | 'MIND_MAP') => void
  setSelectedWorkspace: (workspace: Workspace) => void
  setSelectedSpace: (space: Space) => void
  setSelectedList: (list: List) => void
  setUser: (user: User) => void
  setWorkspaces: (workspaces: Workspace[]) => void
  setSpaces: (spaces: Space[]) => void
  setLists: (lists: List[]) => void
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  setLoading: (loading: boolean) => void
  setTasksLoading: (loading: boolean) => void
}

export const useStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        sidebarCollapsed: false,
        currentView: 'LIST',
        workspaces: [],
        spaces: [],
        lists: [],
        tasks: [],
        isLoading: false,
        isTasksLoading: false,

        // Actions
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        
        setCurrentView: (view) => set({ currentView: view }),
        
        setSelectedWorkspace: (workspace) => set({ 
          selectedWorkspace: workspace,
          selectedSpace: undefined,
          selectedList: undefined 
        }),
        
        setSelectedSpace: (space) => set({ 
          selectedSpace: space,
          selectedList: undefined 
        }),
        
        setSelectedList: (list) => set({ selectedList: list }),
        
        setUser: (user) => set({ user }),
        
        setWorkspaces: (workspaces) => set({ workspaces }),
        
        setSpaces: (spaces) => set({ spaces }),
        
        setLists: (lists) => set({ lists }),
        
        setTasks: (tasks) => set({ tasks }),
        
        addTask: (task) => set((state) => ({ 
          tasks: [...state.tasks, task] 
        })),
        
        updateTask: (taskId, updates) => set((state) => ({
          tasks: state.tasks.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
          )
        })),
        
        deleteTask: (taskId) => set((state) => ({
          tasks: state.tasks.filter(task => task.id !== taskId)
        })),
        
        setLoading: (loading) => set({ isLoading: loading }),
        
        setTasksLoading: (loading) => set({ isTasksLoading: loading }),
      }),
      {
        name: 'teamflow-storage',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          currentView: state.currentView,
          selectedWorkspace: state.selectedWorkspace,
          selectedSpace: state.selectedSpace,
          selectedList: state.selectedList,
        }),
      }
    )
  )
)