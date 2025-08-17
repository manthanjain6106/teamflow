import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User, Workspace, Space, List, Task } from '@/types/entities'

interface AppStore {
  // UI State
  sidebarCollapsed: boolean
  currentView: 'LIST' | 'BOARD' | 'CALENDAR' | 'GANTT' | 'TIMELINE' | 'TABLE'
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
  setCurrentView: (view: 'LIST' | 'BOARD' | 'CALENDAR' | 'GANTT' | 'TIMELINE' | 'TABLE') => void
  setSelectedWorkspace: (workspace: Workspace | undefined) => void
  setSelectedSpace: (space: Space | undefined) => void
  setSelectedList: (list: List | undefined) => void
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