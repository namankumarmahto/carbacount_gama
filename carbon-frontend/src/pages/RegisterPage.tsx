/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, referenceApi } from '../api/services';
import {
    User,
    Building2,
    ShieldCheck,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import type { IndustryType } from '../types';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        industryName: '',
        industryTypeId: '',
        countryId: '',
        stateId: ''
    });

    const [checkboxes, setCheckboxes] = useState({
        authorized: false,
        agreed: false
    });

    const [industryTypes, setIndustryTypes] = useState<IndustryType[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Validation errors state
    const [valErrors, setValErrors] = useState<Record<string, string>>({});

    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const indRes = await referenceApi.getIndustryTypes();
                const types = Array.isArray(indRes.data) ? indRes.data : (indRes.data.data || []);
                setIndustryTypes(types);

                const countryRes = await referenceApi.getCountries();
                const cList = Array.isArray(countryRes.data) ? countryRes.data : (countryRes.data.data || []);
                setCountries(cList);
            } catch (err) {
                console.error("Failed to load reference data", err);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchStates = async () => {
            if (!formData.countryId) {
                setStates([]);
                setFormData(prev => ({ ...prev, stateId: '' }));
                return;
            }
            try {
                const res = await referenceApi.getStates(formData.countryId);
                const sList = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setStates(sList);
                setFormData(prev => ({ ...prev, stateId: '' }));
            } catch (err) {
                console.error("Failed to load states", err);
            }
        };
        fetchStates();
    }, [formData.countryId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear specific validation error when user types
        if (valErrors[e.target.name]) {
            setValErrors({ ...valErrors, [e.target.name]: '' });
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCheckboxes({ ...checkboxes, [e.target.name]: e.target.checked });
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) errors.name = "Full name is required";

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Please enter a valid work email";
        }

        if (!formData.password) {
            errors.password = "Password is required";
        } else {
            const hasUppercase = /[A-Z]/.test(formData.password);
            const hasNumber = /[0-9]/.test(formData.password);
            if (formData.password.length < 8) errors.password = "Password must be at least 8 characters";
            else if (!hasUppercase) errors.password = "Password must contain at least one uppercase letter";
            else if (!hasNumber) errors.password = "Password must contain at least one number";
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        if (!formData.industryName.trim()) errors.industryName = "Company name is required";
        if (!formData.industryTypeId) errors.industryTypeId = "Please select an industry type";
        if (!formData.countryId) errors.countryId = "Please select a country";

        setValErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const isSubmitDisabled =
        !formData.name || !formData.email || !formData.password || !formData.confirmPassword ||
        !formData.industryName || !formData.industryTypeId || !formData.countryId ||
        !checkboxes.authorized || !checkboxes.agreed;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            // Exclude confirmPassword from the actual payload
            const payload = { ...formData };
            delete (payload as any).confirmPassword;
            if (!payload.stateId) {
                delete (payload as any).stateId;
            }

            const response = await authApi.register(payload);
            if (response.data.success) {
                // Redirect straight to dashboard/onboarding as per requirement
                navigate('/dashboard'); // or wherever the appropriate post-registration page is
            } else {
                setError(response.data.message);
            }
        } catch (err: any) {
            if (err.response?.status === 409 || err.response?.data?.message?.toLowerCase().includes('email')) {
                setValErrors(prev => ({ ...prev, email: 'Email address is already in use' }));
            }
            else if (err.response?.data?.data) {
                const validationErrors = err.response.data.data;
                const newErrors: Record<string, string> = {};
                Object.entries(validationErrors).forEach(([field, msg]) => {
                    newErrors[field] = msg as string;
                });
                setValErrors(newErrors);
            } else {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-16 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">

                {/* Header Banner */}
                <div className="bg-slate-900 px-8 py-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-emerald-500 blur-3xl"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-teal-500 blur-3xl"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-3xl font-extrabold tracking-tight text-white">CarbaCount</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Register Your Organization</h2>
                        <p className="text-slate-400 text-sm max-w-md mx-auto">
                            Set up your enterprise account to start tracking, managing, and reporting your ESG compliance.
                        </p>
                    </div>
                </div>

                <div className="p-8 sm:p-12">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* Section 1: Account Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <User className="w-4 h-4 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">1. Administrator Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-5 py-3.5 bg-slate-50 border ${valErrors.name ? 'border-red-400 focus:ring-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 focus:bg-white'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm`}
                                        placeholder="e.g. John Doe"
                                    />
                                    {valErrors.name && <p className="mt-2 text-xs font-medium text-red-600">{valErrors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Official Work Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-5 py-3.5 bg-slate-50 border ${valErrors.email ? 'border-red-400 focus:ring-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 focus:bg-white'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm`}
                                        placeholder="john.doe@company.com"
                                    />
                                    {valErrors.email && <p className="mt-2 text-xs font-medium text-red-600">{valErrors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full px-5 py-3.5 bg-slate-50 border ${valErrors.password ? 'border-red-400 focus:ring-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 focus:bg-white'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm`}
                                        placeholder="••••••••"
                                    />
                                    {valErrors.password && <p className="mt-2 text-xs font-medium text-red-600">{valErrors.password}</p>}
                                    {!valErrors.password && <p className="mt-2 text-xs text-slate-500">Min 8 chars, 1 uppercase, 1 number.</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full px-5 py-3.5 bg-slate-50 border ${valErrors.confirmPassword ? 'border-red-400 focus:ring-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 focus:bg-white'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm`}
                                        placeholder="••••••••"
                                    />
                                    {valErrors.confirmPassword && <p className="mt-2 text-xs font-medium text-red-600">{valErrors.confirmPassword}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Organization Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">2. Organization Information</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Legal Company Name</label>
                                <input
                                    type="text"
                                    name="industryName"
                                    value={formData.industryName}
                                    onChange={handleChange}
                                    className={`w-full px-5 py-3.5 bg-slate-50 border ${valErrors.industryName ? 'border-red-400 focus:ring-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 focus:bg-white'} rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm`}
                                    placeholder="e.g. Acme Corporation Ltd."
                                />
                                {valErrors.industryName && <p className="mt-2 text-xs font-medium text-red-600">{valErrors.industryName}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Industry Type</label>
                                    <div className="relative">
                                        <select
                                            name="industryTypeId"
                                            value={formData.industryTypeId}
                                            onChange={handleChange as any}
                                            className={`w-full px-5 py-3.5 bg-slate-50 border ${valErrors.industryTypeId ? 'border-red-400 focus:ring-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 focus:bg-white'} rounded-xl text-slate-900 focus:outline-none focus:ring-2 transition-all appearance-none shadow-sm font-medium`}
                                        >
                                            <option value="" disabled>Select Industry</option>
                                            {industryTypes.map((type) => (
                                                <option key={type.id} value={type.id}>{type.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                    {valErrors.industryTypeId && <p className="mt-2 text-xs font-medium text-red-600">{valErrors.industryTypeId}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Country</label>
                                    <div className="relative">
                                        <select
                                            name="countryId"
                                            value={formData.countryId}
                                            onChange={handleChange as any}
                                            className={`w-full px-5 py-3.5 bg-slate-50 border ${valErrors.countryId ? 'border-red-400 focus:ring-red-500 bg-red-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 focus:bg-white'} rounded-xl text-slate-900 focus:outline-none focus:ring-2 transition-all appearance-none shadow-sm font-medium`}
                                        >
                                            <option value="" disabled>Select Country</option>
                                            {countries.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                    {valErrors.countryId && <p className="mt-2 text-xs font-medium text-red-600">{valErrors.countryId}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">State / Province</label>
                                    <div className="relative">
                                        <select
                                            name="stateId"
                                            value={formData.stateId}
                                            onChange={handleChange as any}
                                            disabled={!formData.countryId || states.length === 0}
                                            className={`w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 focus:bg-white focus:outline-none focus:ring-2 transition-all appearance-none shadow-sm font-medium disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed`}
                                        >
                                            <option value="" disabled>Select State</option>
                                            {states.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Legal & Consent */}
                        <div className="space-y-6 pt-2">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">3. Legal & Consent</h3>
                            </div>

                            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <div className="flex items-start gap-4">
                                    <div className="flex items-center h-6">
                                        <input
                                            type="checkbox"
                                            name="authorized"
                                            id="authorized"
                                            checked={checkboxes.authorized}
                                            onChange={handleCheckboxChange}
                                            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-white shadow-sm cursor-pointer"
                                        />
                                    </div>
                                    <label htmlFor="authorized" className="text-sm font-medium text-slate-700 cursor-pointer pt-0.5 select-none">
                                        I am officially authorized to represent this organization and create this account on its behalf.
                                    </label>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex items-center h-6">
                                        <input
                                            type="checkbox"
                                            name="agreed"
                                            id="agreed"
                                            checked={checkboxes.agreed}
                                            onChange={handleCheckboxChange}
                                            className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-white shadow-sm cursor-pointer"
                                        />
                                    </div>
                                    <label htmlFor="agreed" className="text-sm font-medium text-slate-700 cursor-pointer pt-0.5 select-none">
                                        I have read and agree to the{' '}
                                        <Link to="/terms" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline">Terms of Service</Link>
                                        {' '}and{' '}
                                        <Link to="/privacy" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline">Privacy Policy</Link>.
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-8 flex flex-col items-center border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={loading || isSubmitDisabled}
                                className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:-translate-y-0.5
                                    ${loading || isSubmitDisabled
                                        ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Enterprise Account</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <p className="mt-8 text-slate-500">
                                Already have an account?{' '}
                                <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-500 hover:underline transition-colors">
                                    Sign In Here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
