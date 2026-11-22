import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Heart, X, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Trash2, Check } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../../hooks/useAuth';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishId: number;
  wishTitle: string;
  crwtitle: string;
  isAlreadySupported?: boolean;
  initialComment?: string;
  onSuccess?: (data: any) => void;
}

export function SupportModal({
  isOpen,
  onClose,
  wishId,
  wishTitle,
  crwtitle,
  isAlreadySupported = false,
  initialComment = '',
  onSuccess,
}: SupportModalProps) {
  const { user, isAuthenticated, login } = useAuth();
  const queryClient = useQueryClient();

  const [comment, setComment] = useState(initialComment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setComment(initialComment || '');
      setError(null);
      setIsSuccess(false);
      setSuccessInfo(null);
    }
  }, [isOpen, initialComment]);

  if (!isOpen) return null;

  const cleanWishTitle = (wishTitle || '').replace(/^"+|"+$/g, '').trim();
  const metaWikiPageTitle = (crwtitle || `Community Wishlist/W${wishId}`).replace(/ /g, '_');
  const metaWikiVoteUrl = `https://meta.wikimedia.org/wiki/${encodeURI(metaWikiPageTitle)}#Voting`;

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/wishes/${wishId}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ comment: comment.trim(), action: 'add' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to submit support vote');
      }

      setIsSuccess(true);
      setSuccessInfo(data);

      // Invalidate queries so all views update in real time
      queryClient.invalidateQueries({ queryKey: ['wish', wishId] });
      queryClient.invalidateQueries({ queryKey: ['explore-wishes'] });
      queryClient.invalidateQueries({ queryKey: ['user-supports'] });
      queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
      if (user?.username) {
        queryClient.invalidateQueries({ queryKey: ['user', user.username] });
      }

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to record support vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSupport = async () => {
    if (!isAuthenticated) return;
    if (!window.confirm('Are you sure you want to remove your support vote for this wish on Wikimedia Meta-Wiki?')) {
      return;
    }

    setIsRemoving(true);
    setError(null);

    try {
      const response = await fetch(`/api/wishes/${wishId}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'remove' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to remove support vote');
      }

      setIsSuccess(true);
      setSuccessInfo({ ...data, isRemoval: true });

      // Invalidate queries so all views update in real time
      queryClient.invalidateQueries({ queryKey: ['wish', wishId] });
      queryClient.invalidateQueries({ queryKey: ['explore-wishes'] });
      queryClient.invalidateQueries({ queryKey: ['user-supports'] });
      queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
      if (user?.username) {
        queryClient.invalidateQueries({ queryKey: ['user', user.username] });
      }

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove support vote');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setComment('');
    setError(null);
    setSuccessInfo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto bg-surface border border-border-app rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5 sm:space-y-6 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-text-muted hover:text-text-primary p-2 rounded-full hover:bg-surface-elevated transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="pr-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono font-semibold text-brand bg-brand/10 px-2.5 py-0.5 rounded-md">
              {crwtitle || `Wish #${wishId}`}
            </span>
            {isAlreadySupported && (
              <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <Check className="h-3 w-3" />
                Supported by you
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-text-primary leading-tight">
            {isAlreadySupported ? 'Edit comment for' : 'Support'} "{cleanWishTitle}"
          </h2>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="space-y-5 py-2 animate-in fade-in duration-200">
            {successInfo?.isRemoval ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <CheckCircle2 className="h-6 w-6 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Support vote withdrawn</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Your support vote has been officially removed from Meta-Wiki.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-6 w-6 shrink-0" />
                <div>
                  <p className="font-bold text-sm">
                    {isAlreadySupported ? 'Support comment updated!' : 'Support vote recorded successfully!'}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {comment ? `Your comment: "${comment}"` : 'Support saved without comment.'}
                  </p>
                </div>
              </div>
            )}

            <p className="text-xs text-text-secondary leading-relaxed">
              {successInfo?.publishedToMetaWiki || successInfo?.action === 'remove' ? (
                <>Changes were published directly to Wikimedia Meta-Wiki on <span className="font-mono text-text-primary">{crwtitle}/Votes</span>.</>
              ) : (
                <>Your vote state has been updated and synchronized with Wikimedia Meta-Wiki.</>
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={metaWikiVoteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1"
              >
                <Button
                  variant="outline"
                  className="w-full justify-center gap-2 text-xs border-border-app"
                >
                  <span>View on Meta-Wiki</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
              <Button
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-6 text-xs font-semibold"
              >
                Done
              </Button>
            </div>
          </div>
        ) : !isAuthenticated ? (
          /* Unauthenticated: Only Official Wikimedia OAuth or Direct Meta-Wiki Voting */
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-surface-elevated/40 border border-border-app text-sm text-text-secondary space-y-2">
              <div className="flex items-center gap-2 font-bold text-text-primary">
                <ShieldCheck className="h-4 w-4 text-brand" />
                <span>Verified Wikimedia Authentication Required</span>
              </div>
              <p className="text-xs leading-relaxed">
                To prevent identity spoofing and ensure 100% genuine votes, voting on the Community Wishlist requires authenticating through official Wikimedia OAuth or voting directly on Meta-Wiki.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <Button
                onClick={login}
                className="w-full h-11 justify-center gap-2 text-xs font-semibold shadow-sm"
              >
                <ShieldCheck className="h-4 w-4" />
                Sign in with Wikimedia OAuth
              </Button>

              <a
                href={metaWikiVoteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-11 justify-center gap-2 text-xs border-border-app hover:bg-surface-elevated font-semibold"
                >
                  <span>Support directly on Meta-Wiki</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>

            <p className="text-[11px] text-center text-text-muted">
              Only genuine, verified votes by Wikimedia account holders are recorded.
            </p>
          </div>
        ) : (
          /* Authenticated via OAuth: Support and Comment Form */
          <form onSubmit={handleSupportSubmit} className="space-y-5 animate-in fade-in duration-200">
            {/* Contributor Identity Chip */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/40 border border-border-app text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span className="text-text-secondary">Supporting as:</span>
                <span className="font-bold text-text-primary">{user?.displayName || user?.username}</span>
              </div>
              <span className="text-[11px] font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded">
                Verified OAuth Contributor
              </span>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="support-comment"
                  className="text-xs font-semibold uppercase tracking-wider text-text-primary"
                >
                  {isAlreadySupported ? 'Update your comment' : 'Optional comment'}
                </label>
                <span className="text-[11px] text-text-muted font-mono">
                  {comment.length} / 500
                </span>
              </div>
              <textarea
                id="support-comment"
                rows={3}
                maxLength={500}
                placeholder={isAlreadySupported ? "Edit your comment or leave blank to support without comment..." : "Add an optional comment explaining why you support this wish..."}
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full bg-background border border-border-app rounded-xl p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-500 dark:text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Meta-Wiki CC BY-SA 4.0 Licensing Disclaimer */}
            <div className="text-[11px] text-text-muted leading-relaxed bg-surface-elevated/20 p-3 rounded-xl border border-border-app/40">
              By saving changes, you agree to the{' '}
              <a
                href="https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                Terms of Use
              </a>
              , and you irrevocably agree to release your contribution under the{' '}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                CC BY-SA 4.0 License
              </a>{' '}
              and the GFDL.
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2">
              {isAlreadySupported ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveSupport}
                  disabled={isSubmitting || isRemoving}
                  className="w-full sm:w-auto justify-center border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 text-xs font-semibold px-3 flex items-center gap-1.5 h-10 sm:h-9"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{isRemoving ? 'Removing...' : 'Remove support'}</span>
                </Button>
              ) : (
                <div className="hidden sm:block" />
              )}

              <div className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:ml-auto w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetAndClose}
                  disabled={isSubmitting || isRemoving}
                  className="w-full sm:w-auto justify-center border-border-app text-xs px-4 h-10 sm:h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isRemoving}
                  className="w-full sm:w-auto justify-center font-semibold text-xs px-5 shadow-sm flex items-center gap-2 h-10 sm:h-9"
                >
                  {isAlreadySupported ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{isSubmitting ? 'Saving...' : 'Update comment'}</span>
                    </>
                  ) : (
                    <>
                      <Heart className="h-3.5 w-3.5 fill-white" />
                      <span>{isSubmitting ? 'Recording...' : 'Support'}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
