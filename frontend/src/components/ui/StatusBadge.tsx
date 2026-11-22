interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  'under-review': { label: 'Under Review', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200 dark:border-blue-800' },
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200 border border-green-200 dark:border-green-800' },
  'done': { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200 border border-green-200 dark:border-green-800' },
  'declined': { label: 'Declined', color: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200 border border-red-200 dark:border-red-800' },
  'needs-clarification': { label: 'Needs Clarification', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800' },
  'community-opportunity': { label: 'Community Opportunity', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border border-purple-200 dark:border-purple-800' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const norm = (status || '').toLowerCase();
  const config = statusConfig[norm] || {
    label: status ? status.replace(/-/g, ' ') : 'Unknown',
    color: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${config.color}`}>
      {config.label}
    </span>
  );
}
