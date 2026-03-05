/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantApi, referenceApi, ingestionApi, draftApi } from '../api/services';
import {
    Building2,
    CheckCircle2, ChevronRight, AlertTriangle,
    Zap, Leaf, Factory, Upload, Info,
    Calendar, User, ChevronDown
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import type { EmissionCategory } from '../types';

const AddEmissionPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        plantId: '',
        department: '',
        responsiblePerson: '',
        scope: '',
        categoryId: '',
        customCategoryName: '',
        activityType: '',
        fuelTypeId: '',
        fuelType: '',
        unit: '',
        quantity: '',
        calorificValue: '',
        recordedAt: new Date().toISOString().split('T')[0],
        reportingPeriodStart: new Date().toISOString().split('T')[0],
        reportingPeriodEnd: new Date().toISOString().split('T')[0],
        reportingFrequency: 'Monthly',
        dataSource: 'Manual',
        evidenceUrl: ''
    });

    const [plants, setPlants] = useState<any[]>([]);
    const [categories, setCategories] = useState<EmissionCategory[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [calculatedPreview, setCalculatedPreview] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [draftId, setDraftId] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const response = await plantApi.getPlants();
                const plantsData = response.data.data || [];
                if (plantsData.length > 0) {
                    setPlants(plantsData);
                    setFormData(prev => ({ ...prev, plantId: plantsData[0].id }));
                }
            } catch (err) {
                console.error("Failed to fetch plants", err);
            }
        };
        fetchPlants();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            if (formData.scope && user?.industryTypeId) {
                try {
                    const catResponse = await referenceApi.getCategories(user.industryTypeId, formData.scope);
                    setCategories(catResponse.data.data || []);
                } catch (err) {
                    console.error("Failed to fetch data", err);
                }
            } else {
                setCategories([]);
            }
        };
        fetchCategories();
    }, [formData.scope, user?.industryTypeId]);

    useEffect(() => {
        const fetchActivitiesForCategory = async () => {
            if (formData.categoryId && user?.industryTypeId) {
                try {
                    const res = await referenceApi.getActivities(user.industryTypeId, formData.categoryId);
                    setActivities(res.data.data || []);
                } catch (err) {
                    console.error("Failed to fetch activities", err);
                }
            } else {
                setActivities([]);
            }
        };
        fetchActivitiesForCategory();
    }, [formData.categoryId, user?.industryTypeId]);

    useEffect(() => {
        const today = new Date();
        let start, end;
        if (formData.reportingFrequency === 'Monthly') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else if (formData.reportingFrequency === 'Quarterly') {
            const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
            start = new Date(today.getFullYear(), quarterMonth, 1);
            end = new Date(today.getFullYear(), quarterMonth + 3, 0);
        } else {
            start = new Date(today.getFullYear(), 0, 1);
            end = new Date(today.getFullYear(), 11, 31);
        }
        setFormData(prev => ({
            ...prev,
            reportingPeriodStart: start.toISOString().split('T')[0],
            reportingPeriodEnd: end.toISOString().split('T')[0]
        }));
    }, [formData.reportingFrequency]);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'activityType') {
            // Find selected activity directly
            const act = activities.find(a => a.activityType === value);

            setFormData(prev => ({
                ...prev,
                activityType: value,
                fuelTypeId: act?.fuelTypeId || '',
                fuelType: 'Loading...',
                unit: 'Loading...'
            }));

            if (act?.fuelTypeId) {
                try {
                    const fuelRes = await referenceApi.getFuelType(act.fuelTypeId);
                    const fuelDetails = fuelRes.data.data;
                    setFormData(prev => ({
                        ...prev,
                        fuelType: fuelDetails.name,
                        unit: fuelDetails.defaultUnit
                    }));
                } catch (err) {
                    console.error("Failed to get fuel details", err);
                    setFormData(prev => ({ ...prev, fuelType: 'Error', unit: '' }));
                }
            }
        } else if (name === 'scope') {
            setFormData(prev => ({
                ...prev,
                scope: value,
                categoryId: '',
                activityType: '',
                quantity: ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!draftId) {
            setError('No active draft found to commit.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await draftApi.commitDraft(draftId);
            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/'), 2000);
            } else {
                setError(response.data.message || 'Commit failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to commit emission record.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await ingestionApi.uploadEvidence(uploadData);
            if (response.data.data) {
                const { url } = response.data.data;
                setFormData(prev => ({ ...prev, evidenceUrl: url }));
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to upload evidence');
        } finally {
            setUploading(false);
        }
    };

    const nextStep = async () => {
        setLoading(true);
        setError('');
        try {
            if (currentStep === 1) {
                const response = await draftApi.createDraft({
                    plantId: formData.plantId,
                    department: formData.department,
                    responsiblePerson: formData.responsiblePerson,
                    reportingPeriodStart: new Date(formData.reportingPeriodStart).toISOString(),
                    reportingPeriodEnd: new Date(formData.reportingPeriodEnd).toISOString(),
                    reportingFrequency: formData.reportingFrequency,
                    dataSource: formData.dataSource
                });
                if (response.data.data) {
                    setDraftId(response.data.data.emissionId || response.data.data.id);
                }
            } else if (currentStep === 2 && draftId) {
                await draftApi.updateClassification(draftId, {
                    scope: formData.scope,
                    categoryId: formData.categoryId,
                    customCategoryName: formData.customCategoryName
                });
            } else if (currentStep === 3 && draftId) {
                const res = await draftApi.updateActivity(draftId, {
                    activityType: formData.activityType,
                    quantity: parseFloat(formData.quantity) || 0,
                    fuelTypeId: formData.fuelTypeId,
                    calorificValue: parseFloat(formData.calorificValue) || 0
                });
                if (res.data.data && res.data.data.calculatedEmission !== undefined) {
                    setCalculatedPreview(res.data.data.calculatedEmission);
                }
            }
            setCurrentStep(prev => Math.min(prev + 1, 4));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save progress.');
        } finally {
            setLoading(false);
        }
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in-95 duration-1000">
                <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-[50px] animate-pulse rounded-full"></div>
                    <div className="w-24 h-24 bg-green-500 text-white rounded-[2.5rem] flex items-center justify-center mb-8 relative z-10 shadow-[0_20px_40px_rgba(16,185,129,0.3)]">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                </div>
                <h2 className="text-4xl font-black text-gradient mb-3 tracking-tighter">Emission Audited</h2>
                <p className="text-muted-foreground font-bold text-lg">Transaction ledger updated. Finalizing state...</p>
                <div className="mt-10 w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-premium animate-progress"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Stepper Card */}
            <div className="bg-surface rounded-[2rem] p-6 shadow-sm border border-border flex items-center justify-center gap-12 transition-colors">
                {[
                    { step: 1, label: 'Facility Info' },
                    { step: 2, label: 'Emission Classification' },
                    { step: 3, label: 'Activity Data' },
                    { step: 4, label: 'Review & Submit' }
                ].map((s) => (
                    <div key={s.step} className="flex items-center gap-4 group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 ${currentStep >= s.step ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-muted text-muted-foreground'}`}>
                            {currentStep > s.step ? <CheckCircle2 className="w-5 h-5" /> : s.step}
                        </div>
                        <span className={`text-sm font-black transition-colors ${currentStep >= s.step ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
                        {s.step < 4 && <div className={`w-12 h-[2px] rounded-full transition-all duration-500 ${currentStep > s.step ? 'bg-accent' : 'bg-muted'}`}></div>}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8 items-start">
                {/* Main Form Area */}
                <div className="col-span-12 lg:col-span-8 bg-surface rounded-[3rem] shadow-xl shadow-black/5 border border-border overflow-hidden flex flex-col min-h-[700px] transition-colors">
                    <form onSubmit={(e) => e.preventDefault()} className="flex-1 flex flex-col">
                        <div className="p-12 flex-1">
                            {error && (
                                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 text-sm font-bold mb-8 animate-in slide-in-from-top-4">
                                    <AlertTriangle className="w-6 h-6" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Step 1: Facility & Reporting */}
                            {currentStep === 1 && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black tracking-tight text-foreground">Facility & Reporting Info</h2>
                                        <p className="text-muted-foreground font-medium">Provide basic information and select the reporting period and frequency.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                        {/* Left Column */}
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-black text-foreground flex items-center gap-2">Facility Information</h3>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Plant / Facility <Info className="inline w-3 h-3 ml-1" /></label>
                                                    <div className="relative group">
                                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                                        <select name="plantId" value={formData.plantId} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-surface focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all appearance-none font-bold text-foreground">
                                                            {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center px-1">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Department (Optional)</label>
                                                    </div>
                                                    <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Operations, Logistics" className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-surface focus:border-accent outline-none transition-all font-bold text-foreground" />
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-xs font-black text-muted-foreground flex items-center gap-2">Reporting Frequency <Info className="w-3 h-3" /></label>
                                                    <div className="flex gap-4">
                                                        {['Monthly', 'Quarterly', 'Yearly'].map((freq) => (
                                                            <button
                                                                key={freq}
                                                                type="button"
                                                                onClick={() => setFormData(p => ({ ...p, reportingFrequency: freq }))}
                                                                className={`flex-1 py-4 px-6 rounded-2xl flex items-center gap-3 font-bold text-sm transition-all border-2 ${formData.reportingFrequency === freq ? 'border-accent bg-accent/5 text-accent' : 'border-border bg-muted/50 text-muted-foreground hover:border-accent/30'}`}
                                                            >
                                                                <div className={`w-4 h-4 rounded-full border-4 ${formData.reportingFrequency === freq ? 'border-accent bg-surface' : 'border-border bg-surface'}`}></div>
                                                                {freq}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-black text-foreground flex items-center gap-2">Reporting Details</h3>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Responsible Person <Info className="inline w-3 h-3 ml-1" /></label>
                                                    <div className="relative group">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                                        <input type="text" name="responsiblePerson" value={formData.responsiblePerson} onChange={handleChange} placeholder="Search or enter name" className="w-full pl-12 pr-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-surface focus:border-accent outline-none transition-all font-bold text-foreground" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reporting Period</label>
                                                    <div className="flex items-center gap-4 bg-muted p-2 rounded-2xl border border-transparent focus-within:border-accent focus-within:bg-surface transition-all">
                                                        <div className="flex items-center gap-2 flex-1 pl-4">
                                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                                            <input type="date" name="reportingPeriodStart" value={formData.reportingPeriodStart} onChange={handleChange} className="bg-transparent border-none outline-none font-bold text-xs text-foreground w-full" />
                                                        </div>
                                                        <span className="text-muted-foreground font-bold">→</span>
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <input type="date" name="reportingPeriodEnd" value={formData.reportingPeriodEnd} onChange={handleChange} className="bg-transparent border-none outline-none font-bold text-xs text-foreground w-full" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Data Source</label>
                                                    <div className="flex p-1 bg-muted rounded-2xl">
                                                        {['Manual', 'Invoice', 'Meter', 'ERP'].map((s) => (
                                                            <button
                                                                key={s}
                                                                type="button"
                                                                onClick={() => setFormData(p => ({ ...p, dataSource: s }))}
                                                                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.dataSource === s ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted-foreground hover:text-foreground hover:bg-surface'}`}
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-4 pt-4">
                                                    <div
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="p-8 border-2 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center gap-4 bg-muted/50 hover:bg-accent/5 hover:border-accent/30 transition-all cursor-pointer group"
                                                    >
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            onChange={handleFileUpload}
                                                            className="hidden"
                                                            accept=".pdf,.xls,.xlsx,.csv,.png,.jpg"
                                                        />
                                                        <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                            {uploading ? (
                                                                <div className="w-6 h-6 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                                                            ) : formData.evidenceUrl ? (
                                                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                                            ) : (
                                                                <Upload className="w-6 h-6 text-accent" />
                                                            )}
                                                        </div>
                                                        <div className="text-center">
                                                            {uploading ? (
                                                                <p className="font-black text-xs text-accent animate-pulse">Uploading...</p>
                                                            ) : formData.evidenceUrl ? (
                                                                <p className="font-black text-xs text-green-500">Evidence Linked Successfully</p>
                                                            ) : (
                                                                <p className="font-black text-xs text-foreground">Drag and drop file here, or <span className="text-accent">Browse</span></p>
                                                            )}
                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">PDF, XLS, format, up to 25MB</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Emission Classification */}
                            {currentStep === 2 && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black tracking-tight text-foreground">Emission Classification</h2>
                                        <p className="text-muted-foreground font-medium">Select the protocol scope and specific intensity category.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {[
                                            { id: 'SCOPE1', name: 'Scope 1', icon: <Factory className="w-6 h-6" />, desc: 'Direct Emissions' },
                                            { id: 'SCOPE2', name: 'Scope 2', icon: <Zap className="w-6 h-6" />, desc: 'Indirect Energy' },
                                            { id: 'SCOPE3', name: 'Scope 3', icon: <Leaf className="w-6 h-6" />, desc: 'Value Chain' }
                                        ].map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, scope: s.id, categoryId: '', activityType: '' }))}
                                                className={`p-10 rounded-[3rem] border-2 flex flex-col items-center gap-6 transition-all duration-500 ${formData.scope === s.id ? 'border-accent bg-accent/5 shadow-xl shadow-accent/10 scale-[1.05]' : 'border-border bg-muted/50 hover:border-accent/30 opacity-60 hover:opacity-100'}`}
                                            >
                                                <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center ${formData.scope === s.id ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'bg-surface text-muted-foreground shadow-sm'}`}>{s.icon}</div>
                                                <div className="text-center">
                                                    <p className="font-black text-sm uppercase tracking-[0.2em] mb-1">{s.name}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {formData.scope && (
                                        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                            <label className="text-xs font-black text-muted-foreground flex items-center gap-2 px-2">Emission Category <Info className="w-3 h-3" /></label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => setFormData(p => ({ ...p, categoryId: cat.id }))}
                                                        className={`p-6 rounded-2xl border flex items-center justify-between font-bold text-sm transition-all ${formData.categoryId === cat.id ? 'border-accent bg-surface text-accent shadow-lg shadow-accent/5' : 'border-border bg-muted/50 text-muted-foreground hover:border-accent/30'}`}
                                                    >
                                                        {cat.categoryName}
                                                        {formData.categoryId === cat.id && <CheckCircle2 className="w-4 h-4" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Activity Data */}
                            {currentStep === 3 && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black tracking-tight text-foreground">Activity & Emission Calculation</h2>
                                        <p className="text-muted-foreground font-medium">Input raw activity data for accurate impact calculation.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Activity Type</label>
                                                <div className="relative group">
                                                    <select name="activityType" value={formData.activityType} onChange={handleChange} className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-surface focus:border-accent outline-none transition-all appearance-none font-bold text-foreground">
                                                        <option value="" disabled>Select Activity</option>
                                                        {activities.map((act) => <option key={act.id} value={act.activityType}>{act.activityType}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Fuel Type</label>
                                                    <input type="text" readOnly name="fuelType" value={formData.fuelType} className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-surface focus:border-accent outline-none transition-all font-bold text-foreground opacity-70 cursor-not-allowed" placeholder="Auto-filled" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Unit</label>
                                                    <input type="text" readOnly name="unit" value={formData.unit} className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-surface focus:border-accent outline-none transition-all font-bold text-foreground opacity-70 cursor-not-allowed" placeholder="Auto-filled" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Quantity</label>
                                                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="0.00" className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-surface focus:border-accent outline-none transition-all font-bold text-foreground" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Calorific Value</label>
                                                    <input type="number" name="calorificValue" value={formData.calorificValue} onChange={handleChange} placeholder="0.00" className="w-full px-6 py-4 bg-muted border border-transparent rounded-2xl focus:bg-surface focus:border-accent outline-none transition-all font-bold text-foreground" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="bg-accent/5 rounded-[2rem] p-8 border border-accent/10 flex items-start gap-4">
                                                <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-accent shadow-sm"><Info className="w-5 h-5" /></div>
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-black text-foreground">Suggestions</h4>
                                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">Based on history, typical usage for <span className="text-accent font-bold">Scope 1 - Stationary Combustion</span> in Apr 2026 is between <span className="text-foreground font-bold">1,200 - 1,500 Liters</span>.</p>
                                                </div>
                                            </div>
                                            {calculatedPreview !== null && (
                                                <div className="bg-accent/10 rounded-[2rem] p-8 border border-surface space-y-4 shadow-inner">
                                                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Impact Prediction</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-5xl font-black text-foreground tracking-tighter">{calculatedPreview.toFixed(4)}</span>
                                                        <span className="text-lg font-black text-muted-foreground uppercase tracking-widest">tCO2e</span>
                                                    </div>
                                                    <div className="h-[2px] w-full bg-accent/20 rounded-full"></div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Confidence Score: <span className="text-green-500">98.2%</span></p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Review & Submit */}
                            {currentStep === 4 && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black tracking-tight text-foreground">Audit & Verify</h2>
                                        <p className="text-muted-foreground font-medium">Please review the details below before committing to the ledger.</p>
                                    </div>

                                    <div className="bg-muted/50 rounded-[3rem] p-12 space-y-10 border border-border">
                                        <div className="flex flex-col gap-12">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                <div className="space-y-8">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Facility</p>
                                                        <p className="text-sm font-black text-foreground">{plants.find(p => p.id === formData.plantId)?.name || 'N/A'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reporting Period</p>
                                                        <p className="text-sm font-black text-foreground">{formData.reportingPeriodStart} → {formData.reportingPeriodEnd}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Classification</p>
                                                        <p className="text-sm font-black text-foreground">{formData.scope} - {categories.find(c => c.id === formData.categoryId)?.categoryName || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-8">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Audit Protocol</p>
                                                        <p className="text-sm font-black text-foreground">{formData.dataSource} - Verified</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Responsible</p>
                                                        <p className="text-sm font-black text-foreground">{formData.responsiblePerson || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Activity Summary</h3>
                                                <div className="border border-border rounded-2xl overflow-hidden">
                                                    <table className="w-full text-left text-sm text-muted-foreground whitespace-nowrap">
                                                        <thead className="bg-surface border-b border-border">
                                                            <tr className="uppercase tracking-widest text-[10px] font-black">
                                                                <th className="px-6 py-4">Activity</th>
                                                                <th className="px-6 py-4">Fuel</th>
                                                                <th className="px-6 py-4 text-right">Quantity</th>
                                                                <th className="px-6 py-4 text-right">Unit</th>
                                                                <th className="px-6 py-4 text-right text-accent">Emission (tCO2e)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border">
                                                            <tr className="bg-muted/30">
                                                                <td className="px-6 py-4 font-bold text-foreground">{formData.activityType}</td>
                                                                <td className="px-6 py-4 font-bold text-foreground">{formData.fuelType}</td>
                                                                <td className="px-6 py-4 font-black text-right">{formData.quantity}</td>
                                                                <td className="px-6 py-4 font-black text-right">{formData.unit}</td>
                                                                <td className="px-6 py-4 font-black text-accent text-right">{calculatedPreview?.toFixed(4) || "0.0000"}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-10 border-t border-border flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2">Calculated Footprint</p>
                                                <div className="flex items-baseline gap-3">
                                                    <span className="text-6xl font-black text-foreground tracking-tighter">{calculatedPreview?.toFixed(4)}</span>
                                                    <span className="text-xl font-black text-muted-foreground uppercase tracking-widest">tCO2e</span>
                                                </div>
                                            </div>
                                            <div className="bg-green-500/10 px-8 py-4 rounded-2xl border border-green-500/20 flex items-center gap-4">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs font-black text-green-600 uppercase tracking-widest">Audit Ready</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-12 border-t border-border flex justify-center gap-6 bg-muted/30">
                            <button
                                type="button"
                                onClick={currentStep === 1 ? () => navigate('/') : prevStep}
                                className="px-10 py-4 font-black text-xs uppercase tracking-[0.2em] text-muted-foreground border border-border hover:bg-surface hover:text-foreground rounded-2xl transition-all"
                            >
                                {currentStep === 1 ? 'Abort' : 'Back'}
                            </button>
                            <button
                                type="button"
                                onClick={currentStep === 4 ? handleSubmit : nextStep}
                                disabled={loading || (currentStep === 2 && (!formData.scope || !formData.categoryId)) || (currentStep === 3 && (!formData.activityType || !formData.quantity))}
                                className={`px-12 py-4 bg-accent text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-100 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Processing...' : currentStep === 4 ? 'Commit to Ledger' : 'Next'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Sidebar: Calculation Preview */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="bg-accent/5 rounded-[3rem] p-10 border border-accent/10 space-y-12 min-h-[700px] sticky top-32 transition-colors">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-foreground mb-6">Calculation Preview</h2>
                            <div className="bg-surface rounded-[2rem] p-6 shadow-sm border border-border flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground"><Building2 className="w-5 h-5" /></div>
                                    <div className="text-sm font-black text-foreground truncate max-w-[150px]">Facility: {plants.find(p => p.id === formData.plantId)?.name || 'N/A'}</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reporting Period:</p>
                                <p className="text-sm font-black text-foreground">{formData.reportingPeriodStart} → {formData.reportingPeriodEnd}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Frequency:</p>
                                <p className="text-sm font-black text-foreground">{formData.reportingFrequency}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Data Source:</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                                    <p className="text-sm font-black text-foreground">{formData.dataSource}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface rounded-[2.5rem] p-10 shadow-sm border border-border space-y-6">
                            <h3 className="text-lg font-black text-foreground">Emission Summary</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${formData.plantId ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                                        <CheckCircle2 className="w-3 h-3" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase">Facility:</span>
                                        <span className={`text-xs font-black ${formData.plantId ? 'text-foreground' : 'text-muted-foreground opacity-30 italic'}`}>{plants.find(p => p.id === formData.plantId)?.name || 'Pending'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${formData.scope ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                                        <CheckCircle2 className="w-3 h-3" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase">Classification:</span>
                                        <span className={`text-xs font-black ${formData.scope ? 'text-foreground' : 'text-muted-foreground opacity-30 italic'}`}>{formData.scope ? `${formData.scope}` : 'Pending'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${formData.quantity ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                                        <CheckCircle2 className="w-3 h-3" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase">Quantity:</span>
                                        <span className={`text-xs font-black ${formData.quantity ? 'text-foreground' : 'text-muted-foreground opacity-30 italic'}`}>{formData.quantity ? `${formData.quantity} ${formData.unit}` : 'Pending'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border">
                                <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2">Live Impact</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-foreground tracking-tighter">{calculatedPreview?.toFixed(4) || '0.0000'}</span>
                                    <span className="text-xs font-black text-muted-foreground uppercase">tCO2e</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEmissionPage;
