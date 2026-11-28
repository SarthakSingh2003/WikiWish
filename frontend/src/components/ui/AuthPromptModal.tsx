import { useEffect } from 'react';
import { ShieldCheck, X, Heart, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../../hooks/useAuth';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishTitle?: string;
  crwtitle?: string;
}

export function AuthPromptModal({ isOpen, onClose, wishTitle, crwtitle }: AuthPromptModalProps) {
  const { login } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const metaWikiVoteUrl = crwtitle
    ? `https://meta.wikimedia.org/wiki/${encodeURI(crwtitle.replace(/ /g, '_'))}#Voting`
    : 'https://meta.wikimedia.org/wiki/Community_Wishlist';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-prompt-modal-title"
        className="relative w-full max-w-md bg-surface border border-border-app rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-1.5 rounded-full hover:bg-surface-elevated transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
            <Heart className="h-6 w-6 fill-brand/20" />
          </div>
          <h2 id="auth-prompt-modal-title" className="text-xl sm:text-2xl font-extrabold text-text-primary">
            Support on Wikimedia
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {wishTitle ? (
              <>
                To officially support <span className="font-semibold text-text-primary">"{wishTitle}"</span> and publish your vote comment under CC BY-SA 4.0, sign in with your verified Wikimedia account or vote directly on Meta-Wiki.
              </>
            ) : (
              'Sign in with your verified Wikimedia account to record votes.'
            )}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Verified Official Sign In Button */}
          <Button
            onClick={login}
            className="w-full h-11 justify-center gap-2 text-sm font-semibold shadow-sm"
          >
            <ShieldCheck className="h-4 w-4" />
            Sign in with Wikimedia OAuth
          </Button>

          {/* Direct Link to Meta-Wiki Official Voting Popup */}
          <a
            href={metaWikiVoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              variant="outline"
              type="button"
              className="w-full h-11 justify-center gap-2 text-sm text-text-primary border-border-app hover:bg-surface-elevated"
            >
              <span>Support & Comment on Meta-Wiki</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>

        <p className="text-center text-xs text-text-muted">
          Only genuine, verified Wikimedia contributor votes are displayed on the Community Wishlist.
        </p>
      </div>
    </div>
  );
}
