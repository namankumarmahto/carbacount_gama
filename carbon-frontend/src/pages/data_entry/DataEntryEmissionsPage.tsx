import React, { useState, useEffect, useCallback } from 'react';
import {
    Download, RefreshCw, Clock, CheckCircle2, AlertCircle,
    BarChart2, TrendingUp, Layers, Building2, X
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { dataEntryApi } from '../../api/services';

interface Record {
    id: string; type: string; scope: string; facilityName: string;
    fuelType?: string; electricitySource?: string; category?: string;
    unit: string; quantity: number; status: string; createdAt: string;
}

const SCOPE_COLORS = { SCOPE1: '#3b82f6', SCOPE2: '#f59e0b', SCOPE3: '#8b5cf6' };

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const cfg = {
        PENDING: { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
        APPROVED: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
        REJECTED: { cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertCircle },
    }[status] ?? { cls: 'bg-slate-50 text-slate-500 border-slate-200', icon: Clock };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
            <Icon className="w-3 h-3" />
            {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
    );
};

const DataEntryEmissionsPage: React.FC = () => {
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const res = await dataEntryApi.getMySubmissions();
            if (res.data.success) setRecords(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const filtered = statusFilter === 'ALL' ? records : records.filter(r => r.status === statusFilter);

    const approvedRecords = records.filter(r => r.status === 'APPROVED');
    const scope1Total = approvedRecords.filter(r => r.scope === 'SCOPE1').reduce((s, r) => s + r.quantity, 0);
    const scope2Total = approvedRecords.filter(r => r.scope === 'SCOPE2').reduce((s, r) => s + r.quantity, 0);
    const scope3Total = approvedRecords.filter(r => r.scope === 'SCOPE3').reduce((s, r) => s + r.quantity, 0);
    const total = scope1Total + scope2Total + scope3Total;

    const pieData = [
        { name: 'Scope 1', value: scope1Total, fill: SCOPE_COLORS.SCOPE1 },
        { name: 'Scope 2', value: scope2Total, fill: SCOPE_COLORS.SCOPE2 },
        { name: 'Scope 3', value: scope3Total, fill: SCOPE_COLORS.SCOPE3 },
    ].filter(d => d.value > 0);

    const stats = [
        { label: 'Pending', value: records.filter(r => r.status === 'PENDING').length, color: 'text-amber-600 bg-amber-50', Icon: Clock },
        { label: 'Approved', value: records.filter(r => r.status === 'APPROVED').length, color: 'text-emerald-600 bg-emerald-50', Icon: CheckCircle2 },
        { label: 'Rejected', value: records.filter(r => r.status === 'REJECTED').length, color: 'text-rose-600 bg-rose-50', Icon: AlertCircle },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Emissions</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Overview of your submitted emission data.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchRecords} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {stats.map(({ label, value, color, Icon }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-100 px-5 py-4 flex items-center gap-4 shadow-sm">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{value}</p>
                            <p className="text-xs text-slate-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart and breakdown */}
            {pieData.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                    <h2 className="text-base font-bold text-slate-800 mb-4">Approved Scope Breakdown</h2>
                    <div className="flex items-center gap-8">
                        <div className="w-[200px] h-[200px] relative flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                                        paddingAngle={2} dataKey="value" stroke="none">
                                        {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-black text-slate-800">{total.toLocaleString()}</span>
                                <span className="text-[10px] font-semibold text-slate-500">Total</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {pieData.map(d => (
                                <div key={d.name} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ background: d.fill }} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">{d.name}</p>
                                        <p className="text-xs text-slate-400">{d.value.toLocaleString()} units</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Records table */}
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800">Submitted Records</h2>
                    <div className="flex items-center gap-2">
                        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${statusFilter === s ? 'bg-[#1a4030] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[12px] font-semibold text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="py-3 px-5">Facility</th>
                                <th className="py-3 px-5">Scope</th>
                                <th className="py-3 px-5">Detail</th>
                                <th className="py-3 px-5">Qty / Unit</th>
                                <th className="py-3 px-5">Status</th>
                                <th className="py-3 px-5">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {loading ? (
                                <tr><td colSpan={6} className="py-12 text-center text-slate-400">Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="py-12 text-center text-slate-400">No records found</td></tr>
                            ) : filtered.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="py-3.5 px-5 font-medium text-slate-700">{r.facilityName}</td>
                                    <td className="py-3.5 px-5">
                                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-white" style={{ background: SCOPE_COLORS[r.scope as keyof typeof SCOPE_COLORS] ?? '#64748b' }}>
                                            {r.scope}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-5 text-slate-600">{r.fuelType || r.electricitySource || r.category || '—'}</td>
                                    <td className="py-3.5 px-5 text-slate-700 font-medium">{r.quantity} <span className="text-slate-400 font-normal">{r.unit}</span></td>
                                    <td className="py-3.5 px-5"><StatusBadge status={r.status} /></td>
                                    <td className="py-3.5 px-5 text-slate-400 text-xs">
                                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataEntryEmissionsPage;
