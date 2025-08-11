import Link from 'next/link';
import { 
  CheckSquare2, 
  BarChart3, 
  Users, 
  Calendar,
  Target,
  Zap,
  ArrowRight,
  Star,
  Clock,
  MessageSquare
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">TeamFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/signin"
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/app"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            The Ultimate
            <span className="text-purple-600 block mt-2">Project Management</span>
            Experience
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            TeamFlow is a complete ClickUp clone with all the features you need to manage projects, 
            collaborate with teams, and get work done efficiently.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Link
              href="/app"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2"
            >
              <span>Start for Free</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            {/* Demo CTA removed for production */}
          </div>

          {/* Demo Preview */}
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ml-4 text-sm text-gray-600 dark:text-gray-300">TeamFlow App</span>
              </div>
              <div className="h-96 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <CheckSquare2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Full ClickUp Experience
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete with Lists, Boards, Calendar, Gantt charts and more
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything ClickUp Has, We Have
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Built with modern technologies for the best performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <CheckSquare2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Task Management</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create, assign, and track tasks with priorities, due dates, and custom fields.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Multiple Views</h3>
            <p className="text-gray-600 dark:text-gray-300">
              List, Board, Calendar, Gantt, and Timeline views for different perspectives.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Team Collaboration</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time collaboration with comments, mentions, and file sharing.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Time Tracking</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Built-in time tracking with reporting and analytics for better productivity.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Goals & OKRs</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Set and track goals with automated progress tracking and reporting.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Automation</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Automate repetitive tasks and workflows to save time and reduce errors.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="container mx-auto px-6 py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl my-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Built with Modern Technologies
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Using the same tech stack as the best companies
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">N</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Next.js 15</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">React Framework</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-500">TS</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">TypeScript</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Type Safety</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-cyan-500">TW</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Tailwind CSS</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Styling</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">P</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Prisma</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Database ORM</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience the Future of Project Management?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teams already using TeamFlow to get work done.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors space-x-2"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">TeamFlow</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2024 TeamFlow. A complete ClickUp clone.
          </p>
        </div>
      </footer>
    </div>
  );
}
