'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearch } from '@/hooks/useData';
import { useStore } from '@/store/useStore';
import { 
  Search, 
  X, 
  FileText, 
  CheckSquare2, 
  Target, 
  MessageSquare,
  Calendar,
  User,
  Folder,
  Loader2,
  Hash
} from 'lucide-react';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const { selectedWorkspace } = useStore();
  const { results, loading, error, search, clearResults } = useSearch();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Perform search when query changes
  useEffect(() => {
    if (query.length >= 2 && selectedWorkspace?.id) {
      const timeoutId = setTimeout(() => {
        search({
          query,
          workspaceId: selectedWorkspace.id,
          type: selectedType === 'all' ? undefined : selectedType as any,
        });
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    } else {
      clearResults();
    }
  }, [query, selectedType, selectedWorkspace?.id]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckSquare2 className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'text-blue-600 bg-blue-100';
      case 'document': return 'text-green-600 bg-green-100';
      case 'goal': return 'text-purple-600 bg-purple-100';
      case 'comment': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleResultClick = (result: any) => {
    // Navigate to the result (you would implement navigation logic here)
    console.log('Navigate to:', result.url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-20">
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, documents, goals..."
              className="flex-1 text-lg bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-500"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Type Filters */}
          <div className="flex items-center space-x-2 p-4 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'all', label: 'All' },
              { id: 'task', label: 'Tasks' },
              { id: 'document', label: 'Documents' },
              { id: 'goal', label: 'Goals' },
              { id: 'comment', label: 'Comments' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedType === type.id
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Searching...</span>
              </div>
            )}

            {error && (
              <div className="p-4 text-center text-red-600">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && query.length >= 2 && results.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No results found</p>
                <p className="text-sm">Try adjusting your search terms or filters</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="py-2">
                {results.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className={`p-2 rounded-lg mr-3 ${getTypeColor(result.type)}`}>
                      {getTypeIcon(result.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {result.title}
                        </h3>
                        <span className="text-xs text-gray-500 capitalize">
                          {result.type}
                        </span>
                      </div>
                      
                      {result.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                          {result.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {result.creator && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{result.creator.name}</span>
                          </div>
                        )}
                        
                        {result.space && (
                          <div className="flex items-center space-x-1">
                            <Folder className="h-3 w-3" />
                            <span>{result.space}</span>
                          </div>
                        )}
                        
                        {result.dueDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(result.dueDate)}</span>
                          </div>
                        )}
                        
                        <span>{formatDate(result.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query.length > 0 && query.length < 2 && (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Type at least 2 characters to search</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded text-xs">
                  ↵
                </kbd>
                <span>to select</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded text-xs">
                  esc
                </kbd>
                <span>to close</span>
              </div>
            </div>
            
            {results.length > 0 && (
              <span className="text-xs text-gray-500">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}