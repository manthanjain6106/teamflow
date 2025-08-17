import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckSquare2,
  MessageSquare,
  Star,
  Target,
  Users,
  Zap,
  Clock,
  Brain,
  LayoutDashboard,
  FileText,
  KanbanSquare,
  ClipboardList,
  Shapes,
  Flag,
  Search,
  Sparkles,
  ShieldCheck,
  Rocket,
  Play,
  TrendingUp,
  Globe,
  ChevronRight,
  Award,
  Infinity,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Animated mesh background */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf6_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf6_1px,transparent_1px)] bg-[size:14px_24px] opacity-[0.02] dark:opacity-[0.05]" />
        <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-br from-transparent via-purple-50/50 to-transparent dark:from-transparent dark:via-purple-950/20 dark:to-transparent" />
      </div>
      {/* Enhanced decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[800px] w-[1200px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-200/30 via-purple-200/30 via-fuchsia-200/30 to-blue-200/30 blur-3xl dark:from-violet-800/10 dark:via-purple-800/10 dark:via-fuchsia-800/10 dark:to-blue-800/10" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 blur-3xl dark:from-emerald-800/10 dark:to-cyan-800/10" />
        <div className="absolute -left-40 bottom-1/3 h-80 w-80 rounded-full bg-gradient-to-tr from-rose-200/20 to-orange-200/20 blur-3xl dark:from-rose-800/10 dark:to-orange-800/10" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-gradient-to-tr from-indigo-200/25 to-purple-200/25 blur-3xl dark:from-indigo-800/10 dark:to-purple-800/10" />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.05]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Enhanced navigation */}
      <nav className="container mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 opacity-20 blur-sm"></div>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-blue-600 text-white shadow-lg">
              <span className="text-lg font-bold">T</span>
            </div>
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">TeamFlow</span>
            <div className="text-xs font-medium text-purple-600 dark:text-purple-400">Everything workspace</div>
          </div>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="relative text-sm font-medium text-gray-600 transition-all duration-200 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-purple-600 after:to-fuchsia-600 after:transition-all after:duration-200 hover:after:w-full">Features</a>
          <a href="#preview" className="relative text-sm font-medium text-gray-600 transition-all duration-200 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-purple-600 after:to-fuchsia-600 after:transition-all after:duration-200 hover:after:w-full">Product</a>
          <a href="#testimonials" className="relative text-sm font-medium text-gray-600 transition-all duration-200 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-purple-600 after:to-fuchsia-600 after:transition-all after:duration-200 hover:after:w-full">Customers</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/signin" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-white/60 hover:backdrop-blur-sm dark:text-gray-200 dark:hover:bg-gray-800/60">Sign in</Link>
          <Link href="/auth/signup" className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25">
            <span className="relative z-10 flex items-center gap-2">
              Get started
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-fuchsia-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </Link>
        </div>
      </nav>

      {/* Enhanced Hero */}
      <section className="container mx-auto px-6 pb-16 pt-16 md:pb-24 md:pt-20 lg:pt-32">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
              <Sparkles className="h-4 w-4" />
              New: AI-powered workspace
            </div>
            <h1 className="mt-6 text-balance text-5xl font-black leading-[1.1] tracking-tight text-gray-900 dark:text-white md:text-7xl">
              Work flows
              <span className="relative block">
                <span className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 bg-clip-text text-transparent animate-pulse">beautifully here</span>
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-blue-600/20 blur-2xl opacity-50 animate-pulse" />
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
              The workspace that adapts to you. Plan projects, write docs, track goals, and collaborate in real-time—all with AI assistance.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/auth/signup" className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-500 hover:shadow-purple-500/40 hover:scale-[1.02] hover:-translate-y-1">
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Start free today
                  <ArrowRight className="h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-fuchsia-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-60"></div>
              </Link>
              <Link href="/app" className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white/80 px-8 py-4 text-lg font-semibold text-gray-900 backdrop-blur-sm transition-all duration-300 hover:border-purple-300 hover:bg-white hover:shadow-xl hover:scale-[1.02] dark:border-gray-700 dark:bg-gray-800/80 dark:text-white dark:hover:border-purple-600 dark:hover:bg-gray-800">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-purple-900/20 dark:to-blue-900/20"></div>
                <Play className="relative z-10 h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-600" />
                <span className="relative z-10">Watch demo</span>
              </Link>
            </div>
            <div className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">✨ Free forever • No credit card required</div>
            
            {/* Enhanced feature pills with hover effects */}
            <div className="mt-12 flex flex-wrap gap-3">
              <div className="group inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 backdrop-blur-sm transition-all duration-300 hover:bg-purple-50 hover:ring-purple-200 hover:scale-105 hover:shadow-md dark:bg-gray-800/80 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-purple-900/20 dark:hover:ring-purple-700">
                <CheckSquare2 className="h-4 w-4 text-purple-600 transition-transform duration-300 group-hover:scale-110" /> Smart Tasks
              </div>
              <div className="group inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 backdrop-blur-sm transition-all duration-300 hover:bg-blue-50 hover:ring-blue-200 hover:scale-105 hover:shadow-md dark:bg-gray-800/80 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-blue-900/20 dark:hover:ring-blue-700">
                <FileText className="h-4 w-4 text-blue-600 transition-transform duration-300 group-hover:scale-110" /> Rich Docs
              </div>
              <div className="group inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 backdrop-blur-sm transition-all duration-300 hover:bg-fuchsia-50 hover:ring-fuchsia-200 hover:scale-105 hover:shadow-md dark:bg-gray-800/80 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-fuchsia-900/20 dark:hover:ring-fuchsia-700">
                <Brain className="h-4 w-4 text-fuchsia-600 transition-transform duration-300 group-hover:scale-110" /> AI Assistant
              </div>
              <div className="group inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 backdrop-blur-sm transition-all duration-300 hover:bg-emerald-50 hover:ring-emerald-200 hover:scale-105 hover:shadow-md dark:bg-gray-800/80 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-emerald-900/20 dark:hover:ring-emerald-700">
                <TrendingUp className="h-4 w-4 text-emerald-600 transition-transform duration-300 group-hover:scale-110" /> Analytics
              </div>
            </div>
            
            {/* Enhanced stats with animations */}
            <div className="mt-16 grid max-w-2xl grid-cols-3 gap-6">
              <div className="group relative overflow-hidden rounded-2xl bg-white/60 p-6 text-center shadow-lg ring-1 ring-gray-200 backdrop-blur-sm transition-all duration-500 hover:bg-white/80 hover:shadow-xl hover:scale-105 hover:-translate-y-1 dark:bg-gray-800/60 dark:ring-gray-700 dark:hover:bg-gray-800/80">
                <div className="text-3xl font-black text-gray-900 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">50k+</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Teams trust us</div>
                <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-gradient-to-br from-purple-400/20 to-blue-400/20 blur-xl transition-all duration-500 group-hover:scale-125 group-hover:from-purple-400/30 group-hover:to-blue-400/30"></div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50/0 to-blue-50/0 transition-all duration-300 group-hover:from-purple-50/50 group-hover:to-blue-50/50 dark:from-purple-900/0 dark:to-blue-900/0 dark:group-hover:from-purple-900/20 dark:group-hover:to-blue-900/20"></div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl bg-white/60 p-6 text-center shadow-lg ring-1 ring-gray-200 backdrop-blur-sm transition-all duration-500 hover:bg-white/80 hover:shadow-xl hover:scale-105 hover:-translate-y-1 dark:bg-gray-800/60 dark:ring-gray-700 dark:hover:bg-gray-800/80">
                <div className="text-3xl font-black text-gray-900 transition-all duration-300 group-hover:scale-110 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">99.9%</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime SLA</div>
                <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 blur-xl transition-all duration-500 group-hover:scale-125 group-hover:from-emerald-400/30 group-hover:to-cyan-400/30"></div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50/0 to-cyan-50/0 transition-all duration-300 group-hover:from-emerald-50/50 group-hover:to-cyan-50/50 dark:from-emerald-900/0 dark:to-cyan-900/0 dark:group-hover:from-emerald-900/20 dark:group-hover:to-cyan-900/20"></div>
              </div>
              <div className="group relative overflow-hidden rounded-2xl bg-white/60 p-6 text-center shadow-lg ring-1 ring-gray-200 backdrop-blur-sm transition-all duration-500 hover:bg-white/80 hover:shadow-xl hover:scale-105 hover:-translate-y-1 dark:bg-gray-800/60 dark:ring-gray-700 dark:hover:bg-gray-800/80">
                <div className="text-3xl font-black text-gray-900 transition-all duration-300 group-hover:scale-110 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">2x</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Faster delivery</div>
                <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-gradient-to-br from-rose-400/20 to-orange-400/20 blur-xl transition-all duration-500 group-hover:scale-125 group-hover:from-rose-400/30 group-hover:to-orange-400/30"></div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-50/0 to-orange-50/0 transition-all duration-300 group-hover:from-rose-50/50 group-hover:to-orange-50/50 dark:from-rose-900/0 dark:to-orange-900/0 dark:group-hover:from-rose-900/20 dark:group-hover:to-orange-900/20"></div>
              </div>
            </div>
          </div>
          
          <div id="preview" className="lg:col-span-6">
            <div className="relative group">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 opacity-20 blur-2xl transition-all duration-700 group-hover:opacity-30 group-hover:scale-105" />
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-purple-400/10 via-fuchsia-400/10 to-blue-400/10 blur-xl transition-all duration-500 group-hover:scale-110" />
              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl transition-all duration-500 group-hover:shadow-purple-500/20 group-hover:scale-[1.02] dark:border-gray-700/50 dark:bg-gray-800/80">
                <div className="flex items-center gap-2 border-b border-gray-200/50 bg-gray-50/80 px-6 py-4 dark:border-gray-700/50 dark:bg-gray-800/80">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500 transition-all duration-300 group-hover:scale-110"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500 transition-all duration-300 group-hover:scale-110"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500 transition-all duration-300 group-hover:scale-110"></div>
                  </div>
                  <div className="ml-4 text-sm font-medium text-gray-600 dark:text-gray-300">TeamFlow Workspace</div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
                  </div>
                </div>
                <div className="h-[500px] p-6">
                  <div className="mb-6 flex gap-2">
                    <div className="rounded-lg bg-purple-100 px-3 py-1.5 text-sm font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">List</div>
                    <div className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">Board</div>
                    <div className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">Calendar</div>
                    <div className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">Gantt</div>
                  </div>
                  <div className="space-y-3">
                    <TaskPreview title="Design new landing page" status="In Progress" priority="High" />
                    <TaskPreview title="Implement user authentication" status="Todo" priority="Medium" />
                    <TaskPreview title="Set up CI/CD pipeline" status="Done" priority="Low" />
                  </div>
                  <div className="mt-8 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 p-6 text-center dark:from-purple-900/20 dark:to-blue-900/20">
                    <Brain className="mx-auto h-8 w-8 text-purple-600" />
                    <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">AI-powered insights</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Get smart suggestions and automate routine tasks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="container mx-auto px-6 pb-12">
        <div className="mx-auto max-w-5xl text-center text-sm font-semibold text-gray-500 dark:text-gray-400">Trusted by fast‑moving teams worldwide</div>
        <div className="mx-auto mt-8 grid max-w-6xl grid-cols-2 items-center gap-8 opacity-60 sm:grid-cols-3 md:grid-cols-6">
          <div className="text-center text-lg font-bold text-gray-400">Acme</div>
          <div className="text-center text-lg font-bold text-gray-400">Globex</div>
          <div className="text-center text-lg font-bold text-gray-400">Umbrella</div>
          <div className="text-center text-lg font-bold text-gray-400">Initech</div>
          <div className="text-center text-lg font-bold text-gray-400">Stark</div>
          <div className="text-center text-lg font-bold text-gray-400">Datadog</div>
        </div>
      </section>

      {/* Problem/Solution narrative */}
      <section className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div className="space-y-8">
              <div>
                <h3 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Work feels scattered</h3>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Jumping between 10+ tools kills focus. Important updates get lost. Teams work in silos.</p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>Context switching wastes 2.5 hours daily</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>Knowledge trapped in different systems</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span>Teams lose alignment and momentum</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">We bring it together</h3>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">One workspace where everything clicks. Tasks, docs, goals, and conversations unified with AI assistance.</p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span>Single source of truth for all work</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span>AI helps you stay focused and productive</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span>Real-time collaboration that just works</span>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/auth/signup" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg">
                    Try it now
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">Everything you need. Nothing you don't.</h2>
          <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">Powerful features designed for modern teams who value simplicity and speed.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <EnhancedFeatureCard 
            icon={<CheckSquare2 className="h-8 w-8 text-purple-600" />} 
            title="Smart task management" 
            description="Intelligent prioritization, custom fields, and automated workflows that adapt to your team's needs."
            gradient="from-purple-500/10 to-fuchsia-500/10"
          />
          <EnhancedFeatureCard 
            icon={<LayoutDashboard className="h-8 w-8 text-blue-600" />} 
            title="Multiple perspectives" 
            description="Switch between List, Board, Calendar, Gantt, and Timeline views without losing context or data."
            gradient="from-blue-500/10 to-cyan-500/10"
          />
          <EnhancedFeatureCard 
            icon={<Brain className="h-8 w-8 text-fuchsia-600" />} 
            title="AI-powered insights" 
            description="Get smart suggestions, automated summaries, and predictive analytics to stay ahead."
            gradient="from-fuchsia-500/10 to-pink-500/10"
          />
          <EnhancedFeatureCard 
            icon={<FileText className="h-8 w-8 text-emerald-600" />} 
            title="Rich documentation" 
            description="Create beautiful docs with real-time collaboration, version history, and seamless task integration."
            gradient="from-emerald-500/10 to-teal-500/10"
          />
          <EnhancedFeatureCard 
            icon={<TrendingUp className="h-8 w-8 text-orange-600" />} 
            title="Advanced analytics" 
            description="Track team performance, project health, and resource allocation with actionable insights."
            gradient="from-orange-500/10 to-red-500/10"
          />
          <EnhancedFeatureCard 
            icon={<Zap className="h-8 w-8 text-indigo-600" />} 
            title="Workflow automation" 
            description="Automate repetitive tasks and create custom workflows that scale with your team."
            gradient="from-indigo-500/10 to-purple-500/10"
          />
        </div>
      </section>

      {/* AI Features Spotlight */}
      <section className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-8 transition-all duration-300 hover:shadow-2xl dark:border-gray-700 dark:from-purple-900/20 dark:to-fuchsia-900/20">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-400/20 to-fuchsia-400/20 blur-2xl transition-all duration-300 group-hover:scale-110"></div>
              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  <Sparkles className="h-4 w-4" />
                  AI Assistant
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Your intelligent work companion</h3>
                <p className="mt-3 text-gray-600 dark:text-gray-300">Get instant answers, generate content, and automate routine tasks with our advanced AI that understands your workflow.</p>
                <div className="mt-6 rounded-2xl bg-white/60 p-4 backdrop-blur-sm dark:bg-gray-800/60">
                  <div className="text-sm text-gray-500 dark:text-gray-400">💬 "Summarize this week's progress"</div>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">✨ Your team completed 23 tasks, with design work ahead of schedule and 2 blockers resolved...</div>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 transition-all duration-300 hover:shadow-2xl dark:border-gray-700 dark:from-blue-900/20 dark:to-cyan-900/20">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 blur-2xl transition-all duration-300 group-hover:scale-110"></div>
              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  <Search className="h-4 w-4" />
                  Universal Search
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Find anything, instantly</h3>
                <p className="mt-3 text-gray-600 dark:text-gray-300">Search across all your tasks, docs, and conversations with AI-powered suggestions and smart filters.</p>
                <div className="mt-6 rounded-2xl bg-white/60 p-4 backdrop-blur-sm dark:bg-gray-800/60">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Search className="h-4 w-4" />
                    "marketing campaign Q1"
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div>📋 Q1 Marketing Strategy (Doc)</div>
                    <div>✅ Launch campaign assets (Task)</div>
                    <div>💬 Campaign review meeting (Comment)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section className="container mx-auto px-6 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 text-center md:grid-cols-3">
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/60 p-6 backdrop-blur-sm dark:bg-gray-800/60">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Enterprise Security</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">SOC 2 & GDPR compliant</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/60 p-6 backdrop-blur-sm dark:bg-gray-800/60">
            <Rocket className="h-6 w-6 text-purple-600" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Always Improving</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Weekly feature updates</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/60 p-6 backdrop-blur-sm dark:bg-gray-800/60">
            <Award className="h-6 w-6 text-blue-600" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">99.9% Uptime</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Reliable & fast globally</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container mx-auto px-6 py-24">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h3 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Loved by teams worldwide</h3>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">See what people are saying about their TeamFlow experience.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <EnhancedTestimonialCard 
            name="Sarah Chen" 
            role="Product Manager at TechCorp" 
            text="TeamFlow transformed how our team collaborates. We ship features 40% faster now." 
            avatar="SC"
          />
          <EnhancedTestimonialCard 
            name="Marcus Rodriguez" 
            role="CEO at StartupX" 
            text="Finally, a workspace that doesn't fight against how we actually work. Game changer." 
            avatar="MR"
          />
          <EnhancedTestimonialCard 
            name="Emma Thompson" 
            role="Design Lead at CreativeStudio" 
            text="The AI suggestions are incredibly smart. It's like having a productivity coach built-in." 
            avatar="ET"
          />
        </div>
      </section>

      {/* Final CTA with enhanced animations */}
      <section className="container mx-auto px-6 pb-24">
        <div className="group relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 p-12 text-white shadow-2xl transition-all duration-700 hover:shadow-purple-500/30 md:p-16">
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Limited time: Free Pro features for 3 months
            </div>
            <h3 className="text-4xl font-black transition-all duration-500 group-hover:scale-105 md:text-6xl">Ready to transform your workflow?</h3>
            <p className="mt-6 text-xl opacity-90 transition-all duration-300 group-hover:opacity-100">Join thousands of teams who've already made the switch to smarter work.</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/signup" className="group/btn relative overflow-hidden rounded-2xl bg-white px-8 py-4 text-lg font-bold text-gray-900 shadow-2xl transition-all duration-500 hover:bg-gray-50 hover:shadow-white/20 hover:scale-105 hover:-translate-y-1">
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Start free today
                  <ArrowRight className="h-5 w-5 transition-all duration-300 group-hover/btn:translate-x-1 group-hover/btn:scale-110" />
                </span>
                <div className="absolute -inset-1 rounded-2xl bg-white opacity-0 blur-xl transition-opacity duration-300 group-hover/btn:opacity-50"></div>
              </Link>
              <Link href="/auth/signin" className="group/btn inline-flex items-center justify-center gap-3 rounded-2xl bg-white/10 px-8 py-4 text-lg font-semibold text-white ring-2 ring-white/30 backdrop-blur transition-all duration-300 hover:bg-white/20 hover:scale-105">
                Sign in
                <ChevronRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
            </div>
            <div className="mt-6 text-sm opacity-75 transition-all duration-300 group-hover:opacity-90">✨ No setup required • Cancel anytime • 24/7 support</div>
          </div>
          
          {/* Enhanced floating elements */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:bg-white/15"></div>
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:bg-white/15"></div>
          <div className="pointer-events-none absolute right-10 top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl transition-all duration-1000 group-hover:scale-150"></div>
          <div className="pointer-events-none absolute bottom-10 left-10 h-24 w-24 rounded-full bg-white/5 blur-2xl transition-all duration-1000 group-hover:scale-150"></div>
          
          {/* Floating icons */}
          <div className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 opacity-20 transition-all duration-700 group-hover:opacity-40 group-hover:scale-110">
            <CheckSquare2 className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="pointer-events-none absolute right-8 top-1/3 opacity-20 transition-all duration-700 group-hover:opacity-40 group-hover:scale-110">
            <Brain className="h-8 w-8 text-white animate-pulse" style={{animationDelay: '0.5s'}} />
          </div>
          <div className="pointer-events-none absolute right-16 bottom-1/4 opacity-20 transition-all duration-700 group-hover:opacity-40 group-hover:scale-110">
            <Zap className="h-8 w-8 text-white animate-pulse" style={{animationDelay: '1s'}} />
          </div>
        </div>
      </section>

      {/* Floating scroll indicator */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="group relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-70 blur-sm transition-all duration-300 group-hover:opacity-100"></div>
          <button className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg backdrop-blur transition-all duration-300 hover:scale-110 dark:bg-gray-800">
            <ArrowRight className="h-5 w-5 -rotate-90 text-gray-600 transition-colors group-hover:text-purple-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="border-t border-gray-200/50 bg-white/80 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white">
                  <span className="text-sm font-bold">T</span>
                </div>
                <span className="text-lg font-black text-gray-900 dark:text-white">TeamFlow</span>
              </div>
              <p className="mt-4 max-w-sm text-sm text-gray-600 dark:text-gray-400">
                The modern workspace where teams plan, create, and ship their best work together.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 md:col-span-3 md:grid-cols-3">
              <FooterCol title="Product" links={[['Features','#features'],['Pricing','#'],['Security','#'],['API','#']]} />
              <FooterCol title="Company" links={[['About','#'],['Careers','#'],['Blog','#'],['Contact','#']]} />
              <FooterCol title="Resources" links={[['Help Center','#'],['Community','#'],['Status','#'],['Changelog','#']]} />
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
            © 2024 TeamFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Enhanced components
type EnhancedFeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
};

function EnhancedFeatureCard({ icon, title, description, gradient }: EnhancedFeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900">
      <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} blur-2xl transition-all duration-300 group-hover:scale-110`}></div>
      <div className="relative">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 ring-1 ring-gray-200 transition-all duration-300 group-hover:scale-105 group-hover:ring-purple-200 dark:bg-gray-800 dark:ring-gray-700">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-3 text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

type EnhancedTestimonialCardProps = {
  name: string;
  role: string;
  text: string;
  avatar: string;
};

function EnhancedTestimonialCard({ name, role, text, avatar }: EnhancedTestimonialCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-6 flex items-center gap-1 text-yellow-500">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <p className="text-gray-700 dark:text-gray-300">"{text}"</p>
      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 text-sm font-bold text-white">
          {avatar}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{role}</div>
        </div>
      </div>
    </div>
  );
}

type FooterColProps = {
  title: string;
  links: Array<[string, string]>;
};

function FooterCol({ title, links }: FooterColProps) {
  return (
    <div>
      <div className="font-semibold text-gray-900 dark:text-white">{title}</div>
      <ul className="mt-4 space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

type TaskPreviewProps = {
  title: string;
  status: string;
  priority: string;
};

function TaskPreview({ title, status, priority }: TaskPreviewProps) {
  const statusColors = {
    'Todo': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Done': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  };
  
  const priorityColors = {
    'High': 'bg-red-500',
    'Medium': 'bg-yellow-500',
    'Low': 'bg-green-500'
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-gray-800/80">
      <div className={`h-2 w-2 rounded-full ${priorityColors[priority as keyof typeof priorityColors]}`}></div>
      <div className="flex-1">
        <div className="font-medium text-gray-900 dark:text-white">{title}</div>
        <div className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
          {status}
        </div>
      </div>
      <CheckSquare2 className="h-4 w-4 text-gray-400" />
    </div>
  );
}