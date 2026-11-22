import { useLocation, Link } from 'react-router-dom';
import { Home, LayoutDashboard, Search, Info, Users } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Discover', href: '/explore', icon: Search },
    { name: 'Contributors', href: '/user', icon: Users },
    { name: 'About', href: '/about', icon: Info },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col gap-1 border-r border-border-app bg-surface p-4">
      <nav className="flex w-full flex-col gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/user'
            ? location.pathname.startsWith('/user')
            : location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-brand/10 text-brand shadow-sm font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
