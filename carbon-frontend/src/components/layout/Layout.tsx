import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Database, Factory, FileText, Users, Settings, ScrollText, LogOut, Menu, Bell, User as UserIcon, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();

    // Force light theme for this exact match
    const { setTheme } = useTheme();
    React.useEffect(() => {
        setTheme('light');
    }, [setTheme]);

    const ownerNav = [
        { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Facilities', path: '/facilities', icon: <Building2 className="w-5 h-5" />, hasSub: true },
        { label: 'Data Entry', path: '/data-entry', icon: <Database className="w-5 h-5" />, hasSub: true },
        { label: 'Emissions', path: '/emissions', icon: <Factory className="w-5 h-5" />, hasSub: true },
        { label: 'Reports', path: '/reports', icon: <FileText className="w-5 h-5" />, hasSub: true },
        { label: 'Users', path: '/users', icon: <Users className="w-5 h-5" />, hasSub: true },
        { label: 'Organization Settings', path: '/org-settings', icon: <Settings className="w-5 h-5" /> },
        { label: 'Audit Logs', path: '/audit-logs', icon: <ScrollText className="w-5 h-5" /> },
    ];

    const adminNav = [
        { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Facilities', path: '/admin/facilities', icon: <Building2 className="w-5 h-5" />, hasSub: true },
        { label: 'Data Entry', path: '/data-entry', icon: <Database className="w-5 h-5" />, hasSub: true },
        { label: 'Emissions', path: '/emissions', icon: <Factory className="w-5 h-5" />, hasSub: true },
        { label: 'Reports', path: '/admin/reports', icon: <FileText className="w-5 h-5" />, hasSub: true },
    ];

    const dataEntryNav = [
        { label: 'Data Entry', path: '/data-entry/submit', icon: <Database className="w-5 h-5" /> },
        { label: 'Emissions', path: '/data-entry/emissions', icon: <Factory className="w-5 h-5" /> },
        { label: 'Audit Logs', path: '/data-entry/audit-logs', icon: <ScrollText className="w-5 h-5" /> },
    ];

    const viewerNav = [
        { label: 'Verify Records', path: '/viewer/verify', icon: <Database className="w-5 h-5" /> },
        { label: 'Emissions', path: '/viewer/emissions', icon: <Factory className="w-5 h-5" /> },
        { label: 'Audit Logs', path: '/viewer/audit-logs', icon: <ScrollText className="w-5 h-5" /> },
    ];

    const navItems =
        user?.role === 'ADMIN' ? adminNav :
            user?.role === 'DATA_ENTRY' ? dataEntryNav :
                user?.role === 'VIEWER' ? viewerNav :
                    ownerNav; // OWNER (default)


    return (
        <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex transition-colors duration-500 overflow-hidden relative font-sans">
            {/* Sidebar */}
            <aside className="w-[260px] bg-[#0A2E20] border-r border-[#0A2E20] flex flex-col fixed inset-y-0 left-0 z-50 text-slate-300">
                <div className="p-6 flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#10B981] font-black text-xl overflow-hidden shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#0A2E20]" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-white leading-tight">CarbaCount</span>
                        <span className="text-xs text-emerald-400/80 leading-tight">Carbon Accounting</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                                ? 'bg-[#1a4030] text-emerald-400'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={location.pathname === item.path ? 'text-emerald-400' : 'text-slate-400'}>{item.icon}</span>
                                {item.label}
                            </div>
                            {(item as { hasSub?: boolean }).hasSub && <ChevronDown className="w-4 h-4 opacity-50" />}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 mt-auto">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Top Header */}
            <div className="flex-1 flex flex-col ml-[260px]">
                <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-6">
                        <button className="text-slate-600 hover:text-slate-900">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                            {navItems.find(item => location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)))?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-sm">
                            <span className="text-slate-500">Reporting Year:</span>
                            <span className="font-bold text-slate-700">2024-25</span>
                            <ChevronDown className="w-4 h-4 text-slate-500 ml-1" />
                        </div>

                        <div className="h-6 w-px bg-slate-200"></div>

                        <div className="flex items-center gap-5">
                            <button className="text-slate-500 hover:text-slate-700 relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">3</span>
                            </button>
                            <button className="text-slate-500 hover:text-slate-700">
                                <Settings className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-bold text-slate-800 leading-none mb-1">{user?.userName || 'A. Kumar'}</p>
                                    <p className="text-xs text-slate-500 leading-none">{user?.role === 'OWNER' ? 'Owner' : user?.role}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8 flex-1 bg-[#f8f9fa]">
                    {children}
                </main>
            </div>
        </div>
    );
};


export default Layout;
