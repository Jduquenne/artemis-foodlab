import { ReactNode } from 'react';
import { SidebarLogo } from './SidebarLogo';
import { SidebarNav } from './SidebarNav';
import { SettingsPopover } from './SettingsPopover';

export const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex h-dvh w-full overflow-hidden bg-slate-50">
            <aside className="w-14 sm:w-16 tablet:w-20 bg-white dark:bg-slate-100 border-r border-slate-200 flex flex-col items-center justify-between py-5 tablet:py-8">
                <SidebarLogo />

                <SidebarNav />

                <SettingsPopover />
            </aside>

            <main className="flex-1 min-w-0 overflow-y-auto p-4 tablet:p-8">
                {children}
            </main>
        </div>
    );
};
