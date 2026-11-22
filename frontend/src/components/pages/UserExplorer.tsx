import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, User, Heart, List, Users, ExternalLink } from 'lucide-react';
import { WikiWish } from '../../types/wish';
import { WishCard } from '../WishCard';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';

type TabType = 'created' | 'supported';

export function UserExplorer() {
  const { username: paramUsername } = useParams<{ username?: string }>();
  const [username, setUsername] = useState(paramUsername || '');
  const [searchUsername, setSearchUsername] = useState(paramUsername || '');
  const [activeTab, setActiveTab] = useState<TabType>('created');

  useEffect(() => {
    if (paramUsername) {
      setUsername(paramUsername);
      setSearchUsername(paramUsername);
    }
  }, [paramUsername]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed) {
      setSearchUsername(trimmed);
      setActiveTab('created');
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['user', searchUsername],
    queryFn: async () => {
      if (!searchUsername) return null;
      const response = await fetch(`/api/users/${encodeURIComponent(searchUsername)}`);
      if (!response.ok) throw new Error('User not found');
      return response.json();
    },
    enabled: !!searchUsername,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="max-w-5xl mx-auto px-3.5 py-6 sm:px-6 sm:py-10 lg:px-8 space-y-8 sm:space-y-10 animate-in fade-in duration-300">
      <div className="space-y-5 sm:space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand mb-3">
            <Users className="h-3.5 w-3.5" />
            Wikimedia Contributors
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Explore Contributors
          </h1>
          <p className="text-text-secondary mt-1.5 text-sm sm:text-base leading-relaxed">
            Search for any Wikimedia contributor to see their Community Wishlist activity, submitted proposals, and support votes.
          </p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-xl w-full">
          <div className="relative group flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-brand transition-colors" />
            <input
              type="text"
              placeholder="Enter Wikimedia username..."
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-surface border border-border-app rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all shadow-sm"
              autoFocus={!paramUsername}
            />
          </div>
          <Button type="submit" disabled={isLoading || !username.trim()} className="w-full sm:w-auto h-11 sm:h-auto justify-center px-6">
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <div className="p-8 sm:p-12 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl">
          <p className="text-red-600 dark:text-red-400 font-semibold text-base sm:text-lg">Contributor Not Found</p>
          <p className="text-text-muted text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Unable to locate Community Wishlist activity for "{searchUsername}". Verify the username matches Meta-Wiki.
          </p>
        </div>
      ) : data ? (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-400">
          {/* Contributor Profile Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 p-5 sm:p-8 rounded-2xl border border-border-app bg-surface shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left w-full sm:w-auto">
              <div className="h-16 w-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                <User className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary break-all">{data.username}</h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 sm:gap-4 text-xs font-medium text-text-muted">
                  <div className="flex items-center gap-1.5 bg-surface-elevated px-2.5 py-1 rounded-lg border border-border-app">
                    <Heart className="h-3.5 w-3.5 text-red-500" />
                    <span>{data.statistics?.created || 0} created</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface-elevated px-2.5 py-1 rounded-lg border border-border-app">
                    <Users className="h-3.5 w-3.5 text-brand" />
                    <span>{data.statistics?.supported || 0} supported</span>
                  </div>
                </div>
              </div>
            </div>

            <a
              href={`https://meta.wikimedia.org/wiki/User:${encodeURIComponent(data.username)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl flex items-center justify-center gap-2 border-border-app h-10 sm:h-9">
                <span>Meta-Wiki Profile</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>

          {/* Activity Tabs */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row p-1 bg-surface-elevated rounded-xl w-full sm:w-fit border border-border-app gap-1 sm:gap-0">
              <button
                onClick={() => setActiveTab('created')}
                className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'created'
                    ? 'bg-surface text-brand shadow-sm border border-border-app font-bold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Heart className="h-4 w-4 text-red-500" />
                <span>Created Wishes ({data.created?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab('supported')}
                className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'supported'
                    ? 'bg-surface text-brand shadow-sm border border-border-app font-bold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <List className="h-4 w-4 text-brand" />
                <span>Supported Wishes ({data.supported?.length || 0})</span>
              </button>
            </div>

            {data[activeTab]?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data[activeTab].map((wish: WikiWish) => (
                  <WishCard key={wish.id} wish={wish} showAuthor={activeTab === 'supported'} />
                ))}
              </div>
            ) : (
              <div className="bg-surface rounded-2xl border border-border-app p-8 shadow-sm">
                <EmptyState
                  title="No activity found"
                  description={`This contributor has not ${
                    activeTab === 'created' ? 'submitted' : 'supported'
                  } any Community Wishlist requests.`}
                  icon="search"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border-app p-10 text-center space-y-4 shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Search for Any Contributor</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Enter a Wikimedia username above to view their submitted wishes, voted proposals, and wishlist contribution history.
          </p>
        </div>
      )}
    </div>
  );
}
