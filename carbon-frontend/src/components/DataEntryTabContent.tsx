import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    ChevronDown, Trash2, Plus, Building2, Loader2, CheckCircle2,
    X, Zap, Truck, Factory, Calendar, PlusCircle, Upload, FileText
} from 'lucide-react';
import { dataEntryApi, ownerApi, referenceApi, reportingYearApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

/* ── Types ── */
interface FacilityOption { id: string; name: string; }
interface ReportingYearOption { id: string; yearLabel: string; startDate: string; endDate: string; isLocked: boolean; }
interface FactorOption { activityType: string; source: string; unit: string; factorValue?: number; factorUnit?: string; year?: number; }
interface FuelRow { activityType: string; fuelType: string; unit: string; quantity: string; factorUnit?: string; emissionFactor?: number; calculatedEmission?: number; loading?: boolean; }
interface ElecRow { activityType: string; electricitySource: string; unit: string; quantity: string; factorUnit?: string; emissionFactor?: number; calculatedEmission?: number; loading?: boolean; }
interface Scope3Row { activityCategory: string; subCategory: string; unit: string; quantity: string; factorUnit?: string; emissionFactor?: number; calculatedEmission?: number; loading?: boolean; }
interface ProductionRow { totalProduction: string; unit: string; }

type ActiveTab = 'scope1' | 'scope2' | 'scope3' | 'production';

/* ── Constants ── */
const UNITS_PRODUCTION = ['ton (metric tons)', 'MT', 'Units', 'kg', 'Litres', 'kWh'];

const TAB_CONFIG: { key: ActiveTab; label: string }[] = [
    { key: 'scope1', label: 'Scope 1' },
    { key: 'scope2', label: 'Scope 2' },
    { key: 'scope3', label: 'Scope 3' },
    { key: 'production', label: 'Production Data' },
];

const sel = 'appearance-none w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-md py-2.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]';
const inp = 'w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-md py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E]';
const formatEmission = (v?: number) => (v ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 6 });

const DataEntryTabContent: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const isDataEntry = user?.role === 'DATA_ENTRY';
    const editingSubmissionId = searchParams.get('editSubmissionId');
    const [activeTab, setActiveTab] = useState<ActiveTab>('scope1');

    // ── Facilities ──
    const [facilities, setFacilities] = useState<FacilityOption[]>([]);
    const [facilityId, setFacilityId] = useState('');

    // ── Reporting Years ──
    const [reportingYears, setReportingYears] = useState<ReportingYearOption[]>([]);
    const [reportingYearId, setReportingYearId] = useState('');
    const [loadingYears, setLoadingYears] = useState(true);

    // ── Add Period modal ──
    const [showAddPeriod, setShowAddPeriod] = useState(false);
    const [periodForm, setPeriodForm] = useState({ yearLabel: '', startDate: '', endDate: '' });
    const [savingPeriod, setSavingPeriod] = useState(false);
    const [periodError, setPeriodError] = useState('');

    // ── Data rows ──
    const [scope1Options, setScope1Options] = useState<FactorOption[]>([]);
    const [scope2Options, setScope2Options] = useState<FactorOption[]>([]);
    const [scope3Options, setScope3Options] = useState<FactorOption[]>([]);
    const [fuelRows, setFuelRows] = useState<FuelRow[]>([]);
    const [elecRows, setElecRows] = useState<ElecRow[]>([]);
    const [scope3Rows, setScope3Rows] = useState<Scope3Row[]>([]);
    const [productionRow, setProductionRow] = useState<ProductionRow>({ totalProduction: '', unit: 'ton (metric tons)' });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [loadingEditSubmission, setLoadingEditSubmission] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const sourcesByActivity = (options: FactorOption[]) =>
        options.reduce<Record<string, string[]>>((acc, option) => {
            if (!acc[option.activityType]) acc[option.activityType] = [];
            if (!acc[option.activityType].includes(option.source)) acc[option.activityType].push(option.source);
            return acc;
        }, {});

    const newFuelRow = (options: FactorOption[]): FuelRow => {
        const first = options[0];
        return {
            activityType: first?.activityType ?? '',
            fuelType: first?.source ?? '',
            unit: first?.unit ?? '',
            quantity: '',
            factorUnit: first?.factorUnit,
        };
    };

    const newElecRow = (options: FactorOption[]): ElecRow => {
        const first = options[0];
        return {
            activityType: first?.activityType ?? '',
            electricitySource: first?.source ?? '',
            unit: first?.unit ?? '',
            quantity: '',
            factorUnit: first?.factorUnit,
        };
    };

    const newScope3Row = (options: FactorOption[]): Scope3Row => {
        const first = options[0];
        return {
            activityCategory: first?.activityType ?? '',
            subCategory: first?.source ?? '',
            unit: first?.unit ?? '',
            quantity: '',
            factorUnit: first?.factorUnit,
        };
    };

    /* ── Fetch facilities (ACTIVE only) ── */
    const fetchFacilities = useCallback(async () => {
        try {
            const res = isDataEntry ? await dataEntryApi.getMyFacilities() : await ownerApi.getFacilities();
            if (res.data.success) {
                const active = res.data.data.filter((f: any) => f.status === 'ACTIVE');
                setFacilities(active);
                if (active.length > 0) setFacilityId(active[0].id);
            }
        } catch (e) { console.error(e); }
    }, [isDataEntry]);

    /* ── Fetch reporting years ── */
    const fetchReportingYears = useCallback(async () => {
        setLoadingYears(true);
        try {
            const res = await reportingYearApi.getAll();
            if (res.data.success) {
                setReportingYears(res.data.data as ReportingYearOption[]);
                if (res.data.data.length > 0) setReportingYearId(res.data.data[0].id);
            }
        } catch (e) { console.error(e); }
        finally { setLoadingYears(false); }
    }, []);

    const fetchScopeOptions = useCallback(async () => {
        try {
            const [s1, s2, s3] = await Promise.all([
                referenceApi.getEmissionFactors('SCOPE1'),
                referenceApi.getEmissionFactors('SCOPE2'),
                referenceApi.getEmissionFactors('SCOPE3'),
            ]);
            const s1Options: FactorOption[] = s1.data.data?.options ?? [];
            const s2Options: FactorOption[] = s2.data.data?.options ?? [];
            const s3Options: FactorOption[] = s3.data.data?.options ?? [];
            setScope1Options(s1Options);
            setScope2Options(s2Options);
            setScope3Options(s3Options);

            setFuelRows(prev => prev.length ? prev : [newFuelRow(s1Options)]);
            setElecRows(prev => prev.length ? prev : [newElecRow(s2Options)]);
            setScope3Rows(prev => prev.length ? prev : [newScope3Row(s3Options)]);
        } catch (e) {
            console.error(e);
            setErrorMsg('Failed to load dynamic emission factor options.');
        }
    }, []);

    useEffect(() => { fetchFacilities(); fetchReportingYears(); void fetchScopeOptions(); }, [fetchFacilities, fetchReportingYears, fetchScopeOptions]);
    useEffect(() => {
        const loadEditableSubmission = async () => {
            if (!editingSubmissionId) return;
            setLoadingEditSubmission(true);
            setErrorMsg('');
            try {
                const res = await dataEntryApi.getEditableSubmission(editingSubmissionId);
                const data = res.data.data;
                setFacilityId(data.facilityId);
                setReportingYearId(data.reportingYearId);
                const scopeToTab: Record<string, ActiveTab> = {
                    SCOPE1: 'scope1',
                    SCOPE2: 'scope2',
                    SCOPE3: 'scope3',
                    PRODUCTION: 'production',
                };
                setActiveTab(scopeToTab[data.scope] ?? 'scope1');

                if (data.scope === 'SCOPE1') {
                    setFuelRows((data.fuelRows || []).map((r: any) => ({
                        activityType: r.fuelType || '',
                        fuelType: r.fuelType || '',
                        unit: r.unit || '',
                        quantity: String(r.quantity ?? ''),
                    })));
                } else if (data.scope === 'SCOPE2') {
                    setElecRows((data.electricityRows || []).map((r: any) => ({
                        activityType: r.electricitySource || '',
                        electricitySource: r.electricitySource || '',
                        unit: r.unit || '',
                        quantity: String(r.quantity ?? ''),
                    })));
                } else if (data.scope === 'SCOPE3') {
                    setScope3Rows((data.scope3Rows || []).map((r: any) => ({
                        activityCategory: r.category || '',
                        subCategory: r.subCategory || '',
                        unit: r.unit || '',
                        quantity: String(r.quantity ?? ''),
                    })));
                } else if (data.scope === 'PRODUCTION' && data.productionData) {
                    setProductionRow({
                        totalProduction: String(data.productionData.totalProduction ?? ''),
                        unit: data.productionData.unit || 'ton (metric tons)',
                    });
                }
            } catch (e: any) {
                setErrorMsg(e.response?.data?.message || 'Failed to load editable submission.');
            } finally {
                setLoadingEditSubmission(false);
            }
        };
        void loadEditableSubmission();
    }, [editingSubmissionId]);

    useEffect(() => {
        fuelRows.forEach((_, i) => { void calculateFuelRow(i, fuelRows); });
        elecRows.forEach((_, i) => { void calculateElecRow(i, elecRows); });
        scope3Rows.forEach((_, i) => { void calculateScope3Row(i, scope3Rows); });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facilityId]);

    /* ── Add new reporting period ── */
    const handleAddPeriod = async (e: React.FormEvent) => {
        e.preventDefault();
        setPeriodError('');
        if (!periodForm.yearLabel.trim() || !periodForm.startDate || !periodForm.endDate) {
            setPeriodError('All fields are required.'); return;
        }
        if (periodForm.endDate <= periodForm.startDate) {
            setPeriodError('End date must be after start date.'); return;
        }
        setSavingPeriod(true);
        try {
            const res = await reportingYearApi.create(periodForm);
            if (res.data.success) {
                await fetchReportingYears();
                setReportingYearId(res.data.data.id);
                setShowAddPeriod(false);
                setPeriodForm({ yearLabel: '', startDate: '', endDate: '' });
            }
        } catch (err: any) {
            setPeriodError(err.response?.data?.message || 'Failed to create period.');
        } finally { setSavingPeriod(false); }
    };

    /* ── row helpers ── */
    const addFuelRow = () => setFuelRows(r => [...r, newFuelRow(scope1Options)]);
    const removeFuelRow = (i: number) => setFuelRows(r => r.filter((_, idx) => idx !== i));
    const syncFuelUnitsAndFactor = async (index: number, rows: FuelRow[]) => {
        const row = rows[index];
        if (!row.fuelType) return;
        try {
            const unitsRes = await referenceApi.getEmissionFactorUnits('SCOPE1', row.fuelType);
            const units = unitsRes.data.data ?? [];
            const unitToUse = units.includes(row.unit) ? row.unit : (units[0] ?? '');
            const factorRes = unitToUse
                ? await referenceApi.getEmissionFactorValue({ scope: 'SCOPE1', source: row.fuelType, unit: unitToUse, activityType: row.activityType })
                : null;
            setFuelRows(prev => prev.map((r, i) => i === index ? {
                ...r,
                unit: unitToUse,
                emissionFactor: factorRes?.data.data?.factorValue,
                factorUnit: factorRes?.data.data?.factorUnit
            } : r));
        } catch {
            setFuelRows(prev => prev.map((r, i) => i === index ? { ...r, emissionFactor: undefined, factorUnit: undefined } : r));
        }
    };
    const calculateFuelRow = async (index: number, rows: FuelRow[]) => {
        const row = rows[index];
        const quantity = parseFloat(row.quantity);
        if (!facilityId || Number.isNaN(quantity) || quantity < 0 || !row.fuelType) {
            setFuelRows(prev => prev.map((r, i) => i === index ? { ...r, calculatedEmission: undefined, loading: false } : r));
            return;
        }
        setFuelRows(prev => prev.map((r, i) => i === index ? { ...r, loading: true } : r));
        try {
            const res = await dataEntryApi.calculate({
                facilityId,
                scope: 'SCOPE1',
                fuelType: row.fuelType,
                unit: row.unit,
                quantity,
                activityType: row.activityType
            });
            const data = res.data.data;
            setFuelRows(prev => prev.map((r, i) => i === index ? { ...r, emissionFactor: data?.emissionFactor, calculatedEmission: data?.calculatedEmission, loading: false } : r));
        } catch {
            setFuelRows(prev => prev.map((r, i) => i === index ? { ...r, emissionFactor: undefined, calculatedEmission: undefined, loading: false } : r));
            setErrorMsg('Emission factor not found for selected Fuel/Unit/Facility.');
        }
    };
    const updateFuel = (i: number, field: keyof FuelRow, val: string) =>
        setFuelRows(r => {
            const next = r.map((row, idx) => idx === i ? { ...row, [field]: val, calculatedEmission: field === 'quantity' ? row.calculatedEmission : undefined } : row);
            if (field === 'activityType') {
                const mapping = sourcesByActivity(scope1Options);
                const source = mapping[val]?.[0] ?? '';
                next[i] = { ...next[i], fuelType: source };
            }
            if (field === 'activityType' || field === 'fuelType' || field === 'unit') {
                void syncFuelUnitsAndFactor(i, next);
            }
            void calculateFuelRow(i, next);
            return next;
        });

    const addElecRow = () => setElecRows(r => [...r, newElecRow(scope2Options)]);
    const removeElecRow = (i: number) => setElecRows(r => r.filter((_, idx) => idx !== i));
    const syncElecUnitsAndFactor = async (index: number, rows: ElecRow[]) => {
        const row = rows[index];
        if (!row.electricitySource) return;
        try {
            const unitsRes = await referenceApi.getEmissionFactorUnits('SCOPE2', row.electricitySource);
            const units = unitsRes.data.data ?? [];
            const unitToUse = units.includes(row.unit) ? row.unit : (units[0] ?? '');
            const factorRes = unitToUse
                ? await referenceApi.getEmissionFactorValue({ scope: 'SCOPE2', source: row.electricitySource, unit: unitToUse, activityType: row.activityType })
                : null;
            setElecRows(prev => prev.map((r, i) => i === index ? {
                ...r,
                unit: unitToUse,
                emissionFactor: factorRes?.data.data?.factorValue,
                factorUnit: factorRes?.data.data?.factorUnit
            } : r));
        } catch {
            setElecRows(prev => prev.map((r, i) => i === index ? { ...r, emissionFactor: undefined, factorUnit: undefined } : r));
        }
    };
    const calculateElecRow = async (index: number, rows: ElecRow[]) => {
        const row = rows[index];
        const quantity = parseFloat(row.quantity);
        if (!facilityId || Number.isNaN(quantity) || quantity < 0 || !row.electricitySource) {
            setElecRows(prev => prev.map((r, i) => i === index ? { ...r, calculatedEmission: undefined, loading: false } : r));
            return;
        }
        setElecRows(prev => prev.map((r, i) => i === index ? { ...r, loading: true } : r));
        try {
            const res = await dataEntryApi.calculate({
                facilityId,
                scope: 'SCOPE2',
                electricitySource: row.electricitySource,
                unit: row.unit,
                quantity,
                activityType: row.activityType
            });
            const data = res.data.data;
            setElecRows(prev => prev.map((r, i) => i === index ? { ...r, emissionFactor: data?.emissionFactor, calculatedEmission: data?.calculatedEmission, loading: false } : r));
        } catch {
            setElecRows(prev => prev.map((r, i) => i === index ? { ...r, emissionFactor: undefined, calculatedEmission: undefined, loading: false } : r));
            setErrorMsg('Emission factor not found for selected Electricity Source/Unit/Facility.');
        }
    };
    const updateElec = (i: number, field: keyof ElecRow, val: string) =>
        setElecRows(r => {
            const next = r.map((row, idx) => idx === i ? { ...row, [field]: val, calculatedEmission: field === 'quantity' ? row.calculatedEmission : undefined } : row);
            if (field === 'activityType') {
                const mapping = sourcesByActivity(scope2Options);
                const source = mapping[val]?.[0] ?? '';
                next[i] = { ...next[i], electricitySource: source };
            }
            if (field === 'activityType' || field === 'electricitySource' || field === 'unit') {
                void syncElecUnitsAndFactor(i, next);
            }
            void calculateElecRow(i, next);
            return next;
        });

    const addScope3Row = () => setScope3Rows(r => [...r, newScope3Row(scope3Options)]);
    const removeScope3Row = (i: number) => setScope3Rows(r => r.filter((_, idx) => idx !== i));
    const syncScope3UnitsAndFactor = async (index: number, rows: Scope3Row[]) => {
        const row = rows[index];
        if (!row.subCategory) return;
        try {
            const unitsRes = await referenceApi.getEmissionFactorUnits('SCOPE3', row.subCategory);
            const units = unitsRes.data.data ?? [];
            const unitToUse = units.includes(row.unit) ? row.unit : (units[0] ?? '');
            const factorRes = unitToUse
                ? await referenceApi.getEmissionFactorValue({ scope: 'SCOPE3', source: row.subCategory, unit: unitToUse, activityType: row.activityCategory })
                : null;
            setScope3Rows(prev => prev.map((r, i) => i === index ? {
                ...r,
                unit: unitToUse,
                emissionFactor: factorRes?.data.data?.factorValue,
                factorUnit: factorRes?.data.data?.factorUnit
            } : r));
        } catch {
            setScope3Rows(prev => prev.map((r, i) => i === index ? { ...r, emissionFactor: undefined, factorUnit: undefined } : r));
        }
    };
    const calculateScope3Row = async (index: number, rows: Scope3Row[]) => {
        const row = rows[index];
        const quantity = parseFloat(row.quantity);
        if (!facilityId || Number.isNaN(quantity) || quantity < 0 || !row.activityCategory) {
            setScope3Rows(prev => prev.map((r, i) => i === index ? { ...r, calculatedEmission: undefined, loading: false } : r));
            return;
        }
        setScope3Rows(prev => prev.map((r, i) => i === index ? { ...r, loading: true } : r));
        try {
            const res = await dataEntryApi.calculate({
                facilityId,
                scope: 'SCOPE3',
                category: row.activityCategory,
                subCategory: row.subCategory,
                unit: row.unit,
                quantity,
                activityType: row.activityCategory
            });
            const data = res.data.data;
            setScope3Rows(prev => prev.map((r, i) => i === index ? { ...r, emissionFactor: data?.emissionFactor, calculatedEmission: data?.calculatedEmission, loading: false } : r));
        } catch {
            setScope3Rows(prev => prev.map((r, i) => i === index ? { ...r, emissionFactor: undefined, calculatedEmission: undefined, loading: false } : r));
            setErrorMsg('Emission factor not found for selected Scope 3 activity/unit/facility.');
        }
    };
    const updateScope3 = (i: number, field: keyof Scope3Row, val: string) => {
        setScope3Rows(r => {
            const next = r.map((row, idx) => {
                if (idx !== i) return row;
                const updated = { ...row, [field]: val, calculatedEmission: field === 'quantity' ? row.calculatedEmission : undefined };
                if (field === 'activityCategory') {
                    const mapping = sourcesByActivity(scope3Options);
                    updated.subCategory = mapping[val]?.[0] ?? '';
                }
                return updated;
            });
            if (field === 'activityCategory' || field === 'subCategory' || field === 'unit') {
                void syncScope3UnitsAndFactor(i, next);
            }
            void calculateScope3Row(i, next);
            return next;
        });
    };

    const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 5000); };

    const handleSave = async () => {
        if (!facilityId) { setErrorMsg('Please select a facility.'); return; }
        if (!reportingYearId) { setErrorMsg('Please select a reporting period.'); return; }
        setSubmitting(true); setErrorMsg('');
        try {
            let payload: any = { facilityId, reportingYearId, scope: activeTab.toUpperCase() };
            if (activeTab === 'scope1') {
                payload.fuelRows = fuelRows.map(r => ({
                    fuelType: r.fuelType,
                    unit: r.unit,
                    quantity: parseFloat(r.quantity) || 0,
                }));
            } else if (activeTab === 'scope2') {
                payload.electricityRows = elecRows.map(r => ({
                    electricitySource: r.electricitySource,
                    unit: r.unit,
                    quantity: parseFloat(r.quantity) || 0,
                }));
            } else if (activeTab === 'scope3') {
                payload.scope3Rows = scope3Rows.map(r => ({
                    category: r.activityCategory,    // backend expects "category"
                    subCategory: r.subCategory,
                    unit: r.unit,
                    quantity: parseFloat(r.quantity) || 0,
                }));
            } else {
                // production
                payload.productionData = {
                    totalProduction: parseFloat(productionRow.totalProduction) || 0,
                    unit: productionRow.unit,
                };
            }

            const res = editingSubmissionId
                ? await dataEntryApi.updateSubmission(editingSubmissionId, payload)
                : await dataEntryApi.submit(payload, selectedFiles);
            if (res.data.success) {
                showSuccess(editingSubmissionId
                    ? `Submission updated and resubmitted (${res.data.data ?? 0} record(s)).`
                    : `Data saved successfully! ${res.data.data ?? ''} record(s) submitted.`);
                setSelectedFiles([]); // Clear files after success
                if (editingSubmissionId) {
                    const nextParams = new URLSearchParams(searchParams);
                    nextParams.delete('editSubmissionId');
                    setSearchParams(nextParams, { replace: true });
                }
            }
        } catch (e: any) {
            setErrorMsg(e.response?.data?.message || 'Save failed. Please try again.');
        } finally { setSubmitting(false); }
    };

    const selectedYear = reportingYears.find(y => y.id === reportingYearId);
    const scope1Total = fuelRows.reduce((sum, row) => sum + (row.calculatedEmission ?? 0), 0);
    const scope2Total = elecRows.reduce((sum, row) => sum + (row.calculatedEmission ?? 0), 0);
    const scope3Total = scope3Rows.reduce((sum, row) => sum + (row.calculatedEmission ?? 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 text-slate-900 font-sans">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Data Entry</h1>

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

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50/50">
                    {TAB_CONFIG.map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === t.key
                                ? 'border-[#0F766E] text-slate-900 bg-white'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Context Bar: Facility + Reporting Period ── */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/40">
                    <div className="flex flex-wrap items-end gap-6">

                        {/* Facility selector */}
                        <div className="flex flex-col gap-1.5 min-w-[220px]">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <Building2 className="w-3.5 h-3.5" /> Facility
                            </label>
                            <div className="relative">
                                <select value={facilityId} onChange={e => setFacilityId(e.target.value)}
                                    className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-[#0F766E] focus:border-[#0F766E] block w-full pl-3 pr-9 py-2.5 font-medium shadow-sm">
                                    {facilities.length === 0 && <option value="">No active facilities</option>}
                                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Reporting Period selector */}
                        <div className="flex flex-col gap-1.5 min-w-[220px]">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <Calendar className="w-3.5 h-3.5" /> Reporting Period
                            </label>
                            {loadingYears ? (
                                <div className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-400 bg-white">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Loading periods…
                                </div>
                            ) : (
                                <div className="relative">
                                    <select value={reportingYearId} onChange={e => setReportingYearId(e.target.value)}
                                        className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-[#0F766E] focus:border-[#0F766E] block w-full pl-3 pr-9 py-2.5 font-medium shadow-sm">
                                        {reportingYears.length === 0 && <option value="">No periods available</option>}
                                        {reportingYears.map(y => (
                                            <option key={y.id} value={y.id}>
                                                {y.yearLabel} ({y.startDate} → {y.endDate})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Add Period button */}
                        <button
                            onClick={() => { setShowAddPeriod(true); setPeriodError(''); }}
                            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-[#0F766E] border border-[#0F766E]/30 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                        >
                            <PlusCircle className="w-3.5 h-3.5" /> Add Period
                        </button>

                        {/* Selected period badge */}
                        {selectedYear && (
                            <div className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-700 font-medium">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{selectedYear.yearLabel}</span>
                                {selectedYear.isLocked && (
                                    <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">LOCKED</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-slate-50/30 p-6">

                    {/* ── SCOPE 1 ── */}
                    {activeTab === 'scope1' && (
                        <>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Factory className="w-5 h-5 text-orange-500" /> Scope 1 Data
                            </h2>
                            <div className="grid grid-cols-12 gap-4 mb-2 px-1">
                                <div className="col-span-2 text-sm font-semibold text-slate-700">Activity Type</div>
                                <div className="col-span-2 text-sm font-semibold text-slate-700">Source</div>
                                <div className="col-span-2 text-sm font-semibold text-slate-700">Unit</div>
                                <div className="col-span-2 text-sm font-semibold text-slate-700">Quantity</div>
                                <div className="col-span-2 text-sm font-semibold text-slate-700">Factor</div>
                                <div className="col-span-1 text-sm font-semibold text-slate-700">Emission</div>
                                <div className="col-span-1" />
                            </div>
                            <div className="space-y-3">
                                {fuelRows.map((row, i) => (
                                    <div key={i} className="grid grid-cols-12 gap-4 items-center bg-white p-2 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                        <div className="col-span-2 relative">
                                            <select value={row.activityType} onChange={e => updateFuel(i, 'activityType', e.target.value)} className={sel}>
                                                {[...new Set(scope1Options.map(o => o.activityType))].map(a => <option key={a}>{a}</option>)}
                                            </select>
                                            <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                        </div>
                                        <div className="col-span-2 relative">
                                            <select value={row.fuelType} onChange={e => updateFuel(i, 'fuelType', e.target.value)} className={sel}>
                                                {(sourcesByActivity(scope1Options)[row.activityType] ?? []).map(f => <option key={f}>{f}</option>)}
                                            </select>
                                            <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                        </div>
                                        <div className="col-span-2 relative">
                                            <select value={row.unit} onChange={e => updateFuel(i, 'unit', e.target.value)} className={sel}>
                                                {[...new Set(scope1Options.filter(o => o.activityType === row.activityType && o.source === row.fuelType).map(o => o.unit))].map(u => <option key={u}>{u}</option>)}
                                            </select>
                                            <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" min="0" value={row.quantity} onChange={e => updateFuel(i, 'quantity', e.target.value)}
                                                placeholder="e.g. 145,000" className={inp} />
                                        </div>
                                        <div className="col-span-2 text-sm text-slate-600">{row.loading ? 'Calculating...' : (row.emissionFactor ?? '—')} {row.factorUnit ? <span className="text-xs text-slate-400">({row.factorUnit})</span> : null}</div>
                                        <div className="col-span-1 text-sm font-semibold text-slate-700">{row.loading ? '...' : `${formatEmission(row.calculatedEmission)}`}</div>
                                        <div className="col-span-1">
                                            <button onClick={() => removeFuelRow(i)} disabled={fuelRows.length === 1}
                                                className="p-2 text-slate-400 bg-white border border-slate-200 rounded-md hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-30">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-right text-sm font-bold text-slate-800">Total Scope 1 Emission: {formatEmission(scope1Total)} kg CO2e</div>
                            <div className="mt-4">
                                <button onClick={addFuelRow}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#23705C] text-white rounded-md text-sm font-semibold hover:bg-[#1b5e4c] transition-colors shadow-sm">
                                    <Plus className="w-4 h-4" /> Add Fuel Row
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── SCOPE 2 ── */}
                    {activeTab === 'scope2' && (
                        <>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" /> Scope 2 Data
                            </h2>
                            <div className="grid grid-cols-12 gap-4 mb-2 px-1">
                                <div className="col-span-2 text-sm font-semibold text-slate-700">Activity Type</div>
                                <div className="col-span-2 text-sm font-semibold text-slate-700">Source</div>
                                <div className="col-span-2 text-sm font-semibold text-slate-700">Unit</div>
                                <div className="col-span-2 text-sm font-semibold text-slate-700">Quantity</div>
                                <div className="col-span-2 text-sm font-semibold text-slate-700">Factor</div>
                                <div className="col-span-1 text-sm font-semibold text-slate-700">Emission</div>
                                <div className="col-span-1" />
                            </div>
                            <div className="space-y-3">
                                {elecRows.map((row, i) => (
                                    <div key={i} className="grid grid-cols-12 gap-4 items-center bg-white p-2 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                        <div className="col-span-2 relative">
                                            <select value={row.activityType} onChange={e => updateElec(i, 'activityType', e.target.value)} className={sel}>
                                                {[...new Set(scope2Options.map(o => o.activityType))].map(a => <option key={a}>{a}</option>)}
                                            </select>
                                            <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                        </div>
                                        <div className="col-span-2 relative">
                                            <select value={row.electricitySource} onChange={e => updateElec(i, 'electricitySource', e.target.value)} className={sel}>
                                                {(sourcesByActivity(scope2Options)[row.activityType] ?? []).map(s => <option key={s}>{s}</option>)}
                                            </select>
                                            <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                        </div>
                                        <div className="col-span-2 relative">
                                            <select value={row.unit} onChange={e => updateElec(i, 'unit', e.target.value)} className={sel}>
                                                {[...new Set(scope2Options.filter(o => o.activityType === row.activityType && o.source === row.electricitySource).map(o => o.unit))].map(u => <option key={u}>{u}</option>)}
                                            </select>
                                            <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" min="0" value={row.quantity} onChange={e => updateElec(i, 'quantity', e.target.value)}
                                                placeholder="e.g. 500,000" className={inp} />
                                        </div>
                                        <div className="col-span-2 text-sm text-slate-600">{row.loading ? 'Calculating...' : (row.emissionFactor ?? '—')} {row.factorUnit ? <span className="text-xs text-slate-400">({row.factorUnit})</span> : null}</div>
                                        <div className="col-span-1 text-sm font-semibold text-slate-700">{row.loading ? '...' : `${formatEmission(row.calculatedEmission)}`}</div>
                                        <div className="col-span-1">
                                            <button onClick={() => removeElecRow(i)} disabled={elecRows.length === 1}
                                                className="p-2 text-slate-400 bg-white border border-slate-200 rounded-md hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-30">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-right text-sm font-bold text-slate-800">Total Scope 2 Emission: {formatEmission(scope2Total)} kg CO2e</div>
                            <div className="mt-4">
                                <button onClick={addElecRow}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#23705C] text-white rounded-md text-sm font-semibold hover:bg-[#1b5e4c] transition-colors shadow-sm">
                                    <Plus className="w-4 h-4" /> Add Electricity Row
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── SCOPE 3 ── */}
                    {activeTab === 'scope3' && (
                        <>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-blue-500" /> Scope 3 Data
                            </h2>
                            <div className="grid grid-cols-12 gap-4 mb-2 px-1">
                                <div className="col-span-2 text-sm font-semibold text-slate-700">Activity Category</div>
                                <div className="col-span-3 text-sm font-semibold text-slate-700">Sub-Category</div>
                                <div className="col-span-1 text-sm font-semibold text-slate-700">Unit</div>
                                <div className="col-span-2 text-sm font-semibold text-slate-700">Quantity</div>
                                <div className="col-span-2 text-sm font-semibold text-slate-700">Factor</div>
                                <div className="col-span-1 text-sm font-semibold text-slate-700">Emission</div>
                                <div className="col-span-1" />
                            </div>
                            <div className="space-y-3">
                                {scope3Rows.map((row, i) => (
                                    <div key={i} className="grid grid-cols-12 gap-4 items-center bg-white p-2 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                        <div className="col-span-2 relative">
                                            <select value={row.activityCategory} onChange={e => updateScope3(i, 'activityCategory', e.target.value)} className={sel}>
                                                {[...new Set(scope3Options.map(o => o.activityType))].map(c => <option key={c}>{c}</option>)}
                                            </select>
                                            <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                        </div>
                                        <div className="col-span-3 relative">
                                            <select value={row.subCategory} onChange={e => updateScope3(i, 'subCategory', e.target.value)} className={sel}>
                                                {(sourcesByActivity(scope3Options)[row.activityCategory] ?? []).map(s => <option key={s}>{s}</option>)}
                                            </select>
                                            <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                        </div>
                                        <div className="col-span-1 relative">
                                            <select value={row.unit} onChange={e => updateScope3(i, 'unit', e.target.value)} className={sel}>
                                                {[...new Set(scope3Options.filter(o => o.activityType === row.activityCategory && o.source === row.subCategory).map(o => o.unit))].map(u => <option key={u}>{u}</option>)}
                                            </select>
                                            <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" min="0" value={row.quantity} onChange={e => updateScope3(i, 'quantity', e.target.value)}
                                                placeholder="e.g. 25,000" className={inp} />
                                        </div>
                                        <div className="col-span-2 text-sm text-slate-600">{row.loading ? 'Calculating...' : (row.emissionFactor ?? '—')} {row.factorUnit ? <span className="text-xs text-slate-400">({row.factorUnit})</span> : null}</div>
                                        <div className="col-span-1 text-sm font-semibold text-slate-700">{row.loading ? '...' : formatEmission(row.calculatedEmission)}</div>
                                        <div className="col-span-1">
                                            <button onClick={() => removeScope3Row(i)} disabled={scope3Rows.length === 1}
                                                className="p-2 text-slate-400 bg-white border border-slate-200 rounded-md hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-30">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-right text-sm font-bold text-slate-800">Total Scope 3 Emission: {formatEmission(scope3Total)} kg CO2e</div>
                            <div className="mt-4">
                                <button onClick={addScope3Row}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#23705C] text-white rounded-md text-sm font-semibold hover:bg-[#1b5e4c] transition-colors shadow-sm">
                                    <Plus className="w-4 h-4" /> Add Scope 3 Row
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── PRODUCTION DATA ── */}
                    {activeTab === 'production' && (
                        <>
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Production Data</h2>
                            <div className="grid grid-cols-12 gap-4 mb-2 px-1">
                                <div className="col-span-5 text-sm font-semibold text-slate-700">Total Production</div>
                                <div className="col-span-5 text-sm font-semibold text-slate-700">Unit</div>
                                <div className="col-span-2" />
                            </div>
                            <div className="grid grid-cols-12 gap-4 items-center bg-white p-2 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                <div className="col-span-5">
                                    <input type="number" min="0" value={productionRow.totalProduction}
                                        onChange={e => setProductionRow(p => ({ ...p, totalProduction: e.target.value }))}
                                        placeholder="e.g. 350,000" className={inp} />
                                </div>
                                <div className="col-span-5 relative">
                                    <select value={productionRow.unit} onChange={e => setProductionRow(p => ({ ...p, unit: e.target.value }))} className={sel}>
                                        {UNITS_PRODUCTION.map(u => <option key={u}>{u}</option>)}
                                    </select>
                                    <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                                </div>
                                <div className="col-span-2" />
                            </div>
                            <p className="mt-4 text-xs text-slate-400">
                                Production data is used to calculate emissions intensity (tCO₂e per unit of production).
                            </p>
                        </>
                    )}
                    {/* ── Supporting Documents Section ── */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-teal-600" /> Supporting Documents
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">
                            Upload proof files (Invoices, Logs, Reports). Allowed types: JPG, PNG, PDF, XLS, CSV, DOC.
                        </p>

                        <div className="flex flex-wrap gap-3 mb-4">
                            {selectedFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600">
                                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} className="ml-1 p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-500 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            <label className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:border-teal-500/50 hover:bg-teal-50/30 transition-all cursor-pointer group">
                                <Upload className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                                <span>Upload Files</span>
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Save Footer */}
                <div className="p-6 border-t border-slate-200 bg-white flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                        {selectedYear
                            ? <>Submitting for <span className="font-semibold text-slate-600">{selectedYear.yearLabel}</span></>
                            : 'Select a reporting period above before saving'}
                    </div>
                    <button onClick={handleSave} disabled={submitting || !reportingYearId || !facilityId}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#23705C] text-white rounded-md text-sm font-bold hover:bg-[#1b5e4c] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {submitting || loadingEditSubmission
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                            : <>{editingSubmissionId ? 'Update & Resubmit' : 'Save Data'}</>}
                    </button>
                </div>
            </div>

            {/* ── Add Reporting Period Modal ── */}
            {showAddPeriod && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-teal-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">Add Reporting Period</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">e.g. FY 2025-26 (Apr 2025 – Mar 2026)</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddPeriod(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleAddPeriod} className="px-7 py-6 space-y-4">
                            {periodError && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                                    <X className="w-4 h-4 flex-shrink-0" />{periodError}
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Period Label <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. FY 2025-26"
                                    value={periodForm.yearLabel}
                                    onChange={e => setPeriodForm(p => ({ ...p, yearLabel: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-300 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Start Date <span className="text-rose-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        value={periodForm.startDate}
                                        onChange={e => setPeriodForm(p => ({ ...p, startDate: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">End Date <span className="text-rose-500">*</span></label>
                                    <input
                                        type="date"
                                        required
                                        value={periodForm.endDate}
                                        onChange={e => setPeriodForm(p => ({ ...p, endDate: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                                <button type="button" onClick={() => setShowAddPeriod(false)}
                                    className="flex-1 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={savingPeriod}
                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-60">
                                    {savingPeriod ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Calendar className="w-4 h-4" /> Save Period</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataEntryTabContent;
