// Shared entity types for workspaces, spaces, lists, and tasks

export type UserRole = 'ADMIN' | 'MEMBER'
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
export type TaskPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  role: UserRole
}

export interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  role: WorkspaceRole
}

export interface Space {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  private: boolean
  workspaceId: string
}

export interface List {
  id: string
  name: string
  description?: string
  color?: string
  position: number
  archived: boolean
  spaceId: string
}

export interface Task {
  id: string
  name: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  position: number
  startDate?: Date
  dueDate?: Date
  completedAt?: Date
  listId: string
  creatorId: string
  assigneeId?: string
  parentTaskId?: string
}


