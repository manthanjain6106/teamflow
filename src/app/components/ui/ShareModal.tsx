'use client';

import { useState, useEffect } from 'react';
import { useTaskShares } from '@/hooks/useData';
import { shareTask, removeTaskShare } from '@/lib/api';
import { 
  X, 
  Share2, 
  Copy, 
  Users, 
  Mail, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  Crown,
  Check,
  Loader2,
  UserPlus
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'task' | 'document';
  itemId: string;
  itemTitle: string;
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  itemType, 
  itemId, 
  itemTitle 
}: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'read' | 'write' | 'admin'>('read');
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Only fetch shares for tasks currently (extend for documents later)
  const { shares, loading, error, refetch } = useTaskShares(itemType === 'task' ? itemId : undefined);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPermission('read');
      setShareError(null);
      setCopied(false);
    }
  }, [isOpen]);

  const handleShare = async () => {
    if (!email.trim()) {
      setShareError('Please enter an email address');
      return;
    }

    if (itemType !== 'task') {
      setShareError('Document sharing coming soon');
      return;
    }

    try {
      setIsSharing(true);
      setShareError(null);
      
      await shareTask({
        taskId: itemId,
        userEmail: email.trim(),
        permission,
      });

      setEmail('');
      refetch();
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      await removeTaskShare(shareId);
      refetch();
    } catch (error) {
      console.error('Failed to remove share:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/app/${itemType}s/${itemId}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const getPermissionIcon = (perm: string) => {
    switch (perm) {
      case 'admin': return <Crown className="h-4 w-4 text-purple-600" />;
      case 'write': return <Edit3 className="h-4 w-4 text-blue-600" />;
      case 'read': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPermissionLabel = (perm: string) => {
    switch (perm) {
      case 'admin': return 'Admin';
      case 'write': return 'Can edit';
      case 'read': return 'Can view';
      default: return 'Can view';
    }
  };

  const getPermissionDescription = (perm: string) => {
    switch (perm) {
      case 'admin': return 'Can view, edit, share, and delete';
      case 'write': return 'Can view and edit';
      case 'read': return 'Can only view';
      default: return 'Can only view';
    }
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
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Share2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Share {itemType}
                </h3>
                <p className="text-sm text-gray-500 truncate max-w-xs">
                  {itemTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Share Link */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Anyone with the link
                  </p>
                  <p className="text-xs text-gray-500">
                    Can view this {itemType}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Add People */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <UserPlus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                Invite people
              </h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleShare()}
                  />
                </div>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="read">Can view</option>
                  <option value="write">Can edit</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {shareError && (
                <p className="text-sm text-red-600">{shareError}</p>
              )}

              <button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {isSharing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>{isSharing ? 'Sharing...' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Shared With */}
          <div className="p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              Shared with
            </h4>
            
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 text-center py-4">{error}</p>
            )}

            {!loading && !error && shares.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Not shared with anyone yet
              </p>
            )}

            {!loading && shares.length > 0 && (
              <div className="space-y-3">
                {shares.map((share: any) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        {share.user.image ? (
                          <img
                            src={share.user.image}
                            alt={share.user.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {share.user.name?.[0]?.toUpperCase() || share.user.email[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {share.user.name || share.user.email}
                        </p>
                        {share.user.name && (
                          <p className="text-xs text-gray-500">{share.user.email}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        {getPermissionIcon(share.permission)}
                        <span>{getPermissionLabel(share.permission)}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveShare(share.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove access"
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
      </div>
    </div>
  );
}