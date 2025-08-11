import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

    const invite = await prisma.invitation.findUnique({ where: { token } })
    if (!invite) return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })
    if (invite.status !== 'PENDING' || invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invite expired' }, { status: 400 })
    }
    return NextResponse.json({ invite: { email: invite.email, role: invite.role, workspaceId: invite.workspaceId } })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, action, userId } = body as { token: string; action: 'ACCEPT' | 'DECLINE'; userId: string }
    if (!token || !action || !userId) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

    const invite = await prisma.invitation.findUnique({ where: { token } })
    if (!invite || invite.status !== 'PENDING' || invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 })
    }

    if (action === 'DECLINE') {
      await prisma.invitation.update({ where: { token }, data: { status: 'DECLINED' } })
      return NextResponse.json({ success: true })
    }

    // ACCEPT: Add membership and mark invite accepted
    await prisma.$transaction(async (tx) => {
      // Ensure not already a member
      const existing = await tx.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId: invite.workspaceId } }
      })
      if (!existing) {
        await tx.workspaceMember.create({
          data: {
            userId,
            workspaceId: invite.workspaceId,
            role: invite.role
          }
        })
      }
      await tx.invitation.update({ where: { token }, data: { status: 'ACCEPTED' } })
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


