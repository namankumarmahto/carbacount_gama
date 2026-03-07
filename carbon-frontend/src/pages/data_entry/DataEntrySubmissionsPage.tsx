import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Eye, X, Pencil, Trash2, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dataEntryApi } from '../../api/services';

type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
type ReviewStatus = 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'NEEDS_CORRECTION' | 'REJECTED';

interface SubmissionRow {
    id: string;
    submissionId: string;
    scope: string;
    facilityName: string;
    reportingYear: string;
    submittedAt?: string;
    status: SubmissionStatus;
    reviewStatus?: ReviewStatus;
    rejectionReason?: string;
    totalEmission?: number;
    documents?: Array<{
        id: string;
        fileName: string;
        fileType: string;
        fileUrl: string;
    }>;
}

interface SubmissionDetailRow {
    id: string;
    fuelType?: string;
    electricitySource?: string;
    category?: string;
    subCategory?: string;
    quantity?: number;
    totalProduction?: number;
    unit?: string;
    emissionFactor?: number;
    calculatedEmission?: number;
}

const statusClass: Record<SubmissionStatus, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    SUBMITTED: 'bg-amber-100 text-amber-700',
    VERIFIED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-rose-100 text-rose-700',
};

const statusDescription: Record<SubmissionStatus, string> = {
    DRAFT: 'Not submitted',
    SUBMITTED: 'Waiting for auditor',
    VERIFIED: 'Accepted and counted',
    REJECTED: 'Returned for correction',
};

const reviewStatusClass: Record<ReviewStatus, string> = {
    PENDING_REVIEW: 'bg-amber-100 text-amber-700',
    UNDER_REVIEW: 'bg-blue-100 text-blue-700',
    VERIFIED: 'bg-emerald-100 text-emerald-700',
    NEEDS_CORRECTION: 'bg-orange-100 text-orange-700',
    REJECTED: 'bg-rose-100 text-rose-700',
};

const reviewStatusDescription: Record<ReviewStatus, string> = {
    PENDING_REVIEW: 'Waiting for auditor',
    UNDER_REVIEW: 'Auditor is reviewing',
    VERIFIED: 'Accepted and counted',
    NEEDS_CORRECTION: 'Returned for correction',
    REJECTED: 'Permanently rejected',
};

const DataEntrySubmissionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [rows, setRows] = useState<SubmissionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selected, setSelected] = useState<SubmissionRow | null>(null);
    const [details, setDetails] = useState<SubmissionDetailRow[]>([]);
    const [viewingDocId, setViewingDocId] = useState<string | null>(null);

    const handlePreview = async (doc: any) => {
        if (!doc.id) return;
        setViewingDocId(doc.id);
        try {
            const res = await dataEntryApi.downloadDocument(doc.id);
            const blob = new Blob([res.data], { type: res.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            console.error('Failed to preview:', err);
            alert('Could not open preview.');
        } finally {
            setViewingDocId(null);
        }
    };

    const fetchRows = useCallback(async () => {
        setLoading(true);
        try {
            const res = await dataEntryApi.getMySubmissions();
            if (res.data.success) {
                setRows(res.data.data || []);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    const openDetails = async (row: SubmissionRow) => {
        setSelected(row);
        setDetails([]);
        setDetailsLoading(true);
        try {
            const res = await dataEntryApi.getSubmissionDetails(row.submissionId || row.id);
            if (res.data.success) {
                setDetails(res.data.data || []);
            }
        } finally {
            setDetailsLoading(false);
        }
    };

    const canEditOrDelete = (row: SubmissionRow) => row.status === 'DRAFT' || row.reviewStatus === 'NEEDS_CORRECTION';

    const handleEdit = (row: SubmissionRow) => {
        navigate(`/data-entry/submit?editSubmissionId=${row.submissionId || row.id}`);
    };

    const handleDelete = async (row: SubmissionRow) => {
        if (!canEditOrDelete(row)) return;
        if (!window.confirm('Delete this submission permanently? This action cannot be undone.')) return;
        setDeletingId(row.id);
        try {
            await dataEntryApi.deleteSubmission(row.submissionId || row.id);
            await fetchRows();
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Submission Records</h2>
                    <p className="text-sm text-slate-500">One row represents one scope submission.</p>
                </div>
                <button
                    onClick={fetchRows}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[12px] font-semibold text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="py-3 px-5">Facility</th>
                                <th className="py-3 px-5">Scope</th>
                                <th className="py-3 px-5">Reporting Year</th>
                                <th className="py-3 px-5">Submitted Date</th>
                                <th className="py-3 px-5">Total Emission</th>
                                <th className="py-3 px-5">Status</th>
                                <th className="py-3 px-5">Details</th>
                                <th className="py-3 px-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm">
                            {loading ? (
                                <tr><td colSpan={8} className="py-12 text-center text-slate-400">Loading...</td></tr>
                            ) : rows.length === 0 ? (
                                <tr><td colSpan={8} className="py-12 text-center text-slate-400">No submission records found</td></tr>
                            ) : rows.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="py-3.5 px-5 font-medium text-slate-700">{r.facilityName}</td>
                                    <td className="py-3.5 px-5 text-slate-700">{r.scope}</td>
                                    <td className="py-3.5 px-5 text-slate-700">{r.reportingYear || '—'}</td>
                                    <td className="py-3.5 px-5 text-slate-500">
                                        {r.submittedAt ? new Date(r.submittedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                                    </td>
                                    <td className="py-3.5 px-5 text-slate-700">{r.totalEmission != null ? `${r.totalEmission} kg CO2e` : '—'}</td>
                                    <td className="py-3.5 px-5">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex w-fit items-center px-2.5 py-1 rounded text-xs font-semibold ${(r.reviewStatus && reviewStatusClass[r.reviewStatus]) || statusClass[r.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {r.reviewStatus || r.status}
                                            </span>
                                            <span className="text-[11px] text-slate-500">
                                                {(r.reviewStatus && reviewStatusDescription[r.reviewStatus]) || statusDescription[r.status as SubmissionStatus] || '—'}
                                            </span>
                                            {r.rejectionReason && <span className="text-[11px] text-rose-600">Comment: {r.rejectionReason}</span>}
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-5">
                                        <button
                                            onClick={() => openDetails(r)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View
                                        </button>
                                    </td>
                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(r)}
                                                disabled={!canEditOrDelete(r)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <Pencil className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(r)}
                                                disabled={!canEditOrDelete(r) || deletingId === r.id}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Submission Details</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{selected.facilityName} • {selected.scope}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5">
                            {detailsLoading ? (
                                <p className="text-sm text-slate-500">Loading details...</p>
                            ) : details.length === 0 ? (
                                <p className="text-sm text-slate-500">No activity rows found for this submission.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-[11px] uppercase text-slate-500 border-b border-slate-100">
                                            <tr>
                                                <th className="py-2 pr-3">Activity</th>
                                                <th className="py-2 pr-3">Sub Category</th>
                                                <th className="py-2 pr-3">Quantity</th>
                                                <th className="py-2">Unit</th>
                                                <th className="py-2">Factor</th>
                                                <th className="py-2">Emission</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {details.map((d) => (
                                                <tr key={d.id}>
                                                    <td className="py-2.5 pr-3 text-slate-700">{d.fuelType || d.electricitySource || d.category || 'Production'}</td>
                                                    <td className="py-2.5 pr-3 text-slate-500">{d.subCategory || '—'}</td>
                                                    <td className="py-2.5 pr-3 font-medium text-slate-700">{d.quantity ?? d.totalProduction ?? '—'}</td>
                                                    <td className="py-2.5 text-slate-500">{d.unit || '—'}</td>
                                                    <td className="py-2.5 text-slate-500">{d.emissionFactor ?? '—'}</td>
                                                    <td className="py-2.5 text-slate-700 font-medium">{d.calculatedEmission != null ? `${d.calculatedEmission} kg CO2e` : '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {selected.documents && selected.documents.length > 0 && (
                                <div className="mt-6 pt-5 border-t border-slate-100">
                                    <h4 className="text-[11px] uppercase text-slate-500 font-bold mb-3 flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5" /> Attached Documents
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {selected.documents.map((doc) => (
                                            <div key={doc.id} className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs group hover:border-emerald-200 transition-colors">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-700 max-w-[200px] truncate">{doc.fileName}</span>
                                                    <button
                                                        onClick={() => handlePreview(doc)}
                                                        disabled={!!viewingDocId}
                                                        className="text-emerald-600 hover:text-emerald-700 font-medium mt-1 flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        {viewingDocId === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />} Preview
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataEntrySubmissionsPage;
