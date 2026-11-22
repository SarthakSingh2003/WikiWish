import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'wikiwish_local_supports';

export function useWishSupport() {
  const { user, isAuthenticated } = useAuth();
  const [supportedIds, setSupportedIds] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [voteDeltas, setVoteDeltas] = useState<Record<number, number>>({});

  // Sync with backend if user is logged in
  useEffect(() => {
    if (user?.username) {
      fetch(`/api/wishes/user-supports?username=${encodeURIComponent(user.username)}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data.supportedWishIds)) {
            setSupportedIds(prev => {
              const next = new Set([...prev, ...data.supportedWishIds]);
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
              } catch {}
              return next;
            });
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const toggleSupport = useCallback(async (wishId: number) => {
    const isCurrentlySupported = supportedIds.has(wishId);
    const newSupported = !isCurrentlySupported;

    // Optimistic UI update
    setSupportedIds(prev => {
      const next = new Set(prev);
      if (newSupported) {
        next.add(wishId);
      } else {
        next.delete(wishId);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });

    setVoteDeltas(prev => ({
      ...prev,
      [wishId]: (prev[wishId] || 0) + (newSupported ? 1 : -1),
    }));

    // Send to backend
    if (user?.username) {
      try {
        await fetch(`/api/wishes/${wishId}/support`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.username }),
        });
      } catch (err) {
        console.warn('Backend support sync failed:', err);
      }
    }
  }, [supportedIds, user]);

  const isSupported = useCallback((wishId: number) => {
    return supportedIds.has(wishId);
  }, [supportedIds]);

  const getVoteCount = useCallback((wishId: number, baseVotes: number = 0) => {
    return Math.max(0, baseVotes + (voteDeltas[wishId] || 0));
  }, [voteDeltas]);

  return {
    isSupported,
    toggleSupport,
    getVoteCount,
    supportedIds,
    isAuthenticated,
  };
}
