import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Sparkles, X, ArrowUpDown, Tag, RefreshCw, PlusCircle, ExternalLink } from 'lucide-react';
import { WikiWish } from '../../types/wish';
import { WishCard } from '../WishCard';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'community-opportunity', label: 'Community Opportunity' },
  { value: 'needs-clarification', label: 'Needs Clarification' },
  { value: 'declined', label: 'Declined' },
];

type SortOption = 'updated-desc' | 'votes-desc' | 'votes-asc' | 'newest' | 'oldest' | 'title-asc';

export function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('votes-desc');

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['explore-wishes'],
    queryFn: async () => {
      const response = await fetch('/api/wishes?limit=1000');
      if (!response.ok) throw new Error('Failed to load wishes from Wikimedia API');
      return response.json();
    },
    staleTime: 3 * 60 * 1000,
  });

  const allWishes: WikiWish[] = useMemo(() => data?.wishes || [], [data]);

  // Extract popular & available tags directly from real wish data
  const availableTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    allWishes.forEach(w => {
      if (Array.isArray(w.tags)) {
        w.tags.forEach(t => {
          const norm = t.trim().toLowerCase();
          if (norm) {
            tagCounts.set(norm, (tagCounts.get(norm) || 0) + 1);
          }
        });
      }
    });

    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag]) => tag);

    return ['all', ...sortedTags];
  }, [allWishes]);

  const filteredWishes = useMemo(() => {
    let result = [...allWishes];

    // Search query filter (matches title, description, tags, author, crwtitle)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(wish =>
        (wish.title && wish.title.toLowerCase().includes(q)) ||
        (wish.description && wish.description.toLowerCase().includes(q)) ||
        (wish.crwtitle && wish.crwtitle.toLowerCase().includes(q)) ||
        (wish.tags && wish.tags.some(t => t.toLowerCase().includes(q))) ||
        (wish.author && wish.author.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter(wish => {
        const wishStatus = (wish.status || '').toLowerCase();
        if (selectedStatus === 'completed') {
          return wishStatus === 'completed' || wishStatus === 'done';
        }
        return wishStatus === selectedStatus.toLowerCase();
      });
    }

    // Tag filter
    if (selectedTag !== 'all') {
      result = result.filter(wish =>
        wish.tags && wish.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Sorting
    result.sort((a, b) => {
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

    return result;
  }, [allWishes, searchQuery, selectedStatus, selectedTag, sortBy]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedStatus !== 'all' || selectedTag !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedTag('all');
    setSortBy('votes-desc');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-border-app pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand mb-2.5 sm:mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Wikimedia Meta-Wiki Live Feed</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Discover Wishes
          </h1>
          <p className="text-text-secondary mt-1.5 sm:mt-2 text-xs sm:text-base max-w-2xl leading-relaxed">
            Live requests submitted to the Wikimedia Community Wishlist. Explore wishes, verify community vote counts, and filter by status and category.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <a
            href="https://meta.wikimedia.org/wiki/Special:WishlistIntake"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial"
          >
            <Button
              size="sm"
              className="w-full sm:w-auto bg-brand hover:bg-brand/90 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm h-9 sm:h-9"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Submit a Wish</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Button>
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex-1 sm:flex-initial border-border-app text-text-secondary hover:text-text-primary flex items-center justify-center gap-2 h-9 sm:h-9"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Sync from Meta-Wiki</span>
          </Button>
          <div className="text-xs sm:text-sm font-medium text-text-muted bg-surface border border-border-app rounded-lg px-3 py-1.5 shadow-sm text-center hidden sm:block">
            {allWishes.length > 0 ? `${filteredWishes.length} of ${allWishes.length} wishes` : 'Connecting...'}
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="space-y-3.5 sm:space-y-4 bg-surface p-4 sm:p-5 rounded-2xl border border-border-app shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2.5 sm:gap-3">
          {/* Search Bar */}
          <div className="relative group sm:col-span-2 lg:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-brand transition-colors" />
            <input
              type="text"
              placeholder="Search by title, wish ID (e.g. W934), description, or tag..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border-app rounded-xl pl-10 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded-full"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2 lg:w-52">
            <Filter className="h-4 w-4 text-text-muted hidden sm:block shrink-0" />
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              aria-label="Filter by Status"
              className="w-full bg-background border border-border-app rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all cursor-pointer"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 lg:w-52">
            <ArrowUpDown className="h-4 w-4 text-text-muted hidden sm:block shrink-0" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              aria-label="Sort wishes"
              className="w-full bg-background border border-border-app rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all cursor-pointer"
            >
              <option value="updated-desc">Most Recent Activity</option>
              <option value="votes-desc">Most Supported</option>
              <option value="votes-asc">Least Supported</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Live Tag Filters */}
        <div className="flex items-center gap-2 pt-2 border-t border-border-app overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Tag className="h-3 w-3" />
            Tags:
          </span>
          {availableTags.map(tag => {
            const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full font-medium transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-brand text-white shadow-sm'
                    : 'bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-border-hover border border-border-app'
                }`}
              >
                {tag === 'all' ? 'All Tags' : tag.replace(/-/g, ' ')}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[11px] sm:text-xs text-brand hover:underline font-semibold ml-auto flex items-center gap-1 py-1 shrink-0 whitespace-nowrap"
            >
              <X className="h-3 w-3" />
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : error ? (
        <div className="p-12 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl">
          <p className="text-red-600 dark:text-red-400 font-medium text-lg">Unable to load Community Wishes</p>
          <p className="text-text-muted text-sm mt-1 max-w-md mx-auto">
            Please make sure the backend server is running and connected to Meta-Wiki.
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : filteredWishes.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border-app p-8 shadow-sm">
          <EmptyState
            title="No wishes match your criteria"
            description={
              hasActiveFilters
                ? 'Try broadening your search keyword or clearing the active status and tag filters.'
                : 'No community wishes found at this time.'
            }
            action={
              hasActiveFilters
                ? {
                    label: 'Clear all filters',
                    onClick: clearFilters,
                  }
                : undefined
            }
            icon="search"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWishes.map(wish => (
            <WishCard key={wish.id} wish={wish} showAuthor={true} />
          ))}
        </div>
      )}
    </div>
  );
}
