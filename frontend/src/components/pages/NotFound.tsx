import { Link } from 'react-router-dom';
import { Home, Search, AlertCircle } from 'lucide-react';

export function NotFound() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6">
          <AlertCircle className="h-16 w-16 text-secondary mx-auto" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Page not found</h1>
        <p className="text-secondary dark:text-secondary-dark mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Link>
          <Link
            to="/explore"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface dark:bg-surface-dark px-4 py-2 text-sm font-medium text-secondary hover:bg-accent/10 transition-colors"
          >
            <Search className="h-4 w-4 mr-2" />
            Explore Wishes
          </Link>
        </div>
      </div>
    </div>
  );
}