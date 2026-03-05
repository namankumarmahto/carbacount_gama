import React, { useState, useEffect, useCallback } from 'react';
import {
    RefreshCw, ChevronLeft, ChevronRight, ChevronsRight, Search,
    ScrollText, Loader2
} from 'lucide-react';
import { auditApi } from '../../api/services';

interface AuditLogEntry {
    id: string;
    user: string;
    action: string;
    module: string;
    createdAt: string;
}

const moduleColor = (module: string): string => {
    const m = module?.toLowerCase() ?? '';
    if (m.includes('facility')) return 'bg-[#1a4030] text-white';
    if (m.includes('scope1') || m.includes('fuel')) return 'bg-blue-50 text-blue-700';
    if (m.includes('scope2') || m.includes('electricity')) return 'bg-amber-50 text-amber-700';
    if (m.includes('scope3')) return 'bg-purple-50 text-purple-700';
    if (m.includes('emission') || m.includes('data_entry')) return 'bg-indigo-50 text-indigo-700';
    if (m.includes('user') || m.includes('organization')) return 'bg-slate-100 text-slate-700';
    if (m.includes('verif')) return 'bg-emerald-50 text-emerald-700';
    return 'bg-slate-100 text-slate-500';
};

const PAGE_SIZE = 10;

const AuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await auditApi.getLogs();
            if (res.data.success) setLogs(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const filtered = logs.filter(l =>
        l.user?.toLowerCase().includes(search.toLowerCase()) ||
        l.action?.toLowerCase().includes(search.toLowerCase()) ||
        l.module?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Audit Logs</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Track all actions taken within your organization.</p>
                </div>
                <button onClick={fetchLogs} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors" title="Refresh">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Search */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by user, action, or module…"
                        className="flex-1 text-sm text-slate-700 placeholder:text-slate-300 outline-none bg-transparent"
                    />
                    <span className="text-xs text-slate-400">{filtered.length} entries</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[12px] font-semibold text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="py-3.5 px-6">User</th>
                                <th className="py-3.5 px-6">Action</th>
                                <th className="py-3.5 px-6">Module</th>
                                <th className="py-3.5 px-6">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[13px] text-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-[#1a4030] mx-auto" />
                                        <p className="mt-2 text-sm text-slate-400">Loading logs…</p>
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center">
                                        <ScrollText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                        <p className="text-sm text-slate-400">No audit logs found</p>
                                    </td>
                                </tr>
                            ) : paginated.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-slate-800">{log.user}</td>
                                    <td className="py-4 px-6 text-slate-600 max-w-[300px] truncate" title={log.action}>{log.action}</td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${moduleColor(log.module)}`}>
                                            {log.module}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-slate-500">
                                        {log.createdAt
                                            ? new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                                            : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-3.5 flex items-center justify-between border-t border-slate-50 bg-white">
                    <span className="text-xs text-slate-400">
                        Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                    <div className="flex items-center gap-1">
                        <button disabled={page === 1} onClick={() => setPage(1)}
                            className="p-1.5 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-30">
                            <ChevronsRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                            className="p-1.5 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-30">
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                            return p <= totalPages ? (
                                <button key={p} onClick={() => setPage(p)}
                                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${p === page ? 'bg-[#1a4030] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                                    {p}
                                </button>
                            ) : null;
                        })}
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                            className="p-1.5 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-30">
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button disabled={page === totalPages} onClick={() => setPage(totalPages)}
                            className="p-1.5 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-30">
                            <ChevronsRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogsPage;
