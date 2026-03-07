import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, X, RefreshCw } from 'lucide-react';
import { ownerApi } from '../../api/services';

type ScopeType = 'SCOPE1' | 'SCOPE2' | 'SCOPE3';

interface EmissionFactorRow {
    id: string;
    scopeType: ScopeType;
    activityType: string;
    sourceName: string;
    unit: string;
    factorValue: number;
    unitOfFactor: string;
    country: string;
    year: number;
}

const TABS: { key: ScopeType; label: string }[] = [
    { key: 'SCOPE1', label: 'Scope 1 - Fuel Emission Factors' },
    { key: 'SCOPE2', label: 'Scope 2 - Electricity Emission Factors' },
    { key: 'SCOPE3', label: 'Scope 3 - Indirect Emission Factors' }
];

const AdminEmissionFactorsPage: React.FC = () => {
    const [activeScope, setActiveScope] = useState<ScopeType>('SCOPE1');
    const [rows, setRows] = useState<EmissionFactorRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        scopeType: 'SCOPE1' as ScopeType,
        activityType: '',
        sourceName: '',
        unit: '',
        factorValue: '',
        unitOfFactor: 'kg CO2e per unit',
        country: 'India',
        year: String(new Date().getFullYear())
    });

    const fetchFactors = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await ownerApi.getEmissionFactors(activeScope);
            if (res.data.success) {
                setRows(res.data.data || []);
            } else {
                setError(res.data.message || 'Failed to fetch emission factors');
            }
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to fetch emission factors');
        } finally {
            setLoading(false);
        }
    }, [activeScope]);

    useEffect(() => {
        void fetchFactors();
    }, [fetchFactors]);

    const openCreate = () => {
        setEditingId(null);
        setForm({
            scopeType: activeScope,
            activityType: '',
            sourceName: '',
            unit: '',
            factorValue: '',
            unitOfFactor: 'kg CO2e per unit',
            country: 'India',
            year: String(new Date().getFullYear())
        });
        setShowForm(true);
    };

    const openEdit = (row: EmissionFactorRow) => {
        setEditingId(row.id);
        setForm({
            scopeType: row.scopeType,
            activityType: row.activityType || '',
            sourceName: row.sourceName || '',
            unit: row.unit || '',
            factorValue: String(row.factorValue ?? ''),
            unitOfFactor: row.unitOfFactor || 'kg CO2e per unit',
            country: row.country || 'India',
            year: String(row.year ?? new Date().getFullYear())
        });
        setShowForm(true);
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                scopeType: form.scopeType,
                activityType: form.activityType,
                sourceName: form.sourceName,
                unit: form.unit,
                factorValue: Number(form.factorValue),
                unitOfFactor: form.unitOfFactor,
                country: form.country,
                year: Number(form.year)
            };
            if (editingId) {
                await ownerApi.updateEmissionFactor(editingId, payload);
            } else {
                await ownerApi.createEmissionFactor(payload);
            }
            setShowForm(false);
            await fetchFactors();
        } catch (e: any) {
            setError(e.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const deleteFactor = async (id: string) => {
        const ok = window.confirm('Delete this emission factor?');
        if (!ok) return;
        try {
            await ownerApi.deleteEmissionFactor(id);
            await fetchFactors();
        } catch (e: any) {
            setError(e.response?.data?.message || 'Delete failed');
        }
    };

    const title = useMemo(() => TABS.find(t => t.key === activeScope)?.label ?? '', [activeScope]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Emission Factors</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage emission factors used for Scope 1, Scope 2 and Scope 3 calculations.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => void fetchFactors()} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-[#23705C] text-white rounded-md text-sm font-semibold hover:bg-[#1b5e4c]">
                        <Plus className="w-4 h-4" />
                        Add Emission Factor
                    </button>
                </div>
            </div>

            <div className="flex gap-2 border-b border-slate-200">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveScope(tab.key)}
                        className={`px-4 py-3 text-sm font-semibold border-b-2 ${activeScope === tab.key ? 'border-[#23705C] text-[#23705C]' : 'border-transparent text-slate-500'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 text-sm font-semibold text-slate-700">{title}</div>
                {error && <div className="px-5 py-3 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div>}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[11px] uppercase text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3">Activity Type</th>
                                <th className="px-4 py-3">Source Name</th>
                                <th className="px-4 py-3">Unit</th>
                                <th className="px-4 py-3">Factor Value</th>
                                <th className="px-4 py-3">Unit of Factor</th>
                                <th className="px-4 py-3">Country</th>
                                <th className="px-4 py-3">Year</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">Loading...</td></tr>
                            ) : rows.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">No emission factors for this scope.</td></tr>
                            ) : rows.map(row => (
                                <tr key={row.id}>
                                    <td className="px-4 py-3">{row.activityType || '—'}</td>
                                    <td className="px-4 py-3 font-medium text-slate-700">{row.sourceName}</td>
                                    <td className="px-4 py-3">{row.unit}</td>
                                    <td className="px-4 py-3">{row.factorValue}</td>
                                    <td className="px-4 py-3">{row.unitOfFactor || 'kg CO2e per unit'}</td>
                                    <td className="px-4 py-3">{row.country}</td>
                                    <td className="px-4 py-3">{row.year}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(row)} className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => void deleteFactor(row.id)} className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-xl">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-800">{editingId ? 'Edit' : 'Add'} Emission Factor</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={submitForm} className="p-5 grid grid-cols-2 gap-4">
                            <label className="text-sm text-slate-600 col-span-1">Scope Type
                                <select className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.scopeType} onChange={e => setForm(f => ({ ...f, scopeType: e.target.value as ScopeType }))}>
                                    <option value="SCOPE1">Scope 1</option>
                                    <option value="SCOPE2">Scope 2</option>
                                    <option value="SCOPE3">Scope 3</option>
                                </select>
                            </label>
                            <label className="text-sm text-slate-600 col-span-1">Activity Type
                                <input className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.activityType} onChange={e => setForm(f => ({ ...f, activityType: e.target.value }))} required />
                            </label>
                            <label className="text-sm text-slate-600 col-span-1">Source Name
                                <input className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.sourceName} onChange={e => setForm(f => ({ ...f, sourceName: e.target.value }))} required />
                            </label>
                            <label className="text-sm text-slate-600 col-span-1">Unit
                                <input className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} required />
                            </label>
                            <label className="text-sm text-slate-600 col-span-1">Emission Factor Value
                                <input type="number" step="0.000001" min="0" className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.factorValue} onChange={e => setForm(f => ({ ...f, factorValue: e.target.value }))} required />
                            </label>
                            <label className="text-sm text-slate-600 col-span-1">Unit of Factor
                                <input className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.unitOfFactor} onChange={e => setForm(f => ({ ...f, unitOfFactor: e.target.value }))} required />
                            </label>
                            <label className="text-sm text-slate-600 col-span-1">Country / Region
                                <input className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} required />
                            </label>
                            <label className="text-sm text-slate-600 col-span-1">Year
                                <input type="number" min="1900" max="2200" className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} required />
                            </label>
                            <div className="col-span-2 flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-md border border-slate-200 text-slate-600">Cancel</button>
                                <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-[#23705C] text-white disabled:opacity-60">
                                    {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEmissionFactorsPage;
