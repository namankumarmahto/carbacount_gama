import React, { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw,
    Loader2, Building2, X
} from 'lucide-react';
import { viewerApi } from '../../api/services';

interface EmissionRecord {
    id: string; type: string; scope: string; facilityName: string;
    fuelType?: string; electricitySource?: string; category?: string;
    subCategory?: string; unit: string; quantity: number;
    status: string; rejectionReason?: string;
    submittedBy: string; createdAt: string;
}

const SCOPE_COLORS: { [key: string]: string } = {
    SCOPE1: '#3b82f6', SCOPE2: '#f59e0b', SCOPE3: '#8b5cf6'
};

const ViewerVerifyPage: React.FC = () => {
    const [records, setRecords] = useState<EmissionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<EmissionRecord | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const res = filter === 'PENDING'
                ? await viewerApi.getPending()
                : await viewerApi.getAll();
            if (res.data.success) setRecords(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [filter]);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const handleApprove = async (record: EmissionRecord) => {
        setActioningId(record.id);
        try {
            await viewerApi.verify(record.id, record.type, 'APPROVE');
            setRecords(prev => prev.map(r => r.id === record.id ? { ...r, status: 'APPROVED' } : r));
            showSuccess(`Approved: ${record.facilityName} - ${record.fuelType || record.electricitySource || record.category}`);
        } catch (e: any) {
            setErrorMsg(e.response?.data?.message || 'Approval failed');
        } finally {
            setActioningId(null);
        }
    };


    const handleRejectSubmit = async () => {
        if (!rejectModal) return;
        setActioningId(rejectModal.id);
        try {
            await viewerApi.verify(rejectModal.id, rejectModal.type, 'REJECT', rejectReason);
            setRecords(prev => prev.map(r => r.id === rejectModal.id ? { ...r, status: 'REJECTED', rejectionReason: rejectReason } : r));
            setRejectModal(null);
            setRejectReason('');
            showSuccess('Record rejected.');
        } catch (e: any) {
            setErrorMsg(e.response?.data?.message || 'Rejection failed');
        } finally {
            setActioningId(null);
        }
    };

    const displayed = filter === 'PENDING' ? records.filter(r => r.status === 'PENDING') : records;

    const pendingCount = records.filter(r => r.status === 'PENDING').length;
    const approvedCount = records.filter(r => r.status === 'APPROVED').length;
    const rejectedCount = records.filter(r => r.status === 'REJECTED').length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Verify Submissions</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Review and approve or reject emission records submitted by data entry users.</p>
                </div>
                <button onClick={fetchRecords} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Notifications */}
            {successMsg && (
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
                    <span>{errorMsg}</span>
                    <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Awaiting Review', value: pendingCount, Icon: Clock, cls: 'text-amber-600 bg-amber-50' },
                    { label: 'Approved', value: approvedCount, Icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Rejected', value: rejectedCount, Icon: XCircle, cls: 'text-rose-600 bg-rose-50' },
                ].map(({ label, value, Icon, cls }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-100 px-5 py-4 flex items-center gap-4 shadow-sm">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cls}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{value}</p>
                            <p className="text-xs text-slate-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter + Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800">
                        {filter === 'PENDING' ? 'Pending Verification' : 'All Records'}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setFilter('PENDING')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filter === 'PENDING' ? 'bg-[#1a4030] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            Pending
                        </button>
                        <button onClick={() => setFilter('ALL')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filter === 'ALL' ? 'bg-[#1a4030] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            All Records
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[12px] font-semibold text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="py-3.5 px-5">Submitted By</th>
                                <th className="py-3.5 px-5">Facility</th>
                                <th className="py-3.5 px-5">Scope</th>
                                <th className="py-3.5 px-5">Emission Detail</th>
                                <th className="py-3.5 px-5">Qty / Unit</th>
                                <th className="py-3.5 px-5">Date</th>
                                <th className="py-3.5 px-5">Status / Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-[#1a4030] mx-auto" />
                                        <p className="mt-2 text-sm text-slate-400">Loading records…</p>
                                    </td>
                                </tr>
                            ) : displayed.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-200 mx-auto mb-2" />
                                        <p className="text-sm text-slate-400">
                                            {filter === 'PENDING' ? 'All records verified! Nothing pending.' : 'No records found.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : displayed.map(record => {
                                const isActioning = actioningId === record.id;
                                const isPending = record.status === 'PENDING';
                                return (
                                    <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-[#1a4030]/10 flex items-center justify-center text-[#1a4030] text-xs font-bold flex-shrink-0">
                                                    {record.submittedBy?.charAt(0)?.toUpperCase() ?? 'U'}
                                                </div>
                                                <span className="font-medium text-slate-700 text-sm">{record.submittedBy}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                {record.facilityName}
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                                                style={{ background: SCOPE_COLORS[record.scope] ?? '#64748b' }}>
                                                {record.scope}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 text-slate-600">
                                            {record.fuelType || record.electricitySource || record.category || '—'}
                                            {record.subCategory && <span className="text-slate-400 ml-1">/ {record.subCategory}</span>}
                                        </td>
                                        <td className="py-4 px-5 font-medium text-slate-700">
                                            {record.quantity} <span className="text-slate-400 font-normal">{record.unit}</span>
                                        </td>
                                        <td className="py-4 px-5 text-slate-400 text-xs">
                                            {record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                                        </td>
                                        <td className="py-4 px-5">
                                            {isPending ? (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleApprove(record)} disabled={isActioning}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50">
                                                        {isActioning ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        Approve
                                                    </button>
                                                    <button onClick={() => { setRejectModal(record); setRejectReason(''); }}
                                                        disabled={isActioning}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors disabled:opacity-50">
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : record.status === 'APPROVED' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3" /> Approved
                                                </span>
                                            ) : (
                                                <div>
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-rose-50 text-rose-700 border-rose-200">
                                                        <XCircle className="w-3 h-3" /> Rejected
                                                    </span>
                                                    {record.rejectionReason && (
                                                        <p className="text-xs text-slate-400 mt-1">{record.rejectionReason}</p>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">Reject Record</h2>
                                    <p className="text-xs text-slate-500">
                                        {rejectModal.facilityName} — {rejectModal.fuelType || rejectModal.electricitySource || rejectModal.category}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Reason for rejection <span className="text-rose-500">*</span></label>
                                <textarea
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    rows={3}
                                    placeholder="Explain why this record is being rejected…"
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setRejectModal(null)}
                                    className="flex-1 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleRejectSubmit} disabled={!rejectReason.trim() || !!actioningId}
                                    className="flex-1 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                                    {actioningId ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewerVerifyPage;
