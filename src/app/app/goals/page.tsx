'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useGoals } from '@/hooks/useData';
import dynamic from 'next/dynamic';
const { CreateGoalModal, EditGoalModal } = ({} as any);
// dynamic imports to avoid SSR issues
const CreateModal = dynamic(() => import('./GoalModals').then(m => m.CreateGoalModal), { ssr: false });
const EditModal = dynamic(() => import('./GoalModals').then(m => m.EditGoalModal), { ssr: false });
import { 
  Target, 
  Plus, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  BarChart3
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'COMPLETED';
  dueDate?: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    image?: string;
  };
  keyResults: KeyResult[];
  createdAt: string;
  updatedAt: string;
}

interface KeyResult {
  id: string;
  name: string;
  target: number;
  current: number;
  progress: number;
  goalId: string;
}

export default function GoalsPage() {
  const { selectedWorkspace } = useStore();
  const { goals, loading, error, refetch } = useGoals({ 
    workspaceId: selectedWorkspace?.id || '' 
  });
  
  const [filter, setFilter] = useState<'all' | 'my-goals' | 'active' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ON_TRACK':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'AT_RISK':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'OFF_TRACK':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'ON_TRACK':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'AT_RISK':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'OFF_TRACK':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-green-400';
    if (progress >= 40) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const filteredGoals = goals.filter((goal: Goal) => {
    switch (filter) {
      case 'my-goals':
        return goal.ownerId === 'current-user-id'; // Replace with actual user ID
      case 'active':
        return goal.status !== 'COMPLETED';
      case 'completed':
        return goal.status === 'COMPLETED';
      default:
        return true;
    }
  });

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowGoalModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <span>Loading goals...</span>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-3">
                <Target className="h-7 w-7 text-purple-600" />
                <span>Goals & OKRs</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track objectives and key results for your team
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Goal</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{goals.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {goals.filter((g: Goal) => g.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">At Risk</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {goals.filter((g: Goal) => g.status === 'AT_RISK').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {goals.length > 0 ? Math.round(goals.reduce((sum: number, g: Goal) => sum + g.progress, 0) / goals.length) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
            {[
              { key: 'all', label: 'All Goals' },
              { key: 'my-goals', label: 'My Goals' },
              { key: 'active', label: 'Active' },
              { key: 'completed', label: 'Completed' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === tab.key
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Goals Grid */}
        {filteredGoals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No goals yet' : `No ${filter.replace('-', ' ')} found`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by creating your first goal to track progress and achievements.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Goal</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredGoals.map((goal: Goal) => (
              <div
                key={goal.id}
                onClick={() => handleGoalClick(goal)}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all cursor-pointer group"
              >
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(goal.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.status)}`}>
                        {goal.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-opacity">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(goal.progress)}`}
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Key Results Preview */}
                {goal.keyResults && goal.keyResults.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Key Results ({goal.keyResults.length})
                    </p>
                    <div className="space-y-1">
                      {goal.keyResults.slice(0, 2).map((kr: any, i: number) => (
                        <div key={kr?.id || kr?.name || i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                            {kr.name}
                          </span>
                          <span className="text-gray-500 font-mono">
                            {kr.current}/{kr.target}
                          </span>
                        </div>
                      ))}
                      {goal.keyResults.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{goal.keyResults.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Goal Footer */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    {goal.owner?.image ? (
                      <img
                        src={goal.owner.image}
                        alt={goal.owner.name}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-500" />
                      </div>
                    )}
                    <span className="text-gray-600 dark:text-gray-400">
                      {goal.owner?.name}
                    </span>
                  </div>
                  
                  {goal.dueDate && (
                    <div className={`flex items-center space-x-1 ${
                      isOverdue(goal.dueDate) ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(goal.dueDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && selectedWorkspace?.id && (
        <CreateModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} workspaceId={selectedWorkspace.id} onCreated={refetch} />
      )}

      {showGoalModal && selectedGoal && (
        <EditModal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} goal={selectedGoal} onUpdated={refetch} />
      )}
    </div>
  );
}