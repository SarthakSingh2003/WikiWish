import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { Badge } from './ui/Badge';
import { StatusBadge } from './ui/StatusBadge';
import { WikiWish } from '../types/wish';
import { useAuth } from '../hooks/useAuth';
import { SupportModal } from './ui/SupportModal';

interface WishCardProps {
  wish: WikiWish;
  showAuthor?: boolean;
  compact?: boolean;
}

export function WishCard({ wish, showAuthor = false, compact: _compact = false }: WishCardProps) {
  const tags = Array.isArray(wish.tags) ? wish.tags : [];
  const formattedDate = wish.created ? new Date(wish.created).toLocaleDateString() : 'Recent';
  const { user } = useAuth();
  const [showSupportModal, setShowSupportModal] = useState(false);

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

  const userSupporterEntry = wish.supporters?.find((s: any) =>
    s.username?.toLowerCase() === user?.username?.toLowerCase()
  );

  const isSupported = Boolean(
    (userSupportsData?.supportedWishIds && userSupportsData.supportedWishIds.includes(wish.id)) ||
    userSupporterEntry
  );

  const userExistingComment = userSupporterEntry?.comment || '';

  const currentVotes = typeof wish.votecount === 'number' ? wish.votecount : 0;

  const handleSupportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSupportModal(true);
  };

  return (
    <>
      <div className="rounded-xl border border-border-app bg-surface p-4 sm:p-5 hover:border-brand/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
        <div>
          <div className="flex justify-between items-start gap-3 mb-2.5">
            <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-brand transition-colors line-clamp-2">
              <Link to={`/wish/${wish.id}`}>
                {wish.title || wish.crwtitle || 'Untitled Wish'}
              </Link>
            </h3>
            <div className="shrink-0">
              <StatusBadge status={wish.status} />
            </div>
          </div>

          <p className="text-sm text-text-secondary mb-4 line-clamp-3 leading-relaxed">
            {wish.description || 'Community request submitted to Wikimedia Meta-Wiki.'}
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-border-app/50">
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-surface-elevated/50">
                  {tag.replace(/-/g, ' ')}
                </Badge>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-text-muted">+{tags.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              {showAuthor && wish.author ? (
                <Link
                  to={`/user/${wish.author}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium text-text-secondary hover:text-brand hover:underline transition-colors"
                >
                  by {wish.author}
                </Link>
              ) : null}
              <span>{formattedDate}</span>
            </div>

            {/* Support Action Button */}
            <button
              onClick={handleSupportClick}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm shrink-0 min-h-[32px] cursor-pointer ${
                isSupported
                  ? 'bg-red-500/10 text-red-500 border-red-500/30'
                  : 'bg-surface-elevated text-text-secondary hover:text-red-500 hover:border-red-300 border-border-app'
              }`}
              title={isSupported ? "You support this wish. Click to edit comment or withdraw support" : "Support this wish & add comment"}
            >
              <Heart className={`h-3.5 w-3.5 transition-colors ${isSupported ? 'fill-red-500 text-red-500' : 'text-text-muted group-hover:text-red-500'}`} />
              <span>{currentVotes} {currentVotes === 1 ? 'supporter' : 'supporters'}</span>
            </button>
          </div>
        </div>
      </div>

      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        wishId={wish.id}
        wishTitle={wish.title}
        crwtitle={wish.crwtitle}
        isAlreadySupported={isSupported}
        initialComment={userExistingComment}
      />
    </>
  );
}
