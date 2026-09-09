import { lazy, Suspense, useState } from 'react';
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { SidebarLogo } from './SidebarLogo';
import { SidebarNav } from './SidebarNav';
import { SettingsPopover } from './SettingsPopover';
import { NewsButton } from './NewsButton';
import { useNewsStore } from '../../store/useNewsStore';
import { useIsAdmin } from '../../hooks/useIsAdmin';

const NewsModal = lazy(() =>
  import('../../../features/news/NewsModal').then((m) => ({ default: m.NewsModal }))
);

export const Layout = ({ children }: { children: ReactNode }) => {
  const [newsOpen, setNewsOpen] = useState(false);
  const { hasNew, markAsSeen } = useNewsStore();
  const isAdmin = useIsAdmin();
  const location = useLocation();

  const handleOpenNews = () => {
    setNewsOpen(true);
    markAsSeen();
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-50">
      <aside className="w-14 sm:w-16 tablet:w-20 bg-white dark:bg-slate-100 border-r border-slate-200 flex flex-col items-center justify-between py-5 tablet:py-8">
        <SidebarLogo />

        <SidebarNav />

        <div className="flex flex-col items-center gap-1">
          {isAdmin && (
            <Link
              to="/dashboard"
              title="Dashboard"
              className={`p-2.5 tablet:p-3 rounded-xl transition-colors ${
                location.pathname.startsWith('/dashboard')
                  ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
            </Link>
          )}
          <NewsButton hasNew={hasNew} onOpen={handleOpenNews} />
          <SettingsPopover />
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto p-4 tablet:p-8">
        {children}
      </main>

      <Suspense>
        {newsOpen && <NewsModal onClose={() => setNewsOpen(false)} />}
      </Suspense>
    </div>
  );
};
