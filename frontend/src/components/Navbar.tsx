import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Info, LayoutDashboard, Users, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/Button';

export function Navbar() {
  const location = useLocation();
  const { user, logout, login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Discover', href: '/explore', icon: Search },
    { name: 'Contributors', href: '/user', icon: Users },
    { name: 'About', href: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-surface/90 backdrop-blur-md border-border-app">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 max-w-7xl mx-auto">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link to="/" className="text-lg sm:text-xl font-extrabold tracking-tight text-text-primary flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <img
              src="/wikiwish.png"
              alt="WikiWish Logo"
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain rounded-lg transition-transform group-hover:scale-105"
            />
            <span className="truncate max-w-[140px] xs:max-w-none">WikiWish</span>
          </Link>

          {/* Desktop Nav Links (>= 1024px) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/user'
                ? location.pathname.startsWith('/user')
                : location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-brand/10 text-brand'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side Actions (Theme Toggle & Auth) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-xl border border-border-app/50 h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </Button>

          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link to={`/user/${user.username}`}>
                {/* Desktop User Pill */}
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-1.5 text-xs font-semibold px-2.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="max-w-[120px] truncate">{user.displayName || user.username}</span>
                </Button>

                {/* Mobile User Avatar */}
                <div
                  className="sm:hidden flex items-center justify-center h-8 w-8 rounded-xl bg-brand/10 border border-brand/20 text-brand font-bold text-xs"
                  title={user.username}
                >
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
              </Link>

              {/* Sign out button */}
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="rounded-xl text-xs border-border-app h-8 sm:h-9 px-2.5 sm:px-3 flex items-center gap-1"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5 sm:hidden" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          ) : (
            <Link to="/dashboard">
              <Button
                size="sm"
                className="rounded-xl text-xs font-semibold h-8 sm:h-9 px-3 sm:px-4"
              >
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
