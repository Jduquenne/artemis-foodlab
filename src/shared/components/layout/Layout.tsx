import { lazy, Suspense, useState } from 'react';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarLink } from './SidebarLink';
import { BarChart3, ChefHat } from 'lucide-react';
import { SidebarLogo } from './SidebarLogo';
import { SidebarNav } from './SidebarNav';
import { SettingsPopover } from './SettingsPopover';
import { NewsButton } from './NewsButton';
import { DemoBanner } from './DemoBanner';
import { useNewsStore } from '../../store/useNewsStore';
import { useIsAdmin } from '../../hooks/useIsAdmin';
import { useAppRefresh } from '../../hooks/useAppRefresh';
import { useAuthStore } from '../../store/useAuthStore';

const NewsModal = lazy(() =>
  import('../../../features/news/NewsModal').then((m) => ({ default: m.NewsModal }))
);

export const Layout = ({ children }: { children: ReactNode }) => {
  const [newsOpen, setNewsOpen] = useState(false);
  const { hasNew, markAsSeen } = useNewsStore();
  const isAdmin = useIsAdmin();
  const demoExpiresAt = useAuthStore((s) => (s.user?.isDemo ? s.user.demoExpiresAt : null));
  useAppRefresh();
  const location = useLocation();

  const handleOpenNews = () => {
    setNewsOpen(true);
    markAsSeen();
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-50">
      <aside className="w-14 sm:w-16 tablet:w-20 bg-surface border-r border-slate-200 flex flex-col items-center justify-between py-5 tablet:py-8">
        <SidebarLogo />

        <SidebarNav />

        <div className="flex flex-col items-center gap-1">
          {isAdmin && (
            <SidebarLink to="/recipe-builder" label="Créateur de recette" icon={<ChefHat className="w-5 h-5" />} active={location.pathname.startsWith('/recipe-builder')} />
          )}
          {isAdmin && (
            <SidebarLink to="/dashboard" label="Dashboard" icon={<BarChart3 className="w-5 h-5" />} active={location.pathname.startsWith('/dashboard')} />
          )}
          <NewsButton hasNew={hasNew} onOpen={handleOpenNews} />
          <SettingsPopover />
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {demoExpiresAt && <DemoBanner expiresAt={demoExpiresAt} />}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 tablet:p-8">
          {children}
        </main>
      </div>

      <Suspense>
        {newsOpen && <NewsModal onClose={() => setNewsOpen(false)} />}
      </Suspense>
    </div>
  );
};
