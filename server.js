const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Create Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  // Create Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL 
        : "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join user to their personal room
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join workspace room
    socket.on('join-workspace', (workspaceId) => {
      socket.join(`workspace-${workspaceId}`);
      console.log(`Client joined workspace: ${workspaceId}`);
    });

    // Handle task updates
    socket.on('task-updated', (data) => {
      // Broadcast to all clients in the workspace
      socket.to(`workspace-${data.workspaceId}`).emit('task-updated', data);
      
      // If task was assigned, notify the assignee
      if (data.assigneeId) {
        socket.to(`user-${data.assigneeId}`).emit('task-assigned', {
          taskId: data.taskId,
          taskName: data.taskName,
          assignedBy: data.assignedBy
        });
      }
    });

    // Handle task creation
    socket.on('task-created', (data) => {
      socket.to(`workspace-${data.workspaceId}`).emit('task-created', data);
    });

    // Handle comments
    socket.on('comment-added', (data) => {
      socket.to(`workspace-${data.workspaceId}`).emit('comment-added', data);
      
      // Notify task assignee if different from commenter
      if (data.taskAssigneeId && data.taskAssigneeId !== data.authorId) {
        socket.to(`user-${data.taskAssigneeId}`).emit('comment-notification', {
          taskId: data.taskId,
          taskName: data.taskName,
          comment: data.comment,
          author: data.author
        });
      }
    });

    // Handle file uploads
    socket.on('file-uploaded', (data) => {
      socket.to(`workspace-${data.workspaceId}`).emit('file-uploaded', data);
    });

    // Handle task sharing
    socket.on('task-shared', (data) => {
      // Notify the user who received the share
      socket.to(`user-${data.sharedWithUserId}`).emit('task-shared', {
        taskId: data.taskId,
        taskName: data.taskName,
        sharedBy: data.sharedBy,
        permission: data.permission
      });
    });

    // Handle user typing in comments
    socket.on('typing-start', (data) => {
      socket.to(`workspace-${data.workspaceId}`).emit('user-typing', {
        taskId: data.taskId,
        userId: data.userId,
        userName: data.userName
      });
    });

    socket.on('typing-stop', (data) => {
      socket.to(`workspace-${data.workspaceId}`).emit('user-stopped-typing', {
        taskId: data.taskId,
        userId: data.userId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server running on port ${port}`);
    });
});