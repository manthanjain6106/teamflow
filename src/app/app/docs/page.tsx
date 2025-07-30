'use client';

import { useState } from 'react';
import { useDocuments, useDocumentFolders } from '@/hooks/useData';
import { useStore } from '@/store/useStore';
import { createDocument, createDocumentFolder, updateDocument, deleteDocument } from '@/lib/api';
import { FileText, Plus, Search, Grid, List, Folder, Clock, User, Star, Loader2 } from 'lucide-react';

export default function DocsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const { selectedWorkspace } = useStore();

  const { documents, loading: docsLoading, error: docsError, refetch: refetchDocs } = useDocuments({
    workspaceId: selectedWorkspace?.id,
    folderId: selectedFolder || undefined,
    starred: filter === 'starred' ? true : undefined,
  });

  const { folders, loading: foldersLoading, error: foldersError, refetch: refetchFolders } = useDocumentFolders(
    selectedWorkspace?.id
  );

  const handleCreateDocument = async () => {
    if (!selectedWorkspace?.id) return;
    
    try {
      await createDocument({
        title: 'Untitled Document',
        content: '',
        workspaceId: selectedWorkspace.id,
        folderId: selectedFolder || undefined,
      });
      refetchDocs();
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleToggleStar = async (docId: string, starred: boolean) => {
    try {
      await updateDocument({ id: docId, starred: !starred });
      refetchDocs();
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!selectedWorkspace?.id) return;
    
    const name = prompt('Enter folder name:');
    if (!name) return;

    try {
      await createDocumentFolder({
        name,
        workspaceId: selectedWorkspace.id,
        color: '#3b82f6',
      });
      refetchFolders();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const filteredDocuments = documents.filter((doc: any) => {
    if (filter === 'starred' && !doc.starred) return false;
    if (searchTerm && !doc.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const loading = docsLoading || foldersLoading;
  const error = docsError || foldersError;

  if (!selectedWorkspace) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No workspace selected
          </h3>
          <p className="text-gray-500">
            Please select a workspace to view documents.
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
          <span>Loading documents...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load documents</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button 
            onClick={() => {
              refetchDocs();
              refetchFolders();
            }}
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
                Docs
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create, organize, and collaborate on documents
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleCreateDocument}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Doc</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Documents</option>
            <option value="starred">Starred</option>
          </select>
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            >
              <Grid className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            >
              <List className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Folders Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Folders
            </h2>
            <button
              onClick={handleCreateFolder}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              + New Folder
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* All Documents folder */}
            <div
              onClick={() => setSelectedFolder(null)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedFolder === null
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Folder className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    All Documents
                  </h3>
                  <p className="text-sm text-gray-500">
                    {documents.length} documents
                  </p>
                </div>
              </div>
            </div>
            
            {folders.map((folder: any) => (
              <div
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedFolder === folder.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${folder.color}20` }}
                  >
                    <Folder
                      className="h-5 w-5"
                      style={{ color: folder.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {folder.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {folder._count?.documents || 0} documents
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {selectedFolder 
              ? folders.find((f: any) => f.id === selectedFolder)?.name || 'Documents'
              : 'All Documents'
            }
          </h2>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map((doc: any) => (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(doc.id, doc.starred);
                        }}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Star 
                          className={`h-4 w-4 ${
                            doc.starred 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </button>
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      {doc.content || 'No content'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{doc.folder?.name || 'No folder'}</span>
                      <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredDocuments.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No documents found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? `No documents match "${searchTerm}"`
                      : 'Create your first document to get started.'
                    }
                  </p>
                  <button
                    onClick={handleCreateDocument}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Create Document
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {filteredDocuments.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No documents found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? `No documents match "${searchTerm}"`
                      : 'Create your first document to get started.'
                    }
                  </p>
                  <button
                    onClick={handleCreateDocument}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Create Document
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredDocuments.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {doc.title}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStar(doc.id, doc.starred);
                              }}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Star 
                                className={`h-4 w-4 ${
                                  doc.starred 
                                    ? 'text-yellow-500 fill-current' 
                                    : 'text-gray-400'
                                }`} 
                              />
                            </button>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{doc.createdBy?.name || 'Unknown'}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                            </span>
                            <span>{doc.folder?.name || 'No folder'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}