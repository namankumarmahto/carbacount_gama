import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, PlusCircle, LogOut, LayoutDashboard } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: 'Analytics', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Report Emission', path: '/add', icon: <PlusCircle className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-green-500/30">
            <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 group text-decoration-none">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">C</div>
                        <span className="text-xl font-bold tracking-tight text-white">CarbaCount <span className="text-green-500">GAMA</span></span>
                    </Link>

                    {user && (
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname === item.path
                                            ? 'bg-green-500/10 text-green-500'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {user && (
                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Authenticated As</span>
                            <span className="text-sm font-medium text-slate-300">{user.email}</span>
                        </div>

                        <div className="h-8 w-px bg-white/10 hidden lg:block"></div>

                        <button
                            onClick={logout}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 px-4 py-2 rounded-xl text-sm font-medium border border-white/5 transition-all text-slate-300"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                )}
            </nav>

            <main className="flex-1 container mx-auto px-6 py-8">
                {children}
            </main>

            <footer className="bg-slate-900 border-t border-white/5 py-8 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 opacity-50">
                        <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                        <span className="text-sm font-bold tracking-tight">CarbaCount GAMA v1.0</span>
                    </div>
                    <p className="text-slate-600 text-xs max-w-xs leading-relaxed">
                        Professional carbon accounting & real-time environmental intelligence platform for industrial sustainability.
                    </p>
                    <p className="text-slate-700 text-[10px] mt-2">
                        &copy; 2026 CarbaCount GAMA. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
