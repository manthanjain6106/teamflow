import { prisma } from '@/lib/prisma'

type TaskEvent = {
  type: 'TASK_CREATED' | 'TASK_UPDATED'
  task: { id: string; name: string; status: string; priority: string; listId: string; createdById: string; assigneeId?: string | null }
  changes?: Record<string, { old: any; new: any }>
  workspaceId: string
  actorId: string
}

export async function runAutomations(event: TaskEvent) {
  // Fetch rules
  const rules = await prisma.automationRule.findMany({ where: { workspaceId: event.workspaceId, active: true } })
  for (const rule of rules) {
    try {
      const trigger = rule.trigger as any
      if (!trigger || trigger.event !== event.type) continue

      // Simple condition check
      let pass = true
      if (trigger.conditions) {
        for (const [key, expected] of Object.entries(trigger.conditions)) {
          const actual = (event.task as any)[key]
          if (actual !== expected) { pass = false; break }
        }
      }
      if (!pass) continue

      const actions = Array.isArray(rule.actions) ? rule.actions : []
      for (const action of actions) {
        if (action.type === 'SET_STATUS' && action.value) {
          await prisma.task.update({ where: { id: event.task.id }, data: { status: action.value } })
        } else if (action.type === 'SET_PRIORITY' && action.value) {
          await prisma.task.update({ where: { id: event.task.id }, data: { priority: action.value } })
        } else if (action.type === 'ASSIGN' && action.userId) {
          await prisma.task.update({ where: { id: event.task.id }, data: { assigneeId: action.userId } })
        } else if (action.type === 'CREATE_REMINDER' && action.remindAt) {
          await prisma.reminder.create({ data: { userId: action.userId || event.actorId, taskId: event.task.id, title: action.title || `Reminder: ${event.task.name}`, remindAt: new Date(action.remindAt) } })
        }
      }
    } catch (e) {
      // Continue on errors per rule
      console.error('Automation rule failed', rule.id, e)
    }
  }
}


