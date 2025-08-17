import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })
    const r = await prisma.recurrenceRule.findFirst({ where: { taskId } })
    return NextResponse.json(r)
  } catch (e) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { taskId, frequency, interval = 1, byWeekday = [], byMonthDay = [], endsAt } = body
    if (!taskId || !frequency) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const created = await prisma.recurrenceRule.upsert({
      where: { taskId },
      update: { frequency, interval, byWeekday, byMonthDay, endsAt: endsAt ? new Date(endsAt) : null, active: true },
      create: { taskId, frequency, interval, byWeekday, byMonthDay, endsAt: endsAt ? new Date(endsAt) : null }
    } as any)
    return NextResponse.json(created, { status: 201 })
  } catch (e) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })
    await prisma.recurrenceRule.delete({ where: { taskId } } as any)
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}


