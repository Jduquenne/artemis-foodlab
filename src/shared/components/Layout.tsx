import { ReactNode, useRef } from 'react';
import { UtensilsCrossed, CalendarDays, ShoppingCart, Download, Upload, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { exportData, importData } from '../../core/services/dataService';
import { ThemeToggle } from './ThemeToggle';

export const Layout = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const navItems = [
        { icon: <UtensilsCrossed />, path: '/recipes', label: 'Recettes' },
        { icon: <Package />, path: '/household', label: 'Quotidien' },
        { icon: <CalendarDays />, path: '/planning', label: 'Menu' },
        { icon: <ShoppingCart />, path: '/shopping', label: 'Courses' },
    ];

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-50">
            {/* ASIDE - Menu latéral (Icônes uniquement) */}
            <aside className="w-16 tablet:w-20 bg-white dark:bg-slate-100 border-r border-slate-200 flex flex-col items-center py-8 gap-8">
                <div className="text-orange-500 font-bold text-xl">AFL</div>
                <nav className="flex flex-col gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`p-3 rounded-xl transition-colors ${location.pathname.startsWith(item.path)
                                ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-200'
                                }`}
                        >
                            {item.icon}
                        </Link>
                    ))}
                </nav>
                <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => e.target.files && importData(e.target.files[0])}
                />
                <div className="mt-auto mb-8 flex flex-col gap-4">
                    <button
                        onClick={exportData}
                        title="Sauvegarder mes données"
                        className="p-3 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"
                    >
                        <Download className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        title="Importer une sauvegarde"
                        className="p-3 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"
                    >
                        <Upload className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* HEADER */}
                <header className="h-16 bg-white dark:bg-slate-100 border-b border-slate-200 flex items-center px-6 justify-between">
                    <div className="flex-1 max-w-md relative">
                        {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Chercher une recette..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        /> */}
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                            VP
                        </div>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="flex-1 overflow-y-auto  p-4 tablet:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};