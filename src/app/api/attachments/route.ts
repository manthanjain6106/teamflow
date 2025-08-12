import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    // Verify user has access to the task
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          { creatorId: session.user.id },
          { assigneeId: session.user.id },
          { shares: { some: { userId: session.user.id } } }
        ]
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const attachments = await prisma.taskAttachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(attachments);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const taskId = formData.get('taskId') as string;

    if (!file || !taskId) {
      return NextResponse.json({ error: 'File and task ID required' }, { status: 400 });
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large (max 10MB)' }, { status: 400 });
    }

    // Verify user has access to the task
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          { creatorId: session.user.id },
          { assigneeId: session.user.id },
          { shares: { some: { userId: session.user.id, permission: { in: ['write', 'admin'] } } } }
        ]
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found or no permission' }, { status: 404 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;
    const filePath = join(uploadsDir, fileName);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save attachment metadata to database
    const attachment = await prisma.taskAttachment.create({
      data: {
        name: originalName,
        url: `/uploads/${fileName}`,
        size: Number(file.size),
        type: file.type,
        taskId,
        uploadedById: session.user.id,
      },
    });

    // Save version record
    await prisma.attachmentVersion.create({
      data: {
        attachmentId: attachment.id,
        url: attachment.url,
        size: attachment.size,
        type: attachment.type,
        version: 1,
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'ATTACHMENT_ADDED',
        message: `Attachment "${originalName}" was added`,
        userId: session.user.id,
        taskId,
      },
    });

    // Notify task assignee if different from uploader
    if (task.assigneeId && task.assigneeId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: 'TASK_ASSIGNED',
          title: 'New attachment added',
          message: `${session.user.name || 'Someone'} added an attachment to "${task.name}"`,
          userId: task.assigneeId,
        },
      });
    }

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get('id');

    if (!attachmentId) {
      return NextResponse.json({ error: 'Attachment ID required' }, { status: 400 });
    }

    // Verify user has permission to delete the attachment
    const attachment = await prisma.taskAttachment.findFirst({
      where: {
        id: attachmentId,
        task: {
          OR: [
            { createdById: session.user.id },
            { assigneeId: session.user.id },
            { shares: { some: { userId: session.user.id, permission: { in: ['write', 'admin'] } } } }
          ]
        }
      },
      include: {
        task: true,
      },
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found or no permission' }, { status: 404 });
    }

    // Delete attachment from database
    await prisma.taskAttachment.delete({
      where: { id: attachmentId },
    });

    // TODO: Delete file from disk (optional - could be done by a cleanup job)
    // const filePath = join(process.cwd(), 'public', attachment.fileUrl);
    // if (existsSync(filePath)) {
    //   await unlink(filePath);
    // }

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'ATTACHMENT_ADDED', // We don't have ATTACHMENT_DELETED type
        message: `Attachment "${attachment.name}" was removed`,
        userId: session.user.id,
        taskId: attachment.taskId,
      },
    });

    return NextResponse.json({ message: 'Attachment deleted' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}