'use client';

import { useState } from 'react';
import { useAnalytics } from '@/hooks/useData';
import { useStore } from '@/store/useStore';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckSquare2, 
  Clock, 
  Target,
  Plus,
  ArrowUp,
  ArrowDown,
  Loader2
} from 'lucide-react';

export default function DashboardsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const { selectedWorkspace } = useStore();

  const { analytics, loading, error, refetch } = useAnalytics({
    workspaceId: selectedWorkspace?.id,
    period: selectedPeriod as '7d' | '30d' | '90d',
  });

  const getStatColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'green': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'yellow': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'purple': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatIcon = (name: string) => {
    switch (name) {
      case 'Total Tasks': return CheckSquare2;
      case 'Completed': return Target;
      case 'In Progress': return Clock;
      case 'Team Members': return Users;
      default: return CheckSquare2;
    }
  };

  const getStatColorName = (name: string) => {
    switch (name) {
      case 'Total Tasks': return 'blue';
      case 'Completed': return 'green';
      case 'In Progress': return 'yellow';
      case 'Team Members': return 'purple';
      default: return 'blue';
    }
  };

  if (!selectedWorkspace) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No workspace selected
          </h3>
          <p className="text-gray-500">
            Please select a workspace to view analytics.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load analytics</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Dashboards
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Analytics and insights for your projects
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analytics?.stats?.map((stat: any) => {
            const Icon = getStatIcon(stat.name);
            const colorName = getStatColorName(stat.name);
            
            return (
              <div
                key={stat.name}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === 'positive' ? (
                        <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : stat.changeType === 'negative' ? (
                        <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      ) : null}
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 
                        stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.change > 0 ? '+' : ''}{stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${getStatColor(colorName)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Task Completion Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Task Completion Overview
              </h3>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analytics?.completionRate || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${analytics?.completionRate || 0}%` }}
                />
              </div>
              {analytics?.overdueTasks > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-600">Overdue Tasks</span>
                  <span className="font-medium text-red-600">{analytics.overdueTasks}</span>
                </div>
              )}
            </div>
          </div>

          {/* Team Performance */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Team Performance
              </h3>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {analytics?.teamPerformance?.length > 0 ? (
                analytics.teamPerformance.map((member: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {member.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.completed}/{member.total} tasks
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${member.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.percentage}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No team member data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            {analytics?.recentActivity?.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full mt-1 ${
                      activity.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                      activity.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-600' :
                        activity.type === 'warning' ? 'bg-yellow-600' :
                        'bg-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}