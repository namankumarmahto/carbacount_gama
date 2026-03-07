import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ownerApi } from '../../api/services';

interface OrgSettingsForm {
    legalCompanyName: string;
    industryType: string;
    country: string;
    state: string;
    city: string;
    registeredAddress: string;
    contactEmail: string;
    contactPhone: string;
    netZeroTargetYear: string;
    reportingBoundary: string;
}

const OwnerOrgSettingsPage: React.FC = () => {
    const [form, setForm] = useState<OrgSettingsForm>({
        legalCompanyName: '',
        industryType: '',
        country: '',
        state: '',
        city: '',
        registeredAddress: '',
        contactEmail: '',
        contactPhone: '',
        netZeroTargetYear: '',
        reportingBoundary: 'Operational Control',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await ownerApi.getOrgSettings();
                const d = res.data.data;
                setForm({
                    legalCompanyName: d?.legalCompanyName || '',
                    industryType: d?.industryType || '',
                    country: d?.country || '',
                    state: d?.state || '',
                    city: d?.city || '',
                    registeredAddress: d?.registeredAddress || '',
                    contactEmail: d?.contactEmail || '',
                    contactPhone: d?.contactPhone || '',
                    netZeroTargetYear: d?.netZeroTargetYear ? String(d.netZeroTargetYear) : '',
                    reportingBoundary: d?.reportingBoundary || 'Operational Control',
                });
            } catch (e: any) {
                setError(e.response?.data?.message || 'Failed to load organization settings.');
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    const onSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const payload = {
                ...form,
                netZeroTargetYear: form.netZeroTargetYear ? Number(form.netZeroTargetYear) : null,
            };
            const res = await ownerApi.updateOrgSettings(payload);
            const d = res.data.data;
            setForm((prev) => ({
                ...prev,
                legalCompanyName: d?.legalCompanyName || prev.legalCompanyName,
                industryType: d?.industryType || prev.industryType,
                country: d?.country || prev.country,
                state: d?.state || '',
                city: d?.city || '',
                registeredAddress: d?.registeredAddress || '',
                contactEmail: d?.contactEmail || '',
                contactPhone: d?.contactPhone || '',
                netZeroTargetYear: d?.netZeroTargetYear ? String(d.netZeroTargetYear) : '',
                reportingBoundary: d?.reportingBoundary || prev.reportingBoundary,
            }));
            setSuccess('Organization settings saved successfully.');
            setTimeout(() => setSuccess(''), 3500);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Organization Settings</h1>

            {success && <div className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{success}</div>}
            {error && <div className="px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Organization Info</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="text-sm text-slate-600">Legal Company Name
                        <input className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.legalCompanyName} onChange={e => setForm(f => ({ ...f, legalCompanyName: e.target.value }))} />
                    </label>
                    <label className="text-sm text-slate-600">Industry Type
                        <input className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.industryType} onChange={e => setForm(f => ({ ...f, industryType: e.target.value }))} />
                    </label>
                    <label className="text-sm text-slate-600">Country
                        <input className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
                    </label>
                    <label className="text-sm text-slate-600">State
                        <input className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                    </label>
                    <label className="text-sm text-slate-600">City
                        <input className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                    </label>
                    <label className="text-sm text-slate-600">Net Zero Target Year
                        <input type="number" className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.netZeroTargetYear} onChange={e => setForm(f => ({ ...f, netZeroTargetYear: e.target.value }))} />
                    </label>
                    <label className="text-sm text-slate-600 md:col-span-2">Registered Address
                        <input className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.registeredAddress} onChange={e => setForm(f => ({ ...f, registeredAddress: e.target.value }))} />
                    </label>
                    <label className="text-sm text-slate-600">Contact Email
                        <input type="email" className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
                    </label>
                    <label className="text-sm text-slate-600">Contact Phone
                        <input className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} />
                    </label>
                    <label className="text-sm text-slate-600">Reporting Boundary
                        <select className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 bg-white" value={form.reportingBoundary} onChange={e => setForm(f => ({ ...f, reportingBoundary: e.target.value }))}>
                            <option>Operational Control</option>
                            <option>Financial Control</option>
                            <option>Equity Share</option>
                        </select>
                    </label>
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={onSave} disabled={saving} className="px-6 py-2.5 bg-[#1a4030] text-white rounded-md text-sm font-bold hover:bg-[#133024] disabled:opacity-60">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OwnerOrgSettingsPage;
