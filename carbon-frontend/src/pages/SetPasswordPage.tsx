/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../api/services';
import { Lock, CheckCircle2, Eye, EyeOff, ShieldAlert, KeyRound } from 'lucide-react';

const RULES = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'One special character (@#$%^&+=!)', test: (p: string) => /[@#$%^&+=!]/.test(p) },
];

const SetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') ?? '';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) setError('Invalid or missing invitation token. Please request a new invitation.');
    }, [token]);

    const allPassed = RULES.every(r => r.test(password));
    const matches = password === confirm && confirm.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!allPassed) { setError('Please meet all password requirements.'); return; }
        if (!matches) { setError('Passwords do not match.'); return; }

        setLoading(true);
        setError('');
        try {
            const res = await authApi.setPassword({ token, password });
            if (res.data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(res.data.message || 'Something went wrong.');
            }
        } catch (err: any) {
            console.error('Set password error:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to set password. The link may have expired.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    /* ── Success screen ── */
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Password Set!</h1>
                        <p className="text-slate-400 mt-2 text-sm">
                            Your account is now active. Redirecting you to login…
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors text-sm"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-4 border border-green-500/30">
                            <KeyRound className="w-8 h-8 text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">Set Your Password</h1>
                        <p className="text-slate-400 text-sm">
                            Create a strong password to activate your account.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-red-400 text-sm">
                            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {!token ? null : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type={showPwd ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Create a strong password"
                                        required
                                        className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Password rules */}
                            {password.length > 0 && (
                                <ul className="space-y-1">
                                    {RULES.map(rule => (
                                        <li key={rule.label} className={`flex items-center gap-2 text-xs transition-colors ${rule.test(password) ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${rule.test(password) ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                                                {rule.test(password) && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                            </div>
                                            {rule.label}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Confirm password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type={showConf ? 'text' : 'password'}
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        placeholder="Repeat your password"
                                        required
                                        className={`w-full pl-10 pr-10 py-3 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm ${confirm.length > 0
                                            ? matches ? 'border-emerald-500' : 'border-rose-500'
                                            : 'border-slate-700 focus:border-green-500'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConf(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {confirm.length > 0 && !matches && (
                                    <p className="text-rose-400 text-xs mt-1">Passwords do not match.</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !allPassed || !matches}
                                className="w-full py-3.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                {loading
                                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : 'Activate My Account'
                                }
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SetPasswordPage;
