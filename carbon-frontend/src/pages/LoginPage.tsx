/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { getHomePath } from '../routes/AppRoutes';
import type { User } from '../types';
import { LogIn, Mail, Lock, ShieldAlert, Users } from 'lucide-react';

const ROLES = ['OWNER', 'ADMIN', 'DATA ENTRY', 'VIEWER'];

// Map display role names → backend JWT role strings
const ROLE_MAP: Record<string, string> = {
    'OWNER': 'OWNER',
    'ADMIN': 'ADMIN',
    'DATA ENTRY': 'DATA_ENTRY',
    'VIEWER': 'VIEWER',
};

const LoginPage: React.FC = () => {
    const [role, setRole] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) {
            setError('Please select a role before signing in.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await authApi.login({ email, password });
            if (response.data.success) {
                const data = response.data.data;
                const { token, userName, industryName } = data;

                // Decode the JWT to get the ACTUAL role assigned to this account
                const decoded: any = jwtDecode(token);
                const actualRole = decoded.role?.replace('ROLE_', '') as User['role'];

                // Enforce role mismatch: the selected role must match the actual account role
                const expectedRole = ROLE_MAP[role];
                if (expectedRole !== actualRole) {
                    setError(
                        `Access denied. Your account is registered as "${actualRole}", not "${role}". Please select the correct role.`
                    );
                    return; // Do NOT store token or redirect
                }

                // Role matches — proceed with login
                const industryId = data.industryId || '';
                const industryTypeId = data.industryTypeId || '';
                login(token, industryId, industryTypeId, userName, industryName);
                navigate(getHomePath(actualRole));
            } else {
                setError(response.data.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-4 border border-green-500/30">
                            <LogIn className="w-8 h-8 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-slate-400">Sign in to your carbon accounting dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Select Role</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <select
                                    className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all appearance-none"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="" disabled>Choose a role...</option>
                                    {ROLES.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                                    placeholder="admin@industry.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 text-sm">
                        Don't have an account? <Link to="/register" className="text-green-500 cursor-pointer hover:underline">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
