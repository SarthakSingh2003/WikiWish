import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, List, Users, Activity, Search, ShieldCheck, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { WikiWish } from '../../types/wish';
import { WishCard } from '../WishCard';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';

type FilterTab = 'created' | 'supported';
export type WishSortOption = 'updated-desc' | 'votes-desc' | 'votes-asc' | 'newest' | 'oldest' | 'title-asc';

export function Dashboard() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<FilterTab>('created');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<WishSortOption>('updated-desc');

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-dashboard', user?.username],
    queryFn: async () => {
      if (!user?.username) return null;
      const response = await fetch(`/api/users/${encodeURIComponent(user.username)}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard activity');
      return response.json();
    },
    enabled: !!user?.username,
    staleTime: 2 * 60 * 1000,
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[65vh] px-4">
        <div className="text-center space-y-6 max-w-md w-full bg-surface border border-border-app p-8 rounded-2xl shadow-sm">
          <div className="flex justify-center">
            <img
              src="/wikiwish.png"
              alt="WikiWish Logo"
              className="h-16 w-16 object-contain rounded-2xl shadow-sm p-2 bg-surface-elevated border border-border-app"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              Access your Dashboard
            </h1>
            <p className="text-text-secondary text-sm leading-relaxed">
              Sign in with your verified Wikimedia account to track your Community Wishlist submissions and supported requests.
            </p>
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              onClick={login}
              className="w-full h-11 justify-center gap-2 font-semibold shadow-sm"
            >
              <ShieldCheck className="h-4 w-4" />
              Sign in with Wikimedia OAuth
            </Button>
          </div>

          <p className="text-xs text-text-muted">
            Official Wikimedia OAuth 1.0a authentication ensures genuine contributor verification.
          </p>
        </div>
      </div>
    );
  }

  const rawWishes: WikiWish[] = (data?.[activeTab] || []) as WikiWish[];
  const createdCount = data?.statistics?.created ?? (data?.created?.length || 0);
  const supportedCount = data?.statistics?.supported ?? (data?.supported?.length || 0);
  const totalActivity = createdCount + supportedCount;

  const filteredWishes = searchQuery.trim()
    ? rawWishes.filter(w =>
        (w.title && w.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (w.crwtitle && w.crwtitle.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : rawWishes;

  const sortedWishes = useMemo(() => {
    const list = [...filteredWishes];
    list.sort((a, b) => {
      const votesA = typeof a.votecount === 'number' ? a.votecount : 0;
      const votesB = typeof b.votecount === 'number' ? b.votecount : 0;

      if (sortBy === 'updated-desc') {
        const timeB = new Date(b.updated || b.created || 0).getTime();
        const timeA = new Date(a.updated || a.created || 0).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'votes-desc') {
        return votesB - votesA;
      }
      if (sortBy === 'votes-asc') {
        return votesA - votesB;
      }
      if (sortBy === 'newest') {
        return new Date(b.created || 0).getTime() - new Date(a.created || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created || 0).getTime() - new Date(b.created || 0).getTime();
      }
      if (sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
    return list;
  }, [filteredWishes, sortBy]);

  return (
    <div className="max-w-5xl mx-auto px-3.5 py-6 sm:px-6 sm:py-10 lg:px-8 space-y-8 sm:space-y-12 animate-in fade-in duration-300">
      {/* Header & Accurate Stats */}
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1 text-sm sm:text-base">
            Logged in as <span className="font-semibold text-text-primary">{user.displayName || user.username}</span>. Explore and manage your wishlist activity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          <StatCard
            icon={Heart}
            label="Created Wishes"
            value={createdCount}
            color="text-red-500"
            bgColor="bg-red-50 dark:bg-red-500/10"
          />
          <StatCard
            icon={Users}
            label="Supported Wishes"
            value={supportedCount}
            color="text-blue-500"
            bgColor="bg-blue-50 dark:bg-blue-500/10"
          />
          <StatCard
            icon={Activity}
            label="Total Activity"
            value={totalActivity}
            color="text-brand"
            bgColor="bg-brand/5 dark:bg-brand/10"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-border-app pb-4">
          <div className="flex flex-col sm:flex-row p-1 bg-surface-elevated rounded-xl w-full sm:w-fit border border-border-app gap-1 sm:gap-0">
            <TabButton
              active={activeTab === 'created'}
              onClick={() => setActiveTab('created')}
              label={`Created (${createdCount})`}
              icon={Heart}
            />
            <TabButton
              active={activeTab === 'supported'}
              onClick={() => setActiveTab('supported')}
              label={`Supported (${supportedCount})`}
              icon={List}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <div className="relative group min-w-[200px] sm:min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-brand transition-colors" />
              <input
                type="text"
                placeholder="Search wishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border-app rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all shadow-sm"
              />
            </div>

            <div className="relative shrink-0">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as WishSortOption)}
                aria-label="Sort wishes"
                className="w-full sm:w-auto bg-surface border border-border-app rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all shadow-sm cursor-pointer appearance-none"
              >
                <option value="updated-desc">Most Recent Activity</option>
                <option value="votes-desc">Support Votes (High to Low)</option>
                <option value="votes-asc">Support Votes (Low to High)</option>
                <option value="newest">Creation Date (Newest first)</option>
                <option value="oldest">Creation Date (Oldest first)</option>
                <option value="title-asc">Title (A to Z)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton count={3} />
        ) : error ? (
          <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl">
            <p className="text-red-600 dark:text-red-400 font-medium">Failed to load wishes from Meta-Wiki. Please try again later.</p>
          </div>
        ) : sortedWishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedWishes.map((wish, index) => (
              <div
                key={wish.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300 fill-mode-both"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <WishCard wish={wish} showAuthor={activeTab === 'supported'} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No wishes yet"
            description={
              searchQuery
                ? 'No wishes match your search query.'
                : activeTab === 'created'
                ? "You haven't submitted any wishes to the Community Wishlist yet."
                : "You haven't supported any Community Wishlist wishes yet."
            }
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor }: any) {
  return (
    <div className="p-6 rounded-2xl border border-border-app bg-surface shadow-sm space-y-4">
      <div className={`p-3 rounded-xl w-fit ${bgColor} ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-text-primary mt-1">{value}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg text-sm font-semibold transition-all ${
        active
          ? 'bg-surface text-brand shadow-sm border border-border-app font-bold'
          : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
