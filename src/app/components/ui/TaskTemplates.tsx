'use client';

import { useState, useEffect } from 'react';
import { 
  Template, 
  Plus, 
  Star, 
  Copy, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  FileText,
  Zap,
  Clock,
  Users,
  Tag,
  X
} from 'lucide-react';

interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  estimatedHours?: number;
  tags: string[];
  assigneeIds: string[];
  subtasks: SubtaskTemplate[];
  checklist: ChecklistItem[];
  customFields?: Record<string, any>;
  isPublic: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
}

interface SubtaskTemplate {
  id: string;
  name: string;
  description?: string;
  estimatedHours?: number;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskTemplatesProps {
  onUseTemplate: (template: TaskTemplate) => void;
  onCreateTemplate?: (template: Partial<TaskTemplate>) => void;
  className?: string;
}

const categories = [
  'Bug Fix',
  'Feature Development',
  'Code Review',
  'Documentation',
  'Testing',
  'Deployment',
  'Meeting',
  'Research',
  'Design',
  'Other'
];

const sampleTemplates: TaskTemplate[] = [
  {
    id: '1',
    name: 'Bug Report Investigation',
    description: 'Standard template for investigating and fixing reported bugs',
    category: 'Bug Fix',
    priority: 'HIGH',
    estimatedHours: 4,
    tags: ['bug', 'investigation', 'urgent'],
    assigneeIds: [],
    subtasks: [
      { id: '1', name: 'Reproduce the bug', estimatedHours: 1 },
      { id: '2', name: 'Identify root cause', estimatedHours: 2 },
      { id: '3', name: 'Implement fix', estimatedHours: 1 }
    ],
    checklist: [
      { id: '1', text: 'Test in development environment', completed: false },
      { id: '2', text: 'Write unit tests', completed: false },
      { id: '3', text: 'Update documentation', completed: false },
      { id: '4', text: 'Code review approval', completed: false }
    ],
    isPublic: true,
    usageCount: 142,
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Feature Development Sprint',
    description: 'Complete template for new feature development',
    category: 'Feature Development',
    priority: 'NORMAL',
    estimatedHours: 16,
    tags: ['feature', 'development', 'sprint'],
    assigneeIds: [],
    subtasks: [
      { id: '1', name: 'Requirements analysis', estimatedHours: 2 },
      { id: '2', name: 'Design mockups', estimatedHours: 3 },
      { id: '3', name: 'Backend implementation', estimatedHours: 6 },
      { id: '4', name: 'Frontend implementation', estimatedHours: 4 },
      { id: '5', name: 'Testing & QA', estimatedHours: 1 }
    ],
    checklist: [
      { id: '1', text: 'Stakeholder approval', completed: false },
      { id: '2', text: 'Technical specification written', completed: false },
      { id: '3', text: 'UI/UX review completed', completed: false },
      { id: '4', text: 'Performance testing done', completed: false },
      { id: '5', text: 'Documentation updated', completed: false }
    ],
    isPublic: true,
    usageCount: 89,
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Code Review Process',
    description: 'Template for conducting thorough code reviews',
    category: 'Code Review',
    priority: 'NORMAL',
    estimatedHours: 2,
    tags: ['code-review', 'quality', 'best-practices'],
    assigneeIds: [],
    subtasks: [
      { id: '1', name: 'Review code logic', estimatedHours: 1 },
      { id: '2', name: 'Check code style', estimatedHours: 0.5 },
      { id: '3', name: 'Verify tests', estimatedHours: 0.5 }
    ],
    checklist: [
      { id: '1', text: 'Code follows style guidelines', completed: false },
      { id: '2', text: 'All tests pass', completed: false },
      { id: '3', text: 'No security vulnerabilities', completed: false },
      { id: '4', text: 'Performance considerations checked', completed: false }
    ],
    isPublic: true,
    usageCount: 234,
    createdBy: 'system',
    createdAt: new Date().toISOString()
  }
];

export default function TaskTemplates({ 
  onUseTemplate, 
  onCreateTemplate,
  className = '' 
}: TaskTemplatesProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>(sampleTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<TaskTemplate>>({
    name: '',
    description: '',
    category: 'Other',
    priority: 'NORMAL',
    tags: [],
    subtasks: [],
    checklist: [],
    isPublic: false
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: TaskTemplate) => {
    onUseTemplate(template);
    // Update usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    ));
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name?.trim()) return;
    
    const template: TaskTemplate = {
      id: `template_${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description || '',
      category: newTemplate.category || 'Other',
      priority: newTemplate.priority || 'NORMAL',
      estimatedHours: newTemplate.estimatedHours,
      tags: newTemplate.tags || [],
      assigneeIds: [],
      subtasks: newTemplate.subtasks || [],
      checklist: newTemplate.checklist || [],
      isPublic: newTemplate.isPublic || false,
      usageCount: 0,
      createdBy: 'current-user',
      createdAt: new Date().toISOString()
    };

    setTemplates(prev => [template, ...prev]);
    onCreateTemplate?.(template);
    setNewTemplate({
      name: '',
      description: '',
      category: 'Other',
      priority: 'NORMAL',
      tags: [],
      subtasks: [],
      checklist: [],
      isPublic: false
    });
    setShowCreateModal(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'LOW':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatEstimatedTime = (hours?: number) => {
    if (!hours) return null;
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours === 1) return '1h';
    return `${hours}h`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Template className="h-6 w-6 text-purple-600" />
            <span>Task Templates</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Use pre-built templates to create tasks faster
          </p>
        </div>
        {onCreateTemplate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Template</span>
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Template className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first template to get started'
            }
          </p>
          {onCreateTemplate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Template</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all group"
            >
              {/* Template Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {template.description}
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-xs text-gray-500">{template.usageCount}</span>
                </div>
              </div>

              {/* Template Metadata */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(template.priority)}`}>
                    {template.priority}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                    {template.category}
                  </span>
                </div>

                {template.estimatedHours && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Est. {formatEstimatedTime(template.estimatedHours)}</span>
                  </div>
                )}

                {template.subtasks.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>{template.subtasks.length} subtasks</span>
                  </div>
                )}

                {template.checklist.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Zap className="h-4 w-4 mr-1" />
                    <span>{template.checklist.length} checklist items</span>
                  </div>
                )}

                {template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>Use Template</span>
                </button>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                    title="View details"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  {template.createdBy === 'current-user' && (
                    <>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                        title="Edit template"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 rounded"
                        title="Delete template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create Task Template
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={newTemplate.name || ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newTemplate.description || ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe what this template is for"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newTemplate.category || 'Other'}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTemplate.priority || 'NORMAL'}
                    onChange={(e) => setNewTemplate({ ...newTemplate, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTemplate.isPublic || false}
                    onChange={(e) => setNewTemplate({ ...newTemplate, isPublic: e.target.checked })}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Make this template public (visible to all team members)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                disabled={!newTemplate.name?.trim()}
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedTemplate.name}
              </h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedTemplate.description}
                </p>
              </div>

              {selectedTemplate.subtasks.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Subtasks ({selectedTemplate.subtasks.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedTemplate.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-gray-900 dark:text-white">{subtask.name}</span>
                        {subtask.estimatedHours && (
                          <span className="text-sm text-gray-500">
                            {formatEstimatedTime(subtask.estimatedHours)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTemplate.checklist.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Checklist ({selectedTemplate.checklist.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedTemplate.checklist.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          readOnly
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-gray-900 dark:text-white">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleUseTemplate(selectedTemplate);
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}