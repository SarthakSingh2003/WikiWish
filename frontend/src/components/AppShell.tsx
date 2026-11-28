import { ReactNode, useRef } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';
import { ScrollToTopButton } from './ScrollToTopButton';
import { useLocation } from 'react-router-dom';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const mainRef = useRef<HTMLElement>(null);

  return (
    <div className="flex flex-col min-h-screen h-[100dvh] bg-background text-text-primary overflow-hidden">
      {/* Top Navbar */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar (>= 768px) */}
        {!isHomePage && <Sidebar />}

        {/* Scrollable Main Viewport with mobile bottom navigation offset */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto overscroll-contain pb-20 md:pb-6 focus:outline-none"
        >
          {children}
        </main>
      </div>

      <ScrollToTopButton containerRef={mainRef} />

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <MobileNavigation />
    </div>
  );
}
