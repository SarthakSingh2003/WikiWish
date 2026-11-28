import { useEffect, useRef } from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ['/'], description: 'Focus the search bar' },
  { keys: ['Esc'], description: 'Close modal or clear search' },
  { keys: ['?'], description: 'Open this shortcut guide' },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      closeButtonRef.current?.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
        className="relative w-full max-w-sm bg-surface border border-border-app rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-text-muted hover:text-text-primary p-2 rounded-full hover:bg-surface-elevated transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="pr-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="rounded-xl bg-brand/10 border border-brand/20 p-2 text-brand">
              <Keyboard className="h-5 w-5" />
            </div>
          </div>
          <h2
            id="shortcuts-modal-title"
            className="text-lg sm:text-xl font-extrabold text-text-primary"
          >
            Keyboard Shortcuts
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Navigate WikiWish faster with these shortcuts.
          </p>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2">
          {SHORTCUTS.map(shortcut => (
            <div
              key={shortcut.description}
              className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/40 border border-border-app"
            >
              <span className="text-sm text-text-primary font-medium">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1 shrink-0 ml-3">
                {shortcut.keys.map(key => (
                  <kbd
                    key={key}
                    className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg border border-border-app bg-background text-xs font-mono font-semibold text-text-primary shadow-sm"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <p className="text-[11px] text-text-muted text-center pt-1">
          Shortcuts are disabled while typing in an input field.
        </p>
      </div>
    </div>
  );
}
