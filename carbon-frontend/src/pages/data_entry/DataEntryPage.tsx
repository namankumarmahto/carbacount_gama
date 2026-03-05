import React, { useState, useCallback, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import DataEntryTabContent from '../../components/DataEntryTabContent';
import { dataEntryApi } from '../../api/services';

interface MyRecord {
    id: string; type: string; scope: string; facilityName: string;
    fuelType?: string; electricitySource?: string; category?: string; subCategory?: string;
    totalProduction?: number;
    unit: string; quantity: number; status: string; rejectionReason?: string;
    createdAt: string;
}

const SCOPE_LABEL: Record<string, string> = {
    SCOPE1: 'Scope 1', SCOPE2: 'Scope 2', SCOPE3: 'Scope 3', PRODUCTION: 'Production',
};

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

const DataEntryPage: React.FC = () => {
    const [myRecords, setMyRecords] = useState<MyRecord[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);

    const fetchMyRecords = useCallback(async () => {
        setLoadingRecords(true);
        try {
            const res = await dataEntryApi.getMySubmissions();
            if (res.data.success) setMyRecords(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoadingRecords(false); }
    }, []);

    useEffect(() => { fetchMyRecords(); }, [fetchMyRecords]);

    return (
        <div className="space-y-6">
            {/* Shared data entry form with all 4 tabs */}
            <DataEntryTabContent />

            {/* My Submissions table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800">My Submissions</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{myRecords.length} records</span>
                        <button onClick={fetchMyRecords} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
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
                                <th className="py-3 px-5">Submitted</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {loadingRecords ? (
                                <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#1a4030] mx-auto" /></td></tr>
                            ) : myRecords.length === 0 ? (
                                <tr><td colSpan={6} className="py-12 text-center text-slate-400 text-sm">No submissions yet</td></tr>
                            ) : myRecords.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="py-3.5 px-5 font-medium text-slate-700">{r.facilityName}</td>
                                    <td className="py-3.5 px-5 text-slate-500 text-xs font-semibold">{SCOPE_LABEL[r.scope] ?? r.scope}</td>
                                    <td className="py-3.5 px-5 text-slate-600">
                                        {r.type === 'PRODUCTION'
                                            ? `Production (${r.totalProduction ?? r.quantity} ${r.unit})`
                                            : (r.fuelType || r.electricitySource || r.category || '—')}
                                        {r.subCategory && r.type === 'SCOPE3' && (
                                            <span className="text-slate-400"> › {r.subCategory}</span>
                                        )}
                                        {r.status === 'REJECTED' && r.rejectionReason && (
                                            <p className="text-xs text-rose-500 mt-0.5">Reason: {r.rejectionReason}</p>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-5 text-slate-700">
                                        {r.type === 'PRODUCTION' ? '—' : `${r.quantity} ${r.unit}`}
                                    </td>
                                    <td className="py-3.5 px-5"><StatusBadge status={r.status} /></td>
                                    <td className="py-3.5 px-5 text-slate-400 text-xs">
                                        {r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
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

export default DataEntryPage;
