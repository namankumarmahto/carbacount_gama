/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { Shield, CheckCircle2, XCircle, Clock, AlertTriangle, ChevronDown, ChevronUp, FileText, Eye, Loader2 } from 'lucide-react';
import { auditorApi, dataEntryApi } from '../../api/services';

type ReviewStatus = 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'NEEDS_CORRECTION' | 'REJECTED';

interface VerificationRecord {
    id: string;
    submissionId?: string;
    type: string;
    facilityName: string;
    reportingYear: string;
    status: string;
    reviewStatus?: ReviewStatus;
    submittedByEmail: string;
    submittedAt: string;
    createdAt: string;
    fuelType?: string;
    electricitySource?: string;
    category?: string;
    totalProduction?: number;
    quantity?: number;
    unit?: string;
    emissionFactor?: number;
    calculatedEmission?: number;
    rejectionReason?: string;
    documents?: Array<{
        id: string;
        fileName: string;
        fileType: string;
        fileUrl: string;
        uploadedBy: string;
        uploadedAt: string;
    }>;
}

const TABS: { key: ReviewStatus; label: string }[] = [
    { key: 'PENDING_REVIEW', label: 'Pending Review' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'VERIFIED', label: 'Verified' },
    { key: 'NEEDS_CORRECTION', label: 'Needs Correction' },
    { key: 'REJECTED', label: 'Rejected' },
];

const SCOPE_COLORS: Record<string, string> = {
    SCOPE1: 'bg-blue-100 text-blue-700 border border-blue-200',
    SCOPE2: 'bg-amber-100 text-amber-700 border border-amber-200',
    SCOPE3: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    PRODUCTION: 'bg-green-100 text-green-700 border border-green-200',
};

const AuditorVerifyPage: React.FC = () => {
    const [records, setRecords] = useState<VerificationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const [activeTab, setActiveTab] = useState<ReviewStatus>('PENDING_REVIEW');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [tagModal, setTagModal] = useState<{ submissionId: string; reviewStatus: ReviewStatus; reason: string } | null>(null);

    const [viewingDocId, setViewingDocId] = useState<string | null>(null);

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3500);
    };

    const handlePreview = async (doc: any) => {
        if (!doc.id) return;
        setViewingDocId(doc.id);
        try {
            const res = await dataEntryApi.downloadDocument(doc.id);
            const blob = new Blob([res.data], { type: res.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            console.error('Failed to preview document:', err);
            showToast('Could not open document preview.', false);
        } finally {
            setViewingDocId(null);
        }
    };

    const fetchRecords = async (status: ReviewStatus) => {
        setLoading(true);
        setError('');
        try {
            const res = await auditorApi.getByReviewStatus(status);
            if (res.data.success) {
                setRecords(res.data.data || []);
            } else {
                setError(res.data.message || 'Failed to load records');
            }
        } catch {
            setError('Network error - could not load records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords(activeTab);
    }, [activeTab]);

    const groupedRecords = useMemo(() => {
        const grouped: any[] = [];
        const submissionMap = new Map<string, any>();

        records.forEach(r => {
            const key = r.submissionId || r.id;
            if (submissionMap.has(key)) {
                const existing = submissionMap.get(key)!;
                existing.ids.push(r.id);
                existing.originalRecords.push(r);
            } else {
                const copy = { ...r, ids: [r.id], originalRecords: [r] };
                submissionMap.set(key, copy);
                grouped.push(copy);
            }
        });
        return grouped;
    }, [records]);

    const getDescription = (group: any) => {
        if (group.originalRecords.length > 1) {
            return `${group.originalRecords.length} rows in submission`;
        }
        const r = group.originalRecords[0];
        if (r.type === 'SCOPE1') return `Fuel: ${r.fuelType} - ${r.quantity} ${r.unit}`;
        if (r.type === 'SCOPE2') return `Electricity: ${r.electricitySource} - ${r.quantity} ${r.unit}`;
        if (r.type === 'SCOPE3') return `Category: ${r.category} - ${r.quantity} ${r.unit}`;
        if (r.type === 'PRODUCTION') return `Production: ${r.totalProduction} ${r.unit}`;
        return '-';
    };

    const onUpdateTag = async (submissionId: string, reviewStatus: ReviewStatus, reason?: string) => {
        setActionLoading(submissionId);
        try {
            const res = await auditorApi.verify(submissionId, { reviewStatus, reason });
            if (res.data.success) {
                showToast('Review status updated', true);
                setTagModal(null);
                fetchRecords(activeTab);
            } else {
                showToast(res.data.message || 'Failed to update', false);
            }
        } catch {
            showToast('Network error', false);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${toast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-emerald-600" /> Verify Entries
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage submission tags across verification stages</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-700 font-semibold text-sm">{records.length} Records</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-2 flex gap-2 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${activeTab === tab.key ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-slate-500">Loading records...</p>
                </div>
            )}

            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
            )}

            {!loading && !error && groupedRecords.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">No records in this tag.</div>
            )}

            <div className="space-y-3">
                {groupedRecords.map(group => {
                    const record = group;
                    const key = record.submissionId || record.id;
                    const selectedTag = (record.reviewStatus || activeTab) as ReviewStatus;

                    return (
                        <div key={key} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div
                                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50"
                                onClick={() => setExpanded(expanded === key ? null : key)}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${SCOPE_COLORS[record.type] || 'bg-slate-100 text-slate-600'}`}>
                                        {record.type}
                                    </span>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{record.facilityName}</p>
                                        <p className="text-slate-500 text-xs">{getDescription(group)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-slate-500">Submitted by</p>
                                        <p className="text-sm font-medium text-slate-700">{record.submittedByEmail}</p>
                                    </div>
                                    {expanded === key ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                </div>
                            </div>

                            {expanded === key && (
                                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50 space-y-4">
                                    {group.originalRecords.map((r: any, idx: number) => (
                                        <div key={r.id} className={`grid grid-cols-2 md:grid-cols-6 gap-4 ${idx > 0 ? 'pt-4 border-t border-slate-200/50' : ''}`}>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Activity</p>
                                                <p className="text-sm font-medium text-slate-800">{r.fuelType || r.electricitySource || r.category || 'Production'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Quantity</p>
                                                <p className="text-sm font-medium text-emerald-700">{r.type === 'PRODUCTION' ? r.totalProduction : r.quantity} {r.unit}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Factor</p>
                                                <p className="text-xs font-medium text-slate-800">{r.emissionFactor ?? '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Emission</p>
                                                <p className="text-xs font-medium text-slate-800">{r.calculatedEmission ?? '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Submitted At</p>
                                                <p className="text-xs font-medium text-slate-800">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Comment</p>
                                                <p className="text-xs font-medium text-rose-600">{r.rejectionReason || '-'}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Documents Section */}
                                    {group.documents && group.documents.length > 0 && (
                                        <div className="pt-4 border-t border-slate-200">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 flex items-center gap-1">
                                                <FileText className="w-3 h-3" /> Supporting Documents
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {group.documents.map((doc: any) => (
                                                    <div key={doc.id} className="group relative flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs hover:border-emerald-500 hover:shadow-sm transition-all">
                                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="font-medium text-slate-700 truncate max-w-[180px]">{doc.fileName}</span>
                                                        <div className="flex items-center gap-1 ml-2">
                                                            <button
                                                                onClick={() => handlePreview(doc)}
                                                                disabled={!!viewingDocId}
                                                                className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md font-medium transition-colors disabled:opacity-50"
                                                                title="Preview Document"
                                                            >
                                                                {viewingDocId === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />} View
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
                                        <select
                                            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                                            value={selectedTag}
                                            onChange={(e) => {
                                                const next = e.target.value as ReviewStatus;
                                                if (next === 'REJECTED' || next === 'NEEDS_CORRECTION') {
                                                    setTagModal({ submissionId: record.submissionId || record.id, reviewStatus: next, reason: '' });
                                                } else {
                                                    onUpdateTag(record.submissionId || record.id, next);
                                                }
                                            }}
                                            disabled={actionLoading === (record.submissionId || record.id)}
                                        >
                                            {TABS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                                        </select>
                                        <button
                                            onClick={() => onUpdateTag(record.submissionId || record.id, 'VERIFIED')}
                                            disabled={actionLoading === (record.submissionId || record.id)}
                                            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Mark Verified
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {tagModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Add Auditor Comment</h3>
                        <p className="text-slate-500 text-sm mb-4">Comment is required for {tagModal.reviewStatus === 'REJECTED' ? 'Rejected' : 'Needs Correction'}.</p>
                        <textarea
                            value={tagModal.reason}
                            onChange={e => setTagModal({ ...tagModal, reason: e.target.value })}
                            placeholder="Enter comment..."
                            className="w-full border border-slate-300 rounded-xl p-3 text-sm text-slate-800 resize-none h-28"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setTagModal(null)}
                                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onUpdateTag(tagModal.submissionId, tagModal.reviewStatus, tagModal.reason)}
                                disabled={!tagModal.reason.trim() || actionLoading === tagModal.submissionId}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold"
                            >
                                Save Tag
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditorVerifyPage;
