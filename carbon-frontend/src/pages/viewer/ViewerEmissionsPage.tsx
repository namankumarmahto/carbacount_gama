import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { viewerApi } from '../../api/services';

interface EmissionRecord {
    id: string; type: string; scope: string; facilityName: string;
    fuelType?: string; electricitySource?: string; category?: string;
    unit: string; quantity: number; status: string; createdAt: string;
}

const SCOPE_COLORS: { [key: string]: string } = { SCOPE1: '#3b82f6', SCOPE2: '#f59e0b', SCOPE3: '#8b5cf6' };

const ViewerEmissionsPage: React.FC = () => {
    const [records, setRecords] = useState<EmissionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [scopeFilter, setScopeFilter] = useState<'ALL' | 'SCOPE1' | 'SCOPE2' | 'SCOPE3'>('ALL');

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const res = await viewerApi.getAll();
            if (res.data.success) setRecords(res.data.data.filter((r: EmissionRecord) => r.status === 'APPROVED'));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const filtered = scopeFilter === 'ALL' ? records : records.filter(r => r.scope === scopeFilter);

    // Group by facility name for bar chart
    const facilityMap: Record<string, number> = {};
    records.forEach(r => {
        facilityMap[r.facilityName] = (facilityMap[r.facilityName] ?? 0) + r.quantity;
    });
    const barData = Object.entries(facilityMap).map(([name, qty]) => ({ name, value: qty }));

    const scopeSums = { SCOPE1: 0, SCOPE2: 0, SCOPE3: 0 };
    records.forEach(r => { (scopeSums as any)[r.scope] = ((scopeSums as any)[r.scope] ?? 0) + r.quantity; });
    const pieData = Object.entries(scopeSums).filter(([, v]) => v > 0).map(([k, v]) => ({
        name: k, value: v, fill: SCOPE_COLORS[k]
    }));
    const totalApproved = records.reduce((s, r) => s + r.quantity, 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Emissions Overview</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Approved emission records across all facilities.</p>
                </div>
                <button onClick={fetchRecords} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
                {/* Bar chart by facility */}
                <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-700 mb-4">Emissions by Facility</h2>
                    {barData.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-8">No approved data</p>
                    ) : (
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#1a4030" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Pie chart by scope */}
                <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-700 mb-4">Scope Breakdown (Approved)</h2>
                    {pieData.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-8">No approved data</p>
                    ) : (
                        <div className="flex items-center gap-6">
                            <div className="w-[160px] h-[160px] relative flex-shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                                            {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-lg font-black text-slate-800">{totalApproved.toFixed(0)}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">Total</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {pieData.map(d => (
                                    <div key={d.name} className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                                        <div>
                                            <p className="text-xs font-semibold text-slate-700">{d.name}</p>
                                            <p className="text-xs text-slate-400">{d.value.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800">Approved Records</h2>
                    <div className="flex items-center gap-1.5">
                        {(['ALL', 'SCOPE1', 'SCOPE2', 'SCOPE3'] as const).map(s => (
                            <button key={s} onClick={() => setScopeFilter(s)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${scopeFilter === s ? 'bg-[#1a4030] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
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
                                <th className="py-3 px-5">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin text-[#1a4030] mx-auto" /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-slate-400">No approved records yet</td></tr>
                            ) : filtered.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="py-3.5 px-5 font-medium text-slate-700">{r.facilityName}</td>
                                    <td className="py-3.5 px-5">
                                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                                            style={{ background: SCOPE_COLORS[r.scope] ?? '#64748b' }}>
                                            {r.scope}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-5 text-slate-600">{r.fuelType || r.electricitySource || r.category || '—'}</td>
                                    <td className="py-3.5 px-5 text-slate-700 font-medium">{r.quantity} <span className="text-slate-400 font-normal">{r.unit}</span></td>
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

export default ViewerEmissionsPage;
