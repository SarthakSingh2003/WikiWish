import { useEffect, RefObject } from 'react';

interface KeyboardShortcutsConfig {
  searchInputRef: RefObject<HTMLInputElement | null>;
  onClearSearch?: () => void;
  closeModal?: () => boolean;
  onToggleShortcutsModal: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true;
  }
  return target.isContentEditable;
}

export function useKeyboardShortcuts({
  searchInputRef,
  onClearSearch,
  closeModal,
  onToggleShortcutsModal,
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const key = event.key;
      const typing = isTypingTarget(event.target);

      // Escape: always active (even inside inputs)
      if (key === 'Escape') {
        // Priority 1: close the page's open modal (e.g. ShortcutsModal)
        if (closeModal?.()) {
          event.preventDefault();
          return;
        }
        // Priority 2: if another dialog (e.g. SupportModal) is open, let it handle Escape
        if (document.querySelector('[role="dialog"][aria-modal="true"]')) {
          return;
        }
        // Priority 3: clear search and blur
        if (onClearSearch) {
          onClearSearch();
        }
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
        return;
      }

      // All other shortcuts are suppressed while typing
      if (typing) return;

      // "/" -> focus search (when no dialog is open)
      if (key === '/') {
        if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // "?" -> open cheat-sheet (Shift+/ on US layout)
      if (key === '?') {
        event.preventDefault();
        onToggleShortcutsModal();
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchInputRef, onClearSearch, closeModal, onToggleShortcutsModal]);
}
