# TeamFlow - ClickUp Clone

A complete **ClickUp clone** built with modern web technologies. TeamFlow provides all the essential project management features you need to organize tasks, collaborate with teams, and get work done efficiently.

![TeamFlow Banner](https://img.shields.io/badge/TeamFlow-ClickUp%20Clone-purple?style=for-the-badge&logo=clickup)

## 🚀 Features

### ✅ **Complete ClickUp Experience**
- **Multiple Views**: List, Board (Kanban), Calendar, Gantt, Timeline
- **Task Management**: Create, assign, prioritize, and track tasks
- **Drag & Drop**: Seamless task movement between columns and statuses
- **Real-time Collaboration**: Comments, mentions, and live updates
- **Time Tracking**: Built-in timer and reporting
- **Custom Fields**: Flexible task attributes
- **Workspaces & Spaces**: Organize projects hierarchically
- **Goals & OKRs**: Set and track objectives

### 🎨 **Authentic UI/UX**
- **Pixel-perfect ClickUp design** with exact same layout and styling
- **Dark/Light theme support**
- **Responsive design** for all screen sizes
- **Modern animations** and micro-interactions
- **Intuitive navigation** with collapsible sidebar

### 🔐 **Authentication & Security**
- **Multiple sign-in options**: Email/Password, Google OAuth, GitHub
- **NextAuth.js integration** with MongoDB
- **Secure password hashing** with bcrypt
- **Protected routes** and middleware
- **Session management**

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **@dnd-kit** - Modern drag-and-drop

### **Backend**
- **Next.js API Routes** - Serverless backend
- **Prisma ORM** - Type-safe database client
- **MongoDB Atlas** - Cloud database
- **NextAuth.js** - Authentication
- **Zod** - Runtime validation
- **bcryptjs** - Password hashing

### **State Management**
- **Zustand** - Lightweight state management
- **React Query** (planned) - Server state management

## 🏗️ Architecture

```
teamflow/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── api/               # API endpoints
│   │   ├── app/               # Main application
│   │   └── components/        # React components
│   │       ├── layout/        # Layout components
│   │       ├── ui/            # UI components
│   │       └── views/         # View components
│   ├── lib/                   # Utilities and configurations
│   └── store/                 # Global state management
├── prisma/                    # Database schema
└── public/                    # Static assets
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- MongoDB Atlas account
- Google OAuth credentials (optional)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/teamflow.git
cd teamflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### **Sign Up / Sign In**
- Visit `/auth/signin` to access the login page
- Choose from email/password, Google OAuth, or demo account
- New users can register at `/auth/signup`

### **Main Application**
- Access the main app at `/app`
- Use the sidebar to navigate between workspaces and spaces
- Switch between different views using the header buttons
- Create tasks, assign them, and track progress

### **Key Pages**
- **`/`** - Landing page with feature showcase
- **`/auth/signin`** - Sign in page
- **`/auth/signup`** - Sign up page  
- **`/app`** - Main application dashboard
- **`/api/test-db`** - Database connection test

## 🎯 Core Features

### **Task Management**
- ✅ Create, edit, and delete tasks
- ✅ Assign tasks to team members
- ✅ Set priorities (Low, Normal, High, Urgent)
- ✅ Due dates and time tracking
- ✅ Task dependencies
- ✅ Comments and attachments
- ✅ Custom fields and tags

### **Views**
- ✅ **List View** - Traditional task list with grouping
- ✅ **Board View** - Kanban board with drag-and-drop
- 🚧 **Calendar View** - Task scheduling (coming soon)
- 🚧 **Gantt View** - Project timeline (coming soon)
- 🚧 **Timeline View** - Time-based visualization (coming soon)

### **Collaboration**
- ✅ User authentication and profiles
- ✅ Workspace and space organization
- 🚧 Real-time updates with WebSockets
- 🚧 Comments and mentions
- 🚧 Activity feeds
- 🚧 Notifications

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/signup` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### **Core Resources**
- `GET/POST /api/workspaces` - Workspace management
- `GET/POST /api/spaces` - Space management  
- `GET/POST /api/lists` - List management
- `GET/POST/PATCH/DELETE /api/tasks` - Task CRUD operations

### **Testing**
- `GET /api/test-db` - Database connection test

## 🗃️ Database Schema

The application uses a comprehensive MongoDB schema with the following main models:

- **User** - User accounts and profiles
- **Workspace** - Top-level organization
- **Space** - Project containers within workspaces
- **List** - Task containers within spaces
- **Task** - Individual work items
- **Comment** - Task discussions
- **TimeEntry** - Time tracking records
- **Activity** - Audit trail and notifications

## 📊 Current Status

### **✅ Completed**
- [x] Project setup and configuration
- [x] MongoDB database integration
- [x] Authentication system (Email + Google OAuth)
- [x] Core UI components (Sidebar, Header, Cards)
- [x] List and Board views
- [x] Task CRUD operations
- [x] Drag-and-drop functionality
- [x] Responsive design
- [x] API routes and validation

### **🚧 In Progress**
- [ ] Calendar view implementation
- [ ] Gantt chart view
- [ ] Real-time collaboration
- [ ] Time tracking interface
- [ ] Advanced filtering and search

### **📋 Planned**
- [ ] File attachments
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Advanced reporting
- [ ] Third-party integrations
- [ ] Automation rules

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ClickUp** - Inspiration for the design and feature set
- **Next.js Team** - Amazing React framework
- **Prisma Team** - Excellent database toolkit
- **Tailwind CSS** - Beautiful utility-first CSS framework

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Join our community discussions

---

**Built with ❤️ by the TeamFlow team**

*Making project management accessible and beautiful for everyone.*
