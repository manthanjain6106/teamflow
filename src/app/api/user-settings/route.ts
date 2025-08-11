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
    type UserSettings = {
      userId: string;
      theme?: 'light' | 'dark' | 'system';
      language?: string | null;
      timezone?: string | null;
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      taskAssigned?: boolean;
      taskCompleted?: boolean;
      mentions?: boolean;
      dueDates?: boolean;
      updatedAt?: Date;
    } | null;
    let userSettings: UserSettings = null;
    try {
      if ((prisma as unknown as { userSettings?: { findUnique: (args: unknown) => Promise<UserSettings> } }).userSettings) {
        const client = prisma as unknown as { userSettings: { findUnique: (args: { where: { userId: string } }) => Promise<UserSettings> } };
        userSettings = await client.userSettings.findUnique({ where: { userId: session.user.id } });
      }
    } catch {}
    if (!userSettings) {
      try {
        const resUnknown: unknown = await (prisma as unknown as { $runCommandRaw: (cmd: unknown) => Promise<unknown> }).$runCommandRaw({ find: 'user_settings', filter: { userId: session.user.id }, limit: 1 });
        const doc = (resUnknown as { cursor?: { firstBatch?: UserSettings[] } })?.cursor?.firstBatch?.[0] ?? null;
        userSettings = doc;
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
    } = body as Partial<NonNullable<UserSettings>>;

    const updateData: Record<string, unknown> = {};
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
      if ((prisma as unknown as { userSettings?: { upsert: (args: unknown) => Promise<unknown> } }).userSettings) {
        const client = prisma as unknown as { userSettings: { upsert: (args: { where: { userId: string }, update: Record<string, unknown>, create: Record<string, unknown> & { userId: string } }) => Promise<unknown> } };
        const userSettings = await client.userSettings.upsert({ where: { userId: session.user.id }, update: updateData, create: { userId: session.user.id, ...updateData } });
        return NextResponse.json(userSettings);
      }
    } catch {}

    try {
      await (prisma as unknown as { $runCommandRaw: (cmd: unknown) => Promise<unknown> }).$runCommandRaw({
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