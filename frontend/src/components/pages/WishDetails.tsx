import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Heart, Users, Calendar, Tag, Globe, ArrowLeft, MessageSquare, CheckCircle2, Trash2, Edit3 } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { SupportModal } from '../ui/SupportModal';

export function WishDetails() {
  const { id } = useParams<{ id: string }>();
  const wishId = parseInt(id || '0');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isRemovingSupport, setIsRemovingSupport] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['wish', wishId],
    queryFn: async () => {
      const response = await fetch(`/api/wishes/${wishId}`);
      if (!response.ok) throw new Error('Wish not found');
      return response.json();
    },
    enabled: !!wishId,
    staleTime: 2 * 60 * 1000,
  });

  const { data: userSupportsData } = useQuery({
    queryKey: ['user-supports', user?.username],
    queryFn: async () => {
      const url = user?.username ? `/api/wishes/user-supports?username=${encodeURIComponent(user.username)}` : '/api/wishes/user-supports';
      const res = await fetch(url);
      if (!res.ok) return { supportedWishIds: [] };
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <LoadingSkeleton count={2} />
      </div>
    );
  }

  if (error || !data?.wish) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title="Wish not found"
          description="The requested Community Wishlist wish could not be found."
          action={{
            label: 'Back to Discover',
            onClick: () => window.history.back(),
          }}
        />
      </div>
    );
  }

  const wish = data.wish;
  const currentVotes = typeof wish.votecount === 'number' ? wish.votecount : 0;
  const metaWikiPageTitle = (wish.crwtitle || `Community Wishlist/W${wish.id}`).replace(/ /g, '_');
  const metaWikiUrl = `https://meta.wikimedia.org/wiki/${encodeURI(metaWikiPageTitle)}`;
  const metaWikiVoteUrl = `${metaWikiUrl}#Voting`;

  const userSupporterEntry = wish.supporters?.find((s: any) =>
    s.username?.toLowerCase() === user?.username?.toLowerCase()
  );

  const isAlreadySupported = Boolean(
    (userSupportsData?.supportedWishIds && userSupportsData.supportedWishIds.includes(wish.id)) ||
    userSupporterEntry
  );

  const userExistingComment = userSupporterEntry?.comment || '';

  const handleRemoveSupport = async () => {
    if (!window.confirm('Are you sure you want to remove your support vote for this wish on Wikimedia Meta-Wiki?')) {
      return;
    }

    setIsRemovingSupport(true);
    try {
      const res = await fetch(`/api/wishes/${wish.id}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'remove' }),
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || resData.error || 'Failed to remove support vote');
      }

      queryClient.invalidateQueries({ queryKey: ['wish', wishId] });
      queryClient.invalidateQueries({ queryKey: ['explore-wishes'] });
      queryClient.invalidateQueries({ queryKey: ['user-supports'] });
      queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
      if (user?.username) {
        queryClient.invalidateQueries({ queryKey: ['user', user.username] });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove support vote');
    } finally {
      setIsRemovingSupport(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-3.5 py-6 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
        <div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:text-brand transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Discover Wishes</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border-app bg-surface p-4 sm:p-6 lg:p-8 shadow-sm space-y-6 sm:space-y-8">
          {/* Title, Badge & Support Action */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-semibold text-brand bg-brand/10 px-2.5 py-1 rounded-md">
                  {wish.crwtitle || `Wish #${wish.id}`}
                </span>
                <StatusBadge status={wish.status} />
              </div>

              {/* Direct In-App Support Button */}
              <Button
                size="sm"
                onClick={() => setIsSupportModalOpen(true)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 font-semibold shadow-sm transition-all h-9 sm:h-9 ${
                  isAlreadySupported
                    ? 'bg-green-500/15 hover:bg-green-500/25 text-green-600 dark:text-green-400 border border-green-500/30'
                    : 'bg-brand hover:bg-brand/90 text-white'
                }`}
              >
                {isAlreadySupported ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Heart className="h-4 w-4 fill-white" />
                )}
                <span>{isAlreadySupported ? 'Supported by you' : 'Support wish'}</span>
                <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-black/15 font-mono">
                  {currentVotes}
                </span>
              </Button>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text-primary leading-tight">
              {wish.title}
            </h1>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-muted">
              Description
            </h2>
            <div className="text-sm sm:text-base text-text-secondary leading-relaxed bg-surface-elevated/40 p-3.5 sm:p-5 rounded-xl border border-border-app/50 whitespace-pre-line">
              {wish.description || 'No extended description provided. Click "View on Meta-Wiki" below to read the community proposal and discussions.'}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-xl bg-surface-elevated/20 border border-border-app">
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-text-muted">
                <Users className="h-3.5 w-3.5 text-brand" />
                <span>Supporters</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-text-primary">
                {currentVotes}
              </p>
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-text-muted">
                <Calendar className="h-3.5 w-3.5 text-brand" />
                <span>Created</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-text-primary">
                {wish.created ? new Date(wish.created).toLocaleDateString() : 'Recent'}
              </p>
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-text-muted">
                <Globe className="h-3.5 w-3.5 text-brand" />
                <span>Focus Area</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-text-primary truncate">
                {wish.focusArea || 'General'}
              </p>
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-text-muted">
                <Heart className="h-3.5 w-3.5 text-red-500" />
                <span>Author</span>
              </div>
              {wish.author ? (
                <Link
                  to={`/user/${wish.author}`}
                  className="text-xs sm:text-sm font-semibold text-brand hover:underline truncate block"
                  title={`View wishes by ${wish.author}`}
                >
                  {wish.author} →
                </Link>
              ) : (
                <p className="text-xs sm:text-sm font-medium text-text-primary">Community</p>
              )}
            </div>
          </div>

          {/* Tags */}
          {wish.tags && wish.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-muted">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {wish.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-brand/10 border border-brand/20 px-2.5 py-0.5 sm:py-1 text-xs font-medium text-brand"
                  >
                    <Tag className="h-3 w-3" />
                    {tag.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Supporters & Genuine Comments List from Meta-Wiki */}
          <div className="space-y-4 pt-4 border-t border-border-app">
            {/* Meta-Wiki style status banner when user already supports */}
            {isAlreadySupported && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-green-500/10 border border-green-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">
                      You have already supported this wish.
                    </p>
                    {userExistingComment ? (
                      <p className="text-xs text-text-secondary italic mt-0.5">
                        Your comment: "{userExistingComment}"
                      </p>
                    ) : (
                      <p className="text-[11px] sm:text-xs text-text-muted mt-0.5">
                        Voting for this wish is open. You can edit your comment or remove support at any time.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsSupportModalOpen(true)}
                    className="flex-1 sm:flex-initial text-xs border-green-500/30 hover:bg-green-500/15 text-green-600 dark:text-green-300 font-semibold justify-center h-8 sm:h-9"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1" />
                    <span>Edit comment</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemoveSupport}
                    disabled={isRemovingSupport}
                    className="flex-1 sm:flex-initial text-xs border-red-500/30 hover:bg-red-500/15 text-red-500 font-semibold justify-center h-8 sm:h-9"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    <span>{isRemovingSupport ? 'Removing...' : 'Remove support'}</span>
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Users className="h-4 w-4 text-brand" />
                <span>Supporters of this wish ({wish.supporters?.length || currentVotes})</span>
              </h3>
              {isAlreadySupported ? (
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(true)}
                  className="w-full sm:w-auto text-xs text-green-600 dark:text-green-400 hover:underline font-semibold flex items-center justify-center gap-1.5 bg-green-500/10 hover:bg-green-500/15 border border-green-500/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5 text-green-500" />
                  <span>Edit your support</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(true)}
                  className="w-full sm:w-auto text-xs text-brand hover:underline font-semibold flex items-center justify-center gap-1.5 bg-brand/5 hover:bg-brand/10 border border-brand/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Heart className="h-3.5 w-3.5 text-brand" />
                  <span>Support & add comment</span>
                </button>
              )}
            </div>

            {wish.supporters && wish.supporters.length > 0 ? (
              <div className="space-y-2 sm:space-y-2.5 max-h-72 sm:max-h-80 overflow-y-auto pr-1">
                {wish.supporters.map((s: any, idx: number) => {
                  const isCurrentUser = user?.username && s.username?.toLowerCase() === user.username.toLowerCase();
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 sm:p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isCurrentUser
                          ? 'bg-green-500/10 border-green-500/30 ring-1 ring-green-500/20'
                          : 'bg-surface-elevated/40 border border-border-app'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 sm:mt-0 ${isCurrentUser ? 'text-green-500 font-bold' : 'text-green-500'}`} />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <Link
                              to={`/user/${s.username}`}
                              className={`text-xs font-bold hover:underline ${isCurrentUser ? 'text-green-600 dark:text-green-300' : 'text-text-primary hover:text-brand'}`}
                            >
                              {s.username} {isCurrentUser && '(You)'}
                            </Link>
                            {s.timestamp && (
                              <span className="text-[10px] sm:text-[11px] text-text-muted">
                                • {s.timestamp}
                              </span>
                            )}
                          </div>
                          {s.comment && (
                            <p className="text-xs text-text-secondary italic flex items-center gap-1.5">
                              <MessageSquare className="h-3 w-3 text-text-muted shrink-0" />
                              <span>"{s.comment}"</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        {isCurrentUser && (
                          <button
                            type="button"
                            onClick={() => setIsSupportModalOpen(true)}
                            className="text-xs text-green-600 dark:text-green-400 hover:underline font-medium"
                          >
                            Edit
                          </button>
                        )}
                        <a
                          href={`https://meta.wikimedia.org/wiki/User:${encodeURIComponent(s.username)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-text-muted hover:text-brand shrink-0"
                        >
                          User page ↗
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic bg-surface-elevated/20 p-4 rounded-xl border border-border-app">
                No recorded comments yet. Be the first to support this wish on Meta-Wiki!
              </p>
            )}
          </div>

          {/* Meta-Wiki Link Footer */}
          <div className="pt-4 sm:pt-6 border-t border-border-app flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs text-text-muted text-center sm:text-left">
              Live Meta-Wiki page: <span className="font-mono text-text-secondary">{wish.crwtitle}</span>
            </p>
            <a
              href={metaWikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface-elevated border border-border-app px-4 py-2 text-xs font-semibold text-text-primary hover:bg-border-hover transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>View full wiki proposal</span>
            </a>
          </div>
        </div>
      </div>

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        wishId={wish.id}
        wishTitle={wish.title}
        crwtitle={wish.crwtitle}
        isAlreadySupported={isAlreadySupported}
        initialComment={userExistingComment}
      />
    </>
  );
}
