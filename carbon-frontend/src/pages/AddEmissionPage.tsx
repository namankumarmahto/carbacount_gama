import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { emissionApi, plantApi, referenceApi } from '../api/services';
import {
    Building2, CloudRain, Save, ArrowLeft,
    Calendar, CheckCircle2, ChevronRight, AlertTriangle, ListFilter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { EmissionCategory } from '../types';

const AddEmissionPage: React.FC = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        plantId: '99999999-9999-9999-9999-999999999999',
        scope: '',
        categoryId: '',
        customCategoryName: '',
        isCustomCategory: false,
        totalEmission: '',
        recordedAt: new Date().toISOString().split('T')[0]
    });

    const [plants, setPlants] = useState<any[]>([]);
    const [categories, setCategories] = useState<EmissionCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const response = await plantApi.getPlants();
                if (response.data.success && response.data.data.length > 0) {
                    setPlants(response.data.data);
                    setFormData(prev => ({ ...prev, plantId: response.data.data[0].id }));
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
                    const response = await referenceApi.getCategories(user.industryTypeId, formData.scope);
                    const cats = Array.isArray(response.data) ? response.data : (response.data.data || []);
                    setCategories(cats);
                    setFormData(prev => ({
                        ...prev,
                        categoryId: '',
                        customCategoryName: '',
                        isCustomCategory: false
                    }));
                } catch (err) {
                    console.error("Failed to fetch categories", err);
                }
            } else {
                setCategories([]);
            }
        };
        fetchCategories();
    }, [formData.scope, user?.industryTypeId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                plantId: formData.plantId,
                scope: formData.scope,
                categoryId: formData.isCustomCategory ? null : formData.categoryId,
                customCategoryName: formData.isCustomCategory ? formData.customCategoryName : null,
                totalEmission: parseFloat(formData.totalEmission),
                recordedAt: new Date(formData.recordedAt).toISOString()
            };

            const response = await emissionApi.addEmission(payload);
            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/'), 2000);
            } else {
                setError(response.data.message);
            }
        } catch (err: any) {
            if (err.response?.data?.data) {
                const validationErrors = Object.entries(err.response.data.data)
                    .map(([field, msg]) => `${field}: ${msg}`)
                    .join(', ');
                setError(`Validation Failed: ${validationErrors}`);
            } else {
                setError(err.response?.data?.message || 'Failed to submit emission record.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'categoryId') {
            if (value === 'CUSTOM') {
                setFormData({ ...formData, categoryId: '', isCustomCategory: true, customCategoryName: '' });
            } else {
                setFormData({ ...formData, categoryId: value, isCustomCategory: false, customCategoryName: '' });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Record Submitted</h2>
                <p className="text-slate-400">Inventory updated successfully. Redirecting...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-left-4 duration-500">
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Analytics
            </button>

            <div className="bg-slate-800/20 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-700/50 bg-slate-800/40">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-green-500/20 rounded-2xl">
                            <CloudRain className="w-6 h-6 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-white">Manual Data Ingestion</h1>
                    </div>
                    <p className="text-slate-400">Report emission activities for compliance and audit logging</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-green-500" />
                                Entity Details
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Plant / Facility</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                                    <select
                                        name="plantId"
                                        value={formData.plantId}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/50 outline-none transition-all appearance-none"
                                        required
                                    >
                                        <option value="" disabled>Select a plant</option>
                                        {plants.map(plant => (
                                            <option key={plant.id} value={plant.id}>
                                                {plant.name} {plant.location ? `(${plant.location})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Reporting Period</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                                    <input
                                        type="date"
                                        name="recordedAt"
                                        value={formData.recordedAt}
                                        onChange={handleChange}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/50 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-green-500" />
                                Emission Classification
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Scope</label>
                                    <div className="relative">
                                        <ListFilter className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                                        <select
                                            name="scope"
                                            value={formData.scope}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/50 outline-none transition-all appearance-none"
                                            required
                                        >
                                            <option value="" disabled>Select Scope</option>
                                            <option value="SCOPE1">Scope 1 (Direct)</option>
                                            <option value="SCOPE2">Scope 2 (Energy Indirect)</option>
                                            <option value="SCOPE3">Scope 3 (Other Indirect)</option>
                                        </select>
                                    </div>
                                </div>

                                {formData.scope && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                                        <select
                                            name="categoryId"
                                            value={formData.isCustomCategory ? 'CUSTOM' : formData.categoryId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500/50 outline-none transition-all appearance-none"
                                            required
                                        >
                                            <option value="" disabled>Select an activity category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                                            ))}
                                            <option value="CUSTOM">+ Add Custom Category</option>
                                        </select>
                                    </div>
                                )}

                                {formData.isCustomCategory && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Custom Category Name</label>
                                        <input
                                            type="text"
                                            name="customCategoryName"
                                            value={formData.customCategoryName}
                                            onChange={handleChange}
                                            placeholder="e.g. Employee Commuting"
                                            className="w-full px-4 py-3 bg-slate-800 border border-blue-500/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white placeholder-slate-500"
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2 mt-2">Emission Value (tCO2e)</label>
                                    <input
                                        type="number" step="0.01" name="totalEmission" placeholder="0.00"
                                        value={formData.totalEmission} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl focus:border-green-500 outline-none text-white text-lg font-mono shadow-inner"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-700/50 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                        >
                            Discard Changes
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-green-900/20 disabled:grayscale transition-all"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Finalize Record
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmissionPage;
