'use client';

import { useState, useRef, useCallback } from 'react';
import { useAttachments } from '@/hooks/useData';
import { uploadAttachment, deleteAttachment } from '@/lib/api';
import {
  Upload,
  X,
  File,
  Image,
  FileText,
  Video,
  Music,
  Archive,
  Paperclip,
  Trash2,
  Download,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
  Plus
} from 'lucide-react';

interface FileUploadProps {
  taskId: string;
  onAttachmentChange?: () => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function FileUpload({ taskId, onAttachmentChange }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { attachments, loading, error, refetch } = useAttachments(taskId);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-600" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-purple-600" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5 text-green-600" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-600" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="h-5 w-5 text-orange-600" />;
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const uploadingFile: UploadingFile = {
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: 'uploading'
      };

      setUploadingFiles(prev => [...prev, uploadingFile]);

      // Simulate upload progress (replace with actual upload logic)
      uploadFile(uploadingFile);
    });
  }, [taskId]);

  const uploadFile = async (uploadingFile: UploadingFile) => {
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        );
      }, 200);

      const result = await uploadAttachment(uploadingFile.file, taskId);

      clearInterval(progressInterval);

      setUploadingFiles(prev => 
        prev.map(f => 
          f.id === uploadingFile.id 
            ? { ...f, progress: 100, status: 'completed' }
            : f
        )
      );

      // Remove from uploading files after a delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));
      }, 2000);

      refetch();
      onAttachmentChange?.();

    } catch (error) {
      setUploadingFiles(prev => 
        prev.map(f => 
          f.id === uploadingFile.id 
            ? { 
                ...f, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Upload failed' 
              }
            : f
        )
      );
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileSelect(files);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (confirm('Are you sure you want to delete this attachment?')) {
      try {
        await deleteAttachment(attachmentId);
        refetch();
        onAttachmentChange?.();
      } catch (error) {
        console.error('Failed to delete attachment:', error);
      }
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragOver
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
            <Upload className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-gray-500">
              Maximum file size: 10MB
            </p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Uploading...
          </h4>
          {uploadingFiles.map((uploadingFile) => (
            <div
              key={uploadingFile.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex-shrink-0">
                {uploadingFile.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                )}
                {uploadingFile.status === 'completed' && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {uploadingFile.status === 'error' && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {uploadingFile.file.name}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        uploadingFile.status === 'error' 
                          ? 'bg-red-500' 
                          : uploadingFile.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${uploadingFile.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 min-w-0">
                    {uploadingFile.progress}%
                  </span>
                </div>
                {uploadingFile.error && (
                  <p className="text-xs text-red-600 mt-1">
                    {uploadingFile.error}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing Attachments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Attachments ({attachments.length})
          </h4>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Loading attachments...
            </span>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && attachments.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No attachments yet
          </p>
        )}

        {!loading && attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((attachment: any) => (
              <div
                key={attachment.id}
                className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(attachment.mimeType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {attachment.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.fileSize)} • {new Date(attachment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => window.open(attachment.fileUrl, '_blank')}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View file"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <a
                    href={attachment.fileUrl}
                    download={attachment.fileName}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(attachment.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}