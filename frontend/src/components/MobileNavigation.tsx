import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Search, Info, Users } from 'lucide-react';
import { cn } from '../lib/utils';

export function MobileNavigation() {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Discover', href: '/explore', icon: Search },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'People', href: '/user', icon: Users },
    { name: 'About', href: '/about', icon: Info },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border-app bg-surface/95 backdrop-blur-lg px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-around"
    >
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === '/user'
          ? location.pathname.startsWith('/user')
          : location.pathname === item.href;

        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-150 min-h-[44px] min-w-[56px] select-none',
              isActive
                ? 'text-brand font-bold bg-brand/10'
                : 'text-text-muted hover:text-text-primary active:scale-95'
            )}
          >
            <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
