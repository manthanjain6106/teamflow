'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Share,
  Star,
  Archive,
  Trash2,
  Folder,
  FolderPlus,
  Image,
  Link,
  Code,
  Table,
  List,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  Eye
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  isStarred: boolean;
  isArchived: boolean;
  createdBy: string;
  updatedAt: string;
  sharedWith: string[];
  permissions: 'view' | 'edit' | 'admin';
}

interface DocumentFolder {
  id: string;
  name: string;
  parentId?: string;
  color: string;
  documentCount: number;
}

export default function ClickUpDocs() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Project Requirements',
      content: '<h1>Project Requirements</h1><p>This document outlines the key requirements for our upcoming project...</p>',
      folderId: '1',
      isStarred: true,
      isArchived: false,
      createdBy: 'John Doe',
      updatedAt: '2024-03-15T10:30:00Z',
      sharedWith: ['user1', 'user2'],
      permissions: 'edit'
    },
    {
      id: '2',
      title: 'API Documentation',
      content: '<h1>API Documentation</h1><h2>Authentication</h2><p>All API requests require authentication...</p>',
      folderId: '2',
      isStarred: false,
      isArchived: false,
      createdBy: 'Jane Smith',
      updatedAt: '2024-03-14T15:45:00Z',
      sharedWith: ['user3'],
      permissions: 'view'
    }
  ]);

  const [folders, setFolders] = useState<DocumentFolder[]>([
    { id: '1', name: 'Project Documents', color: '#3b82f6', documentCount: 5 },
    { id: '2', name: 'Technical Specs', color: '#10b981', documentCount: 3 },
    { id: '3', name: 'Meeting Notes', parentId: '1', color: '#f59e0b', documentCount: 2 }
  ]);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);

  // Toolbar actions
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const insertElement = (type: 'link' | 'image' | 'table') => {
    switch (type) {
      case 'link':
        const url = prompt('Enter URL:');
        if (url) formatText('createLink', url);
        break;
      case 'image':
        const imgUrl = prompt('Enter image URL:');
        if (imgUrl) formatText('insertImage', imgUrl);
        break;
      case 'table':
        const tableHtml = '<table border="1"><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></table>';
        formatText('insertHTML', tableHtml);
        break;
    }
  };

  const saveDocument = () => {
    if (selectedDocument && editorRef.current) {
      const updatedDoc = {
        ...selectedDocument,
        content: editorRef.current.innerHTML,
        updatedAt: new Date().toISOString()
      };
      
      setDocuments(prev => prev.map(doc => 
        doc.id === selectedDocument.id ? updatedDoc : doc
      ));
      
      setSelectedDocument(updatedDoc);
      setIsEditing(false);
    }
  };

  const createNewDocument = (title: string, folderId?: string) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      title,
      content: `<h1>${title}</h1><p>Start writing your document here...</p>`,
      folderId,
      isStarred: false,
      isArchived: false,
      createdBy: 'Current User',
      updatedAt: new Date().toISOString(),
      sharedWith: [],
      permissions: 'admin'
    };
    
    setDocuments(prev => [...prev, newDoc]);
    setSelectedDocument(newDoc);
    setIsEditing(true);
    setShowNewDocModal(false);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || 
                         selectedFolder === 'starred' && doc.isStarred ||
                         doc.folderId === selectedFolder;
    return matchesSearch && matchesFolder && !doc.isArchived;
  });

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              Documents
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="New folder"
              >
                <FolderPlus className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowNewDocModal(true)}
                className="p-1.5 bg-purple-600 text-white rounded hover:bg-purple-700"
                title="New document"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Folder Navigation */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            <button
              onClick={() => setSelectedFolder('all')}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded ${
                selectedFolder === 'all' 
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>All Documents</span>
              <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                {documents.filter(d => !d.isArchived).length}
              </span>
            </button>
            
            <button
              onClick={() => setSelectedFolder('starred')}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded ${
                selectedFolder === 'starred'
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Star className="h-4 w-4" />
              <span>Starred</span>
              <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                {documents.filter(d => d.isStarred && !d.isArchived).length}
              </span>
            </button>
          </div>

          {folders.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Folders
              </h3>
              <div className="space-y-1">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded ${
                      selectedFolder === folder.id
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="flex-1 text-left">{folder.name}</span>
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                      {folder.documentCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto">
          {filteredDocuments.length > 0 ? (
            <div className="p-2">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                    selectedDocument?.id === doc.id
                      ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                      {doc.title}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {doc.isStarred && (
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      )}
                      {doc.sharedWith.length > 0 && (
                        <Share className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    by {doc.createdBy}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <FileText className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-sm">No documents found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedDocument ? (
          <>
            {/* Document Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedDocument.title}
                  </h1>
                  {selectedDocument.isStarred && (
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center space-x-2 px-3 py-1.5 text-sm rounded ${
                      isEditing
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    <span>{isEditing ? 'Save' : 'Edit'}</span>
                  </button>
                  
                  <button className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Share className="h-4 w-4" />
                  </button>
                  
                  <button className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Editor Toolbar */}
            {isEditing && (
              <div className="border-b border-gray-200 dark:border-gray-700 p-2">
                <div className="flex items-center space-x-1">
                  <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
                    <button
                      onClick={() => formatText('bold')}
                      className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => formatText('italic')}
                      className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Italic className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => formatText('underline')}
                      className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Underline className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
                    <button
                      onClick={() => formatText('justifyLeft')}
                      className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <AlignLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => formatText('justifyCenter')}
                      className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => formatText('justifyRight')}
                      className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <AlignRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => insertElement('link')}
                      className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Link className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => insertElement('image')}
                      className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Image className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => insertElement('table')}
                      className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Table className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => formatText('insertUnorderedList')}
                      className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Document Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div
                ref={editorRef}
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                dangerouslySetInnerHTML={{ __html: selectedDocument.content }}
                className={`prose max-w-none dark:prose-invert ${
                  isEditing 
                    ? 'focus:outline-none border border-gray-300 dark:border-gray-600 rounded-lg p-4' 
                    : ''
                }`}
                onBlur={isEditing ? saveDocument : undefined}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No document selected</h3>
              <p className="mb-4">Select a document from the sidebar or create a new one</p>
              <button
                onClick={() => setShowNewDocModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Create Document</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Document Modal */}
      {showNewDocModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Document
            </h3>
            <input
              type="text"
              placeholder="Document title..."
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const title = (e.target as HTMLInputElement).value;
                  if (title.trim()) {
                    createNewDocument(title.trim(), selectedFolder === 'all' ? undefined : selectedFolder);
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewDocModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Document title..."]') as HTMLInputElement;
                  const title = input?.value.trim();
                  if (title) {
                    createNewDocument(title, selectedFolder === 'all' ? undefined : selectedFolder);
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}