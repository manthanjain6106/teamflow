'use client';

import { useState } from 'react';
import { useGoals } from '@/hooks/useData';
import { useStore } from '@/store/useStore';
import { createGoal, updateGoal, deleteGoal } from '@/lib/api';
import { Target, Plus, Calendar, TrendingUp, Users, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState('current');
  const { selectedWorkspace } = useStore();

  const { goals, loading, error, refetch } = useGoals({
    workspaceId: selectedWorkspace?.id,
    status: activeTab === 'current' ? undefined : activeTab.toUpperCase(),
  });

  const handleCreateGoal = async () => {
    if (!selectedWorkspace?.id) return;
    
    const title = prompt('Enter goal title:');
    if (!title) return;

    try {
      await createGoal({
        title,
        description: '',
        workspaceId: selectedWorkspace.id,
        keyResults: [
          { name: 'Key Result 1', target: 100, current: 0 },
        ],
      });
      refetch();
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleUpdateGoalProgress = async (goalId: string, progress: number) => {
    try {
      await updateGoal({ id: goalId, progress });
      refetch();
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'AT_RISK': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'OFF_TRACK': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'COMPLETED': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return <CheckCircle2 className="h-4 w-4" />;
      case 'AT_RISK': return <AlertCircle className="h-4 w-4" />;
      case 'OFF_TRACK': return <AlertCircle className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatStatusName = (status: string) => {
    switch (status) {
      case 'ON_TRACK': return 'On Track';
      case 'AT_RISK': return 'At Risk';
      case 'OFF_TRACK': return 'Off Track';
      case 'COMPLETED': return 'Completed';
      default: return status;
    }
  };

  if (!selectedWorkspace) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No workspace selected
          </h3>
          <p className="text-gray-500">
            Please select a workspace to view goals.
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
          <span>Loading goals...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load goals</p>
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

  const currentGoals = goals.filter((goal: any) => goal.status !== 'COMPLETED');
  const completedGoals = goals.filter((goal: any) => goal.status === 'COMPLETED');

  const displayGoals = activeTab === 'completed' ? completedGoals : currentGoals;

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Goals
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track and manage your objectives and key results (OKRs)
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleCreateGoal}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Goal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('current')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'current'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Current Goals
              <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                {currentGoals.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Completed
              <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                {completedGoals.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Goals List */}
        {displayGoals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No {activeTab} goals
            </h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'completed' 
                ? "You haven't completed any goals yet." 
                : "Create your first goal to get started."}
            </p>
            {activeTab === 'current' && (
              <button
                onClick={handleCreateGoal}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create Goal
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {displayGoals.map((goal: any) => (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {goal.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                        {getStatusIcon(goal.status)}
                        <span className="ml-1">{formatStatusName(goal.status)}</span>
                      </span>
                    </div>
                    {goal.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {goal.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{goal.owner?.name || 'Unknown'}</span>
                      </div>
                      {goal.dueDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due {new Date(goal.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {goal.progress}%
                    </div>
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Key Results */}
                {goal.keyResults && goal.keyResults.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Key Results
                    </h4>
                    <div className="space-y-3">
                      {goal.keyResults.map((kr: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              {kr.name}
                            </p>
                            <div className="flex items-center space-x-4">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getProgressColor(kr.progress)}`}
                                  style={{ width: `${kr.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 min-w-[60px]">
                                {kr.current}/{kr.target}
                              </span>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[40px]">
                                {kr.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}