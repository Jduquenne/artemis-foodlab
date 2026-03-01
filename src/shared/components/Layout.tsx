import { ReactNode, useRef, useState } from 'react';
import { UtensilsCrossed, CalendarDays, ShoppingCart, Download, Upload, Package, RefreshCw, Snowflake } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { exportData, importData } from '../../core/services/dataService';
import { ThemeToggle } from './ThemeToggle';
import { SyncModal } from '../../features/sync/SyncModal';

export const Layout = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [syncOpen, setSyncOpen] = useState(false);

    const navItems = [
        { icon: <UtensilsCrossed />, path: '/recipes', label: 'Recettes' },
        { icon: <CalendarDays />, path: '/planning', label: 'Menu' },
        { icon: <Package />, path: '/household', label: 'Quotidien' },
        { icon: <ShoppingCart />, path: '/shopping', label: 'Courses' },
        { icon: <Snowflake />, path: '/freezer', label: 'Congélateur' },
    ];

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-50">
            <aside className="w-14 sm:w-16 tablet:w-20 bg-white dark:bg-slate-100 border-r border-slate-200 flex flex-col items-center justify-between py-5 tablet:py-8">
                <div className="text-orange-500 font-bold text-lg tablet:text-xl select-none">AFL</div>

                <nav className="flex flex-col gap-3 tablet:gap-5">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            title={item.label}
                            className={`p-2.5 tablet:p-3 rounded-xl transition-colors ${
                                location.pathname.startsWith(item.path)
                                    ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200'
                            }`}
                        >
                            {item.icon}
                        </Link>
                    ))}
                </nav>

                <div className="flex flex-col items-center gap-2 tablet:gap-3">
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => e.target.files && importData(e.target.files[0])}
                    />
                    <button
                        onClick={exportData}
                        title="Sauvegarder mes données"
                        className="p-2.5 tablet:p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 hover:text-slate-600 rounded-xl transition-colors"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        title="Importer une sauvegarde"
                        className="p-2.5 tablet:p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 hover:text-slate-600 rounded-xl transition-colors"
                    >
                        <Upload className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setSyncOpen(true)}
                        title="Synchroniser avec un autre appareil"
                        className="p-2.5 tablet:p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200 hover:text-slate-600 rounded-xl transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <ThemeToggle />
                </div>
            </aside>
            {syncOpen && <SyncModal onClose={() => setSyncOpen(false)} />}

            <main className="flex-1 min-w-0 overflow-y-auto p-4 tablet:p-8">
                {children}
            </main>
        </div>
    );
};
