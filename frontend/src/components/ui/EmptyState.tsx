import { Heart, Search, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: 'heart' | 'search' | 'alert';
}

export function EmptyState({
  title,
  description,
  action,
  icon = 'heart',
}: EmptyStateProps) {
  const icons = {
    heart: <Heart className="h-12 w-12 text-secondary" />,
    search: <Search className="h-12 w-12 text-secondary" />,
    alert: <AlertCircle className="h-12 w-12 text-secondary" />,
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">{icons[icon]}</div>
      <h3 className="text-xl font-semibold text-foreground dark:text-foreground-dark mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-secondary dark:text-secondary-dark mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}