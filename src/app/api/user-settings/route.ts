import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    let userSettings: any = null;
    try {
      // @ts-ignore optional model
      if (prisma.userSettings) {
        // @ts-ignore
        userSettings = await prisma.userSettings.findUnique({ where: { userId: session.user.id } });
      }
    } catch {}
    if (!userSettings) {
      try {
        const res: any = await (prisma as any).$runCommandRaw({ find: 'user_settings', filter: { userId: session.user.id }, limit: 1 });
        userSettings = res?.cursor?.firstBatch?.[0] || null;
      } catch {}
    }
    if (!userSettings) {
      userSettings = { userId: session.user.id, theme: 'system', emailNotifications: true, pushNotifications: true, taskAssigned: true, taskCompleted: false, mentions: true, dueDates: true };
    }
    return NextResponse.json(userSettings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      theme,
      language,
      timezone,
      emailNotifications,
      pushNotifications,
      taskAssigned,
      taskCompleted,
      mentions,
      dueDates,
    } = body;

    const updateData: any = {};
    if (theme !== undefined) updateData.theme = theme;
    if (language !== undefined) updateData.language = language;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications;
    if (taskAssigned !== undefined) updateData.taskAssigned = taskAssigned;
    if (taskCompleted !== undefined) updateData.taskCompleted = taskCompleted;
    if (mentions !== undefined) updateData.mentions = mentions;
    if (dueDates !== undefined) updateData.dueDates = dueDates;

    try {
      // @ts-ignore optional model
      if (prisma.userSettings) {
        // @ts-ignore
        const userSettings = await prisma.userSettings.upsert({ where: { userId: session.user.id }, update: updateData, create: { userId: session.user.id, ...updateData } });
        return NextResponse.json(userSettings);
      }
    } catch {}

    try {
      await (prisma as any).$runCommandRaw({
        update: 'user_settings',
        updates: [{ q: { userId: session.user.id }, u: { $set: { ...updateData, userId: session.user.id, updatedAt: new Date() } }, upsert: true }],
      });
    } catch (e) {
      console.error('Raw update settings failed', e);
      return NextResponse.json({ error: 'Failed to persist settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true, ...updateData });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}