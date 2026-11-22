import { Link } from 'react-router-dom';
import { Heart, Globe, BarChart3, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export function Home() {
  const { user, login } = useAuth();

  return (
    <div className="flex flex-col min-h-full bg-background text-text-primary">
      {/* Hero Section */}
      <section className="relative px-4 py-12 sm:py-20 lg:py-28 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-brand/5 to-transparent -z-10" />

        <div className="max-w-3xl space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="flex flex-col items-center gap-3">
            <img
              src="/wikiwish.png"
              alt="WikiWish Logo"
              className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 object-contain rounded-2xl shadow-xl ring-1 ring-border-app p-2 bg-surface/90 backdrop-blur-sm animate-in zoom-in-95 duration-500"
            />
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 sm:px-4 py-1 text-xs font-semibold text-brand">
              <Star className="h-3 w-3" />
              <span>Discover what the community wants</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.15]">
            Your wishes, all in <span className="text-brand">one place.</span>
          </h1>

          <p className="text-sm sm:text-lg lg:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed px-2">
            Explore, track, and discover your contributions to the Wikimedia Community Wishlist. A modern, responsive dashboard for the movement's most important requests.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 max-w-md sm:max-w-none mx-auto w-full">
            {user ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-sm justify-center">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-sm justify-center" onClick={login}>
                <span>Sign in with Wikimedia</span>
                <ShieldCheck className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
              </Button>
            )}
            <Link to="/explore" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base border-border-app bg-surface hover:bg-surface-elevated font-semibold justify-center">
                Explore wishes
              </Button>
            </Link>
          </div>
        </div>

        {/* Subtle Decorative Grid */}
        <div className="absolute top-0 -z-20 h-full w-full opacity-15 sm:opacity-20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px] sm:bg-[size:24px_24px]" />
      </section>

      {/* Feature Sections */}
      <section className="px-4 py-12 sm:py-20 border-t border-border-app bg-surface/50">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <FeatureCard
              icon={BarChart3}
              title="Personal Dashboard"
              description="A clean, unified view of all your wishlist interactions. Track the progress of every wish you care about."
            />
            <FeatureCard
              icon={Heart}
              title="Track Contributions"
              description="Instantly filter wishes created or supported by you. No more hunting through wikitext logs."
              color="text-red-500"
            />
            <FeatureCard
              icon={Globe}
              title="Community Insights"
              description="Explore what others are wishing for. Discover trends and focus areas across the entire movement."
              color="text-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-4 py-8 sm:py-12 border-t border-border-app text-center">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex items-center justify-center gap-2">
            <img src="/wikiwish.png" alt="WikiWish Logo" className="h-5 w-5 sm:h-6 sm:w-6 object-contain rounded-md" />
            <p className="text-lg sm:text-xl font-bold tracking-tight text-text-primary">WikiWish</p>
          </div>
          <div className="flex justify-center gap-6 text-xs sm:text-sm text-text-muted">
            <Link to="/about" className="hover:text-text-primary transition-colors">About</Link>
            <Link to="/explore" className="hover:text-text-primary transition-colors">Discover</Link>
            <a href="https://meta.wikimedia.org/wiki/Community_Wishlist" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">Meta-Wiki</a>
          </div>
          <p className="text-[11px] sm:text-xs text-text-muted pt-4 border-t border-border-app/50 max-w-lg mx-auto leading-relaxed">
            WikiWish is an independent community-built tool and is not affiliated with or endorsed by the Wikimedia Foundation.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color = "text-brand" }: any) {
  return (
    <div className="group relative flex flex-col gap-3 sm:gap-4 p-5 sm:p-7 rounded-2xl border border-border-app bg-surface card-hover hover:border-brand/30 hover:shadow-subtle transition-all">
      <div className={`rounded-xl bg-background p-2.5 sm:p-3 w-fit ${color} border border-border-app/40`}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-text-primary">{title}</h3>
      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}
