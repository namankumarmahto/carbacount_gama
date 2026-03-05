/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle2, XCircle, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const BASE_URL = 'http://localhost:8081';

interface VerificationRecord {
    id: string;
    type: string;
    facilityName: string;
    reportingYear: string;
    status: string;
    submittedByEmail: string;
    submittedAt: string;
    createdAt: string;
    fuelType?: string;
    electricitySource?: string;
    category?: string;
    totalProduction?: number;
    quantity?: number;
    unit?: string;
    rejectionReason?: string;
}

const SCOPE_COLORS: Record<string, string> = {
    SCOPE1: 'bg-blue-100 text-blue-700 border border-blue-200',
    SCOPE2: 'bg-amber-100 text-amber-700 border border-amber-200',
    SCOPE3: 'bg-purple-100 text-purple-700 border border-purple-200',
    PRODUCTION: 'bg-green-100 text-green-700 border border-green-200',
};

const AuditorVerifyPage: React.FC = () => {
    const [records, setRecords] = useState<VerificationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<{ recordId: string; type: string } | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    const getToken = () => localStorage.getItem('token');

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/auditor/pending`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (data.success) {
                setRecords(data.data || []);
            } else {
                setError(data.message || 'Failed to load records');
            }
        } catch {
            setError('Network error — could not load records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecords(); }, []);

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 4000);
    };

    const handleVerify = async (recordId: string, type: string, action: 'VERIFIED' | 'REJECTED', reason?: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/auditor/verify/${recordId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, action, reason })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Record ${action === 'VERIFIED' ? 'verified' : 'rejected'} successfully`, true);
                setRejectModal(null);
                setRejectReason('');
                await fetchRecords();
            } else {
                showToast(data.message || 'Action failed', false);
            }
        } catch {
            showToast('Network error', false);
        } finally {
            setActionLoading(false);
        }
    };

    const getDescription = (r: VerificationRecord) => {
        if (r.type === 'SCOPE1') return `Fuel: ${r.fuelType} — ${r.quantity} ${r.unit}`;
        if (r.type === 'SCOPE2') return `Electricity: ${r.electricitySource} — ${r.quantity} ${r.unit}`;
        if (r.type === 'SCOPE3') return `Category: ${r.category} — ${r.quantity} ${r.unit}`;
        if (r.type === 'PRODUCTION') return `Production: ${r.totalProduction} ${r.unit}`;
        return '—';
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 animate-pulse">Loading records...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 transition-all ${toast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-emerald-600" />
                        Verification Dashboard
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Review and verify emissions data submitted by field users</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-700 font-semibold text-sm">{records.length} Pending</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {records.length === 0 && !error && (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-700 mb-1">All caught up!</h3>
                    <p className="text-slate-500 text-sm">No records pending verification.</p>
                </div>
            )}

            {/* Records List */}
            <div className="space-y-3">
                {records.map(record => (
                    <div key={record.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Row Header */}
                        <div
                            className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => setExpanded(expanded === record.id ? null : record.id)}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${SCOPE_COLORS[record.type] || 'bg-slate-100 text-slate-600'}`}>
                                    {record.type}
                                </span>
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">{record.facilityName}</p>
                                    <p className="text-slate-500 text-xs">{getDescription(record)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs text-slate-500">Submitted by</p>
                                    <p className="text-sm font-medium text-slate-700">{record.submittedByEmail}</p>
                                </div>
                                <div className="text-right hidden md:block">
                                    <p className="text-xs text-slate-500">Period</p>
                                    <p className="text-sm font-medium text-slate-700">{record.reportingYear}</p>
                                </div>
                                {expanded === record.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expanded === record.id && (
                            <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Type</p>
                                        <p className="text-sm font-medium text-slate-800">{record.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Quantity / Value</p>
                                        <p className="text-sm font-medium text-slate-800">
                                            {record.type === 'PRODUCTION' ? record.totalProduction : record.quantity} {record.unit}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Reporting Year</p>
                                        <p className="text-sm font-medium text-slate-800">{record.reportingYear}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Submitted At</p>
                                        <p className="text-sm font-medium text-slate-800">
                                            {record.submittedAt ? new Date(record.submittedAt).toLocaleDateString() : '—'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 justify-end">
                                    <button
                                        onClick={() => setRejectModal({ recordId: record.id, type: record.type })}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleVerify(record.id, record.type, 'VERIFIED')}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Verify & Approve
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-500" /> Reject Record
                        </h3>
                        <p className="text-slate-500 text-sm mb-4">Please provide a reason for rejection. The data entry user will be notified and can resubmit.</p>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 resize-none h-28 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleVerify(rejectModal.recordId, rejectModal.type, 'REJECTED', rejectReason)}
                                disabled={!rejectReason.trim() || actionLoading}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold transition-colors"
                            >
                                {actionLoading ? 'Processing...' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditorVerifyPage;
