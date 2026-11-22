import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import { AppShell } from './components/AppShell';
import { Home } from './components/pages/Home';
import { Dashboard } from './components/pages/Dashboard';
import { CreatedWishes } from './components/pages/CreatedWishes';
import { SupportedWishes } from './components/pages/SupportedWishes';
import { Explore } from './components/pages/Explore';
import { UserExplorer } from './components/pages/UserExplorer';
import { WishDetails } from './components/pages/WishDetails';
import { About } from './components/pages/About';
import { NotFound } from './components/pages/NotFound';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AppShell><Home /></AppShell>} />
          <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
          <Route path="/dashboard/created" element={<AppShell><CreatedWishes /></AppShell>} />
          <Route path="/dashboard/supported" element={<AppShell><SupportedWishes /></AppShell>} />
          <Route path="/explore" element={<AppShell><Explore /></AppShell>} />
          <Route path="/user" element={<AppShell><UserExplorer /></AppShell>} />
          <Route path="/user/:username" element={<AppShell><UserExplorer /></AppShell>} />
          <Route path="/wish/:id" element={<AppShell><WishDetails /></AppShell>} />
          <Route path="/about" element={<AppShell><About /></AppShell>} />
          <Route path="/not-found" element={<AppShell><NotFound /></AppShell>} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
