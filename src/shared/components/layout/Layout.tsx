import { lazy, Suspense, useState } from 'react';
import { ReactNode } from 'react';
import { SidebarLogo } from './SidebarLogo';
import { SidebarNav } from './SidebarNav';
import { SettingsPopover } from './SettingsPopover';
import { NewsButton } from './NewsButton';
import { typedChangelogDb } from '../../../core/typed-db/typedChangelogDb';

const NEWS_LAST_SEEN_KEY = "cipe_news_last_seen";

const NewsModal = lazy(() =>
  import('../../../features/news/NewsModal').then((m) => ({ default: m.NewsModal }))
);

function computeHasNew(): boolean {
  if (typedChangelogDb.length === 0) return false;
  return typedChangelogDb[0].date > (localStorage.getItem(NEWS_LAST_SEEN_KEY) ?? '');
}

export const Layout = ({ children }: { children: ReactNode }) => {
  const [newsOpen, setNewsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(computeHasNew);

  const handleOpenNews = () => {
    setNewsOpen(true);
    setHasNew(false);
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-50">
      <aside className="w-14 sm:w-16 tablet:w-20 bg-white dark:bg-slate-100 border-r border-slate-200 flex flex-col items-center justify-between py-5 tablet:py-8">
        <SidebarLogo />

        <SidebarNav />

        <div className="flex flex-col items-center gap-1">
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
