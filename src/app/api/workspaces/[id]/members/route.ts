import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: workspaceId } = await context.params

    // Check if user has access to the workspace
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id
      }
    })

    if (!workspaceMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all workspace members
    const members = await prisma.workspaceMember.findMany({
      where: {
        workspaceId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        joinedAt: 'asc'
      }
    })

    // Format response to match expected structure
    const formattedMembers = members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image,
      role: member.role,
      joinedAt: member.joinedAt
    }))

    return NextResponse.json({ members: formattedMembers })
  } catch (error) {
    console.error('Error fetching workspace members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: workspaceId } = await context.params
    const { email, role = 'MEMBER' } = await request.json()

    // Check if user has admin access to the workspace
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
        role: {
          in: ['OWNER', 'ADMIN']
        }
      }
    })

    if (!workspaceMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find user by email
    const userToInvite = await prisma.user.findUnique({ where: { email } })

    if (!userToInvite) {
      // Create invitation if user does not exist
      const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days

      if ((prisma as any).invitation?.create) {
        await (prisma as any).invitation.create({
          data: {
            email,
            role,
            token,
            expiresAt,
            invitedById: session.user.id,
            workspaceId
          }
        })
      } else {
        // Fallback for environments where Prisma client didn't regenerate (e.g., OneDrive EPERM).
        // Use MongoDB raw insert. Prisma still enforces the unique index server-side.
        await prisma.$runCommandRaw({
          insert: 'invitations',
          documents: [{
            email,
            role,
            token,
            status: 'PENDING',
            createdAt: new Date(),
            expiresAt,
            invitedById: { $oid: session.user.id },
            workspaceId: { $oid: workspaceId }
          }],
          ordered: true
        } as any)
      }

      // TODO: Send email via SMTP provider. For now, log link to console.
      const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/invite?token=${token}`
      try {
        const { sendInviteEmail } = await import('@/lib/mailer')
        await sendInviteEmail(email, inviteUrl)
      } catch (e) {
        console.log('Invitation link:', inviteUrl)
      }

      return NextResponse.json({
        invitation: { email, role, expiresAt, inviteUrl }
      })
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: userToInvite.id
        }
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member' },
        { status: 409 }
      )
    }

    // Add user to workspace
    const newMember = await prisma.workspaceMember.create({
      data: {
        userId: userToInvite.id,
        workspaceId,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      member: {
        id: newMember.user.id,
        name: newMember.user.name,
        email: newMember.user.email,
        image: newMember.user.image,
        role: newMember.role,
        joinedAt: newMember.joinedAt
      }
    })
  } catch (error) {
    console.error('Error inviting workspace member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: workspaceId } = await context.params
    const { userId, role } = await request.json() as { userId: string; role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST' }
    if (!userId || !role) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

    // Only OWNER/ADMIN can update roles
    const actor = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: session.user.id, role: { in: ['OWNER', 'ADMIN'] } }
    })
    if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId } },
      data: { role }
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: workspaceId } = await context.params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Only OWNER/ADMIN can remove members
    const actor = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: session.user.id, role: { in: ['OWNER', 'ADMIN'] } }
    })
    if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.workspaceMember.delete({ where: { workspaceId_userId: { workspaceId, userId } } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}