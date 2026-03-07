import React, { useEffect, useMemo, useState } from 'react';
import { Download, Calendar, Building2, Layers } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { dashboardApi, dataEntryApi, ownerApi, reportApi, reportingYearApi } from '../../api/services';

interface ReportingYearOption { id: string; yearLabel: string; }
interface FacilityOption { id: string; name: string; }
interface SubmissionRow {
    submissionId?: string;
    scope: string;
    facilityId?: string;
    facilityName: string;
    reportingYear: string;
    totalEmission?: number;
    status: string;
}

const COLORS = { SCOPE1: '#3b82f6', SCOPE2: '#f59e0b', SCOPE3: '#8b5cf6' };

const OwnerEmissionsPage: React.FC = () => {
    const [years, setYears] = useState<ReportingYearOption[]>([]);
    const [facilities, setFacilities] = useState<FacilityOption[]>([]);
    const [selectedYearId, setSelectedYearId] = useState('');
    const [selectedFacilityId, setSelectedFacilityId] = useState('ALL');
    const [selectedScope, setSelectedScope] = useState<'ALL' | 'SCOPE1' | 'SCOPE2' | 'SCOPE3'>('ALL');
    const [rows, setRows] = useState<SubmissionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [yrRes, facRes, apprRes] = await Promise.all([
                    reportingYearApi.getAll(),
                    ownerApi.getFacilities(),
                    dataEntryApi.getApproved(),
                ]);

                const yearOptions = (yrRes.data.data || []).map((y: any) => ({ id: y.id, yearLabel: y.yearLabel }));
                setYears(yearOptions);
                if (yearOptions.length > 0) setSelectedYearId(yearOptions[0].id);

                setFacilities((facRes.data.data || []).map((f: any) => ({ id: f.id, name: f.name })));
                setRows(apprRes.data.data || []);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    const selectedYearLabel = useMemo(
        () => years.find(y => y.id === selectedYearId)?.yearLabel,
        [years, selectedYearId]
    );

    const filteredRows = useMemo(() => {
        return rows.filter(r => {
            if (r.status !== 'VERIFIED') return false;
            if (selectedYearLabel && r.reportingYear !== selectedYearLabel) return false;
            if (selectedFacilityId !== 'ALL' && r.facilityId !== selectedFacilityId) return false;
            if (selectedScope !== 'ALL' && r.scope !== selectedScope) return false;
            return true;
        });
    }, [rows, selectedYearLabel, selectedFacilityId, selectedScope]);

    const totals = useMemo(() => {
        const t = { total: 0, scope1: 0, scope2: 0, scope3: 0 };
        filteredRows.forEach(r => {
            const v = Number(r.totalEmission || 0);
            t.total += v;
            if (r.scope === 'SCOPE1') t.scope1 += v;
            if (r.scope === 'SCOPE2') t.scope2 += v;
            if (r.scope === 'SCOPE3') t.scope3 += v;
        });
        return t;
    }, [filteredRows]);

    const pieData = [
        { name: 'Scope 1', value: totals.scope1, fill: COLORS.SCOPE1 },
        { name: 'Scope 2', value: totals.scope2, fill: COLORS.SCOPE2 },
        { name: 'Scope 3', value: totals.scope3, fill: COLORS.SCOPE3 },
    ].filter(d => d.value > 0);

    const barData = useMemo(() => {
        const byYear = new Map<string, number>();
        rows.filter(r => r.status === 'VERIFIED').forEach(r => {
            byYear.set(r.reportingYear, (byYear.get(r.reportingYear) || 0) + Number(r.totalEmission || 0));
        });
        return Array.from(byYear.entries())
            .map(([year, emissions]) => ({ year, emissions, fill: '#0f766e' }))
            .sort((a, b) => a.year.localeCompare(b.year));
    }, [rows]);

    const facilityTable = useMemo(() => {
        const agg = new Map<string, { facilityName: string; emissions: number }>();
        filteredRows.forEach(r => {
            const key = r.facilityId || r.facilityName;
            const existing = agg.get(key) || { facilityName: r.facilityName, emissions: 0 };
            existing.emissions += Number(r.totalEmission || 0);
            agg.set(key, existing);
        });
        return Array.from(agg.values()).sort((a, b) => b.emissions - a.emissions);
    }, [filteredRows]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await reportApi.downloadReport();
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `emissions_report_${new Date().toISOString().slice(0, 10)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        if (!selectedYearId) return;
        void dashboardApi.getOwnerDashboard(selectedYearId);
    }, [selectedYearId]);

    if (loading) {
        return <div className="p-10 text-slate-500">Loading emissions...</div>;
    }

    return (
        <div className="space-y-6 text-slate-900 font-sans">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">Emissions</h1>
                <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] text-white rounded-md text-sm font-semibold hover:bg-[#0d645d] disabled:opacity-60">
                    <Download className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export Data'}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <select value={selectedYearId} onChange={e => setSelectedYearId(e.target.value)} className="border border-slate-200 rounded-md px-3 py-2 text-sm">
                            {years.map(y => <option key={y.id} value={y.id}>{y.yearLabel}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <select value={selectedFacilityId} onChange={e => setSelectedFacilityId(e.target.value)} className="border border-slate-200 rounded-md px-3 py-2 text-sm">
                            <option value="ALL">All Facilities</option>
                            {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-500" />
                        <select value={selectedScope} onChange={e => setSelectedScope(e.target.value as any)} className="border border-slate-200 rounded-md px-3 py-2 text-sm">
                            <option value="ALL">Scope: All</option>
                            <option value="SCOPE1">Scope 1</option>
                            <option value="SCOPE2">Scope 2</option>
                            <option value="SCOPE3">Scope 3</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Annual Emissions Over Time</h2>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="emissions" radius={[2, 2, 0, 0]} barSize={36}>
                                        {barData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Scope Breakdown</h2>
                        <div className="flex items-center h-[250px]">
                            <div className="w-[55%] h-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" stroke="none">
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-slate-800">{Math.round(totals.total).toLocaleString()}</span>
                                    <span className="text-xs font-semibold text-slate-500">kg CO2e</span>
                                </div>
                            </div>
                            <div className="w-[45%] pl-5 space-y-3">
                                {pieData.map(p => (
                                    <div key={p.name} className="text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.fill }} />
                                            <span className="font-semibold text-slate-700">{p.name}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 ml-5">{Math.round(p.value).toLocaleString()} kg CO2e</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-base font-bold text-slate-800">Facility Comparison</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[13px] font-semibold text-slate-600 border-b border-slate-100 bg-[#fbfbfc]">
                            <tr>
                                <th className="py-4 px-6">Facility Name</th>
                                <th className="py-4 px-6">Reporting Year</th>
                                <th className="py-4 px-6 text-right">Emissions (kg CO2e)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[13px] text-slate-800">
                            {facilityTable.length === 0 ? (
                                <tr><td colSpan={3} className="py-8 px-6 text-center text-slate-400">No verified data for selected filters.</td></tr>
                            ) : facilityTable.map((f) => (
                                <tr key={f.facilityName} className="hover:bg-slate-50">
                                    <td className="py-4 px-6 font-semibold">{f.facilityName}</td>
                                    <td className="py-4 px-6 text-slate-600">{selectedYearLabel || '—'}</td>
                                    <td className="py-4 px-6 text-right font-medium">{Math.round(f.emissions).toLocaleString()} kg CO2e</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OwnerEmissionsPage;
