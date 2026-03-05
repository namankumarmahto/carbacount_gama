/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
    Building2, Globe, Factory, Calendar, Mail, ChevronRight,
    Search, Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, X
} from 'lucide-react';

const BASE_URL = 'http://localhost:8081';

interface OrgSummary {
    id: string;
    name: string;
    industryType: string;
    country: string;
    state: string;
    createdAt: string;
    ownerEmail: string;
    ownerName: string;
    ownerId: string;
}

const AdminDashboardPage: React.FC = () => {
    const [orgs, setOrgs] = useState<OrgSummary[]>([]);
    const [filtered, setFiltered] = useState<OrgSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    // Second-auth modal state
    const [selectedOrg, setSelectedOrg] = useState<OrgSummary | null>(null);
    const [ownerEmail, setOwnerEmail] = useState('');
    const [ownerPassword, setOwnerPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    const getToken = () => localStorage.getItem('token');

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/platform/organizations`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                const data = await res.json();
                if (data.success) {
                    setOrgs(data.data || []);
                    setFiltered(data.data || []);
                } else {
                    setError(data.message || 'Failed to load organizations');
                }
            } catch {
                setError('Network error — could not load organizations');
            } finally {
                setLoading(false);
            }
        };
        fetchOrgs();
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(orgs);
        } else {
            const q = search.toLowerCase();
            setFiltered(orgs.filter(o =>
                o.name.toLowerCase().includes(q) ||
                o.industryType.toLowerCase().includes(q) ||
                o.country.toLowerCase().includes(q) ||
                o.ownerEmail.toLowerCase().includes(q)
            ));
        }
    }, [search, orgs]);

    const openOrgModal = (org: OrgSummary) => {
        setSelectedOrg(org);
        setOwnerEmail(org.ownerEmail); // pre-fill owner email
        setOwnerPassword('');
        setAuthError('');
    };

    const handleEnterOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrg) return;
        setAuthLoading(true);
        setAuthError('');

        try {
            const res = await fetch(`${BASE_URL}/api/platform/organizations/${selectedOrg.id}/enter`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ownerEmail, ownerPassword })
            });
            const data = await res.json();
            if (data.success) {
                // Store the org-scoped token and redirect to the org dashboard
                const orgToken = data.data.orgScopedToken;
                const orgName = data.data.organizationName;

                // Save org-scoped token (replaces the current token temporarily)
                localStorage.setItem('token', orgToken);
                localStorage.setItem('orgName', orgName);
                localStorage.setItem('adminOriginalToken', getToken() || '');

                showToast(`Entering ${orgName}...`, true);
                setSelectedOrg(null);

                // Navigate to owner dashboard (the token now has ROLE_OWNER)
                setTimeout(() => {
                    window.location.href = '/';
                }, 800);
            } else {
                setAuthError(data.message || 'Authentication failed. Check credentials.');
            }
        } catch {
            setAuthError('Network error. Please try again.');
        } finally {
            setAuthLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 animate-pulse">Loading organizations...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${toast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-emerald-600" />
                        Platform Administration
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {orgs.length} registered organization{orgs.length !== 1 ? 's' : ''}. Click any row to access an organization.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    <span className="text-emerald-700 font-bold text-sm">{orgs.length} Orgs</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search organizations by name, industry, country or owner..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
                />
            </div>

            {/* Organizations Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No organizations found</p>
                        {search && <p className="text-slate-400 text-sm mt-1">Try a different search term</p>}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Organization</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map(org => (
                                    <tr
                                        key={org.id}
                                        onClick={() => openOrgModal(org)}
                                        className="hover:bg-emerald-50/50 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-4 h-4 text-emerald-700" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 text-sm">{org.name}</p>
                                                    <p className="text-slate-400 text-xs">{org.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Factory className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-slate-700 text-sm">{org.industryType}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Globe className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-slate-700 text-sm">{org.country}{org.state ? `, ${org.state}` : ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-slate-600 text-sm">
                                                    {org.createdAt ? new Date(org.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                <div>
                                                    <p className="text-slate-700 text-sm">{org.ownerName}</p>
                                                    <p className="text-slate-400 text-xs">{org.ownerEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Second-Auth Modal */}
            {selectedOrg && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setSelectedOrg(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 text-lg">Access Organization</h2>
                                <p className="text-slate-500 text-sm">{selectedOrg.name}</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex items-start gap-2 text-amber-800 text-sm">
                            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>Enter the <strong>organization owner's credentials</strong> to gain access to their environment.</span>
                        </div>

                        {authError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2 text-red-700 text-sm">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                {authError}
                            </div>
                        )}

                        <form onSubmit={handleEnterOrg} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Owner Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={ownerEmail}
                                        onChange={e => setOwnerEmail(e.target.value)}
                                        required
                                        className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                        placeholder="owner@organization.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Owner Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={ownerPassword}
                                        onChange={e => setOwnerPassword(e.target.value)}
                                        required
                                        className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedOrg(null)}
                                    className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={authLoading}
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    {authLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <><ChevronRight className="w-4 h-4" /> Enter Organization</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
