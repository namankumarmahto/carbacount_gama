import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X,
    Loader2, Building2, CheckCircle2, AlertCircle, ChevronDown, MapPin,
    ToggleLeft, ToggleRight
} from 'lucide-react';
import { ownerApi, referenceApi } from '../../api/services';

interface Facility {
    id: string;
    name: string;
    country: string;
    state: string;
    city: string;
    productType: string;
    productionCapacity: number;
    status: string;
}

interface Country { id: string; name: string; }
interface StateOption { id: string; name: string; }

const BLANK_FORM = {
    name: '',
    country: '',
    countryId: '',
    state: '',
    stateId: '',
    city: '',
    productType: '',
    productionCapacity: 0,
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    if (status === 'ACTIVE') return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />ACTIVE
        </span>
    );
    if (status === 'INACTIVE') return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />INACTIVE
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            {status}
        </span>
    );
};

const OwnerFacilitiesPage: React.FC = () => {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Delete confirmation modal
    const [deleteTarget, setDeleteTarget] = useState<Facility | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form state
    const [form, setForm] = useState({ ...BLANK_FORM });

    // Reference data
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<StateOption[]>([]);
    const [loadingStates, setLoadingStates] = useState(false);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };
    const showError = (msg: string) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(''), 5000);
    };

    const fetchFacilities = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ownerApi.getFacilities();
            if (res.data.success) setFacilities(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    const fetchCountries = useCallback(async () => {
        try {
            const res = await referenceApi.getCountries();
            if (res.data.success) setCountries(res.data.data);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchFacilities(); fetchCountries(); }, [fetchFacilities, fetchCountries]);

    const fetchStates = async (countryId: string): Promise<StateOption[]> => {
        if (!countryId) { setStates([]); return []; }
        setLoadingStates(true);
        try {
            const res = await referenceApi.getStates(countryId);
            if (res.data.success) {
                setStates(res.data.data);
                return res.data.data as StateOption[];
            }
            return [];
        } catch (e) { setStates([]); return []; }
        finally { setLoadingStates(false); }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = countries.find(c => c.id === e.target.value);
        setForm(prev => ({ ...prev, countryId: e.target.value, country: selected?.name ?? '', stateId: '', state: '' }));
        fetchStates(e.target.value);
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = states.find(s => s.id === e.target.value);
        setForm(prev => ({ ...prev, stateId: e.target.value, state: selected?.name ?? '' }));
    };

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...BLANK_FORM });
        setStates([]);
        setIsModalOpen(true);
    };

    const openEdit = async (f: Facility) => {
        setEditingId(f.id);
        const foundCountry = countries.find(c => c.name === f.country);
        // Set form with empty stateId first so modal opens fast
        setForm({
            name: f.name,
            country: f.country,
            countryId: foundCountry?.id ?? '',
            state: f.state,
            stateId: '',
            city: f.city,
            productType: f.productType ?? '',
            productionCapacity: f.productionCapacity ?? 0,
        });
        setIsModalOpen(true);
        // Load states for the country, then match saved state name → id
        if (foundCountry?.id) {
            const loadedStates = await fetchStates(foundCountry.id);
            const foundState = loadedStates.find(s => s.name === f.state);
            if (foundState) {
                setForm(prev => ({ ...prev, stateId: foundState.id }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { showError('Facility name is required.'); return; }
        if (!form.country) { showError('Please select a country.'); return; }
        setSubmitting(true);
        try {
            const payload = {
                name: form.name,
                country: form.country,
                state: form.state,
                city: form.city,
                productType: form.productType,
                productionCapacity: form.productionCapacity,
            };

            if (editingId) {
                /* ── EDIT: hit PUT /api/owner/facilities/{id} ── */
                const res = await ownerApi.updateFacility(editingId, payload);
                if (res.data.success) {
                    setFacilities(prev => prev.map(f =>
                        f.id === editingId ? { ...f, ...res.data.data } : f
                    ));
                    showSuccess('Facility updated successfully!');
                }
            } else {
                /* ── CREATE ── */
                const res = await ownerApi.createFacility(payload);
                if (res.data.success) {
                    setFacilities(prev => [...prev, res.data.data]);
                    showSuccess('Facility created successfully!');
                }
            }
            setIsModalOpen(false);
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to save facility.');
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Toggle ACTIVE / INACTIVE ── */
    const handleToggleStatus = async (f: Facility) => {
        setTogglingId(f.id);
        try {
            const res = await ownerApi.toggleFacilityStatus(f.id);
            if (res.data.success) {
                setFacilities(prev => prev.map(item =>
                    item.id === f.id ? { ...item, status: res.data.data.status } : item
                ));
                showSuccess(`"${f.name}" is now ${res.data.data.status}.`);
            }
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setTogglingId(null);
        }
    };

    /* ── Permanent delete (after confirmation modal) ── */
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeletingId(deleteTarget.id);
        try {
            await ownerApi.deleteFacilityPermanently(deleteTarget.id);
            setFacilities(prev => prev.filter(f => f.id !== deleteTarget.id));
            showSuccess(`"${deleteTarget.name}" has been permanently deleted.`);
            setDeleteTarget(null);
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to delete facility.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Facilities</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your organization's physical locations.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1a4030] text-white text-sm font-semibold rounded-xl hover:bg-[#133024] transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Facility
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
                    <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" />{errorMsg}</span>
                    <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[12px] font-semibold text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="py-3.5 px-6">Facility Name</th>
                                <th className="py-3.5 px-6">Location</th>
                                <th className="py-3.5 px-6">Product Type</th>
                                <th className="py-3.5 px-6">Capacity (MT/yr)</th>
                                <th className="py-3.5 px-6">Status</th>
                                <th className="py-3.5 px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[13px] text-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <Loader2 className="w-7 h-7 animate-spin text-[#1a4030] mx-auto" />
                                        <p className="mt-2 text-sm text-slate-400">Loading facilities…</p>
                                    </td>
                                </tr>
                            ) : facilities.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                        <p className="text-sm text-slate-400">No facilities yet. Click <strong>Add Facility</strong> to create one.</p>
                                    </td>
                                </tr>
                            ) : facilities.map(f => (
                                <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-[#1a4030]/10 flex items-center justify-center flex-shrink-0">
                                                <Building2 className="w-4 h-4 text-[#1a4030]" />
                                            </div>
                                            <span className="font-semibold text-slate-800">{f.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                            <span>{[f.city, f.state, f.country].filter(Boolean).join(', ')}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-slate-600">{f.productType || '—'}</td>
                                    <td className="py-4 px-6 font-semibold text-slate-700">
                                        {f.productionCapacity?.toLocaleString()}
                                        <span className="font-normal text-slate-400 ml-1">MT/yr</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <StatusBadge status={f.status} />
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            {/* Edit */}
                                            <button
                                                onClick={() => openEdit(f)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1a4030] bg-[#1a4030]/5 border border-[#1a4030]/20 rounded-lg hover:bg-[#1a4030]/10 transition-colors"
                                                title="Edit facility"
                                            >
                                                <Pencil className="w-3 h-3" /> Edit
                                            </button>

                                            {/* Toggle Status */}
                                            <button
                                                onClick={() => handleToggleStatus(f)}
                                                disabled={togglingId === f.id}
                                                title={f.status === 'ACTIVE' ? 'Set Inactive' : 'Set Active'}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 ${f.status === 'ACTIVE'
                                                    ? 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                                    : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                                    }`}
                                            >
                                                {togglingId === f.id
                                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                                    : f.status === 'ACTIVE'
                                                        ? <><ToggleRight className="w-3.5 h-3.5" /> Deactivate</>
                                                        : <><ToggleLeft className="w-3.5 h-3.5" /> Activate</>
                                                }
                                            </button>

                                            {/* Delete */}
                                            <button
                                                onClick={() => setDeleteTarget(f)}
                                                title="Permanently delete"
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3.5 border-t border-slate-50 flex items-center justify-between bg-white">
                    <span className="text-xs text-slate-400">{facilities.length} {facilities.length === 1 ? 'facility' : 'facilities'}</span>
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-30" disabled>
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-30" disabled>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Add / Edit Modal ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[680px] overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    {editingId ? 'Edit Facility' : 'Add Facility'}
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">All fields marked * are required</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
                            {/* Facility Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">
                                    Facility Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Mumbai Production Plant"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a4030]/20 focus:border-[#1a4030] placeholder:text-slate-300 transition-all bg-slate-50/30"
                                />
                            </div>

                            {/* Country + State */}
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Country <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={form.countryId}
                                            onChange={handleCountryChange}
                                            className="appearance-none w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a4030]/20 focus:border-[#1a4030] bg-slate-50/30 pr-10"
                                        >
                                            <option value="">Select country…</option>
                                            {countries.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">
                                        State / Province <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        {loadingStates ? (
                                            <div className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-400 bg-slate-50/30">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                                            </div>
                                        ) : states.length > 0 ? (
                                            <>
                                                <select
                                                    required
                                                    value={form.stateId}
                                                    onChange={handleStateChange}
                                                    className="appearance-none w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a4030]/20 focus:border-[#1a4030] bg-slate-50/30 pr-10"
                                                >
                                                    <option value="">Select state…</option>
                                                    {states.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                            </>
                                        ) : (
                                            <input
                                                type="text"
                                                value={form.state}
                                                onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                                                placeholder={form.countryId ? 'Enter state / province' : 'Select a country first'}
                                                disabled={!form.countryId}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a4030]/20 focus:border-[#1a4030] bg-slate-50/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* City + Product Type */}
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">
                                        City <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.city}
                                        onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                                        placeholder="e.g. Mumbai"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a4030]/20 focus:border-[#1a4030] placeholder:text-slate-300 transition-all bg-slate-50/30"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Product Type <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.productType}
                                        onChange={e => setForm(p => ({ ...p, productType: e.target.value }))}
                                        placeholder="e.g. Steel, Cement, Electronics"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a4030]/20 focus:border-[#1a4030] placeholder:text-slate-300 transition-all bg-slate-50/30"
                                    />
                                </div>
                            </div>

                            {/* Production Capacity */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">
                                    Production Capacity (Metric tons/yr) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        min={0}
                                        value={form.productionCapacity}
                                        onChange={e => setForm(p => ({ ...p, productionCapacity: Number(e.target.value) }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a4030]/20 focus:border-[#1a4030] transition-all bg-slate-50/30 pr-20"
                                    />
                                    <span className="absolute right-4 top-2.5 text-xs text-slate-400 font-medium">MT/yr</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1a4030] text-white text-sm font-semibold hover:bg-[#133024] transition-colors shadow-sm disabled:opacity-60"
                                >
                                    {submitting
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                        : <>{editingId ? 'Update Facility' : 'Save Facility'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-rose-500" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 mb-2">Delete Facility?</h2>
                            <p className="text-sm text-slate-500 mb-1">
                                You are about to permanently delete:
                            </p>
                            <p className="text-sm font-semibold text-slate-800 mb-4">
                                "{deleteTarget.name}"
                            </p>
                            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs text-rose-600 text-left mb-6">
                                ⚠️ This will <strong>permanently remove</strong> the facility and all its user assignments from the database. This action <strong>cannot be undone</strong>.
                            </div>
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={deletingId === deleteTarget.id}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-60"
                                >
                                    {deletingId === deleteTarget.id
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                                        : <><Trash2 className="w-4 h-4" /> Yes, Delete Permanently</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerFacilitiesPage;
