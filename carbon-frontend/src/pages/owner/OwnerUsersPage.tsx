import React, { useState, useEffect, useCallback } from 'react';
import {
    ChevronDown, ChevronLeft, ChevronRight, X, Loader2,
    UserPlus, Users, Mail, Shield, Building2, RefreshCw,
    CheckCircle2, XCircle, Clock, Pencil, Trash2, AlertTriangle
} from 'lucide-react';
import { ownerApi } from '../../api/services';

/* ─── Types ─────────────────────────────────────────────── */
interface OrgUser {
    id: string;
    fullName: string;
    email: string;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    roles: string[];
    facility: string;
    organizationId: string;
}

/* ─── Helpers ─────────────────────────────────────────────────────── */
const ROLE_OPTIONS = [
    { value: 'DATA_ENTRY', label: 'Data Entry' },
    { value: 'AUDITOR', label: 'Auditor' },
    { value: 'VIEWER', label: 'Viewer' },
];

const StatusBadge: React.FC<{ status: OrgUser['status'] }> = ({ status }) => {
    const styles = {
        ACTIVE: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        INACTIVE: 'bg-slate-100  text-slate-500  border border-slate-200',
        PENDING: 'bg-amber-50   text-amber-700  border border-amber-200',
    }[status];
    const Icon = { ACTIVE: CheckCircle2, INACTIVE: XCircle, PENDING: Clock }[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${styles}`}>
            <Icon className="w-3 h-3" />
            {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
    );
};

/* ─── Main Component ─────────────────────────────────────  */
const OwnerUsersPage: React.FC = () => {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [users, setUsers] = useState<OrgUser[]>([]);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [inviteError, setInviteError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    /* ── Edit modal state ── */
    const [editUser, setEditUser] = useState<OrgUser | null>(null);
    const [editMode, setEditMode] = useState<'pending' | 'active'>('pending');
    const [editForm, setEditForm] = useState({ fullName: '', email: '', role: 'DATA_ENTRY', facilityIds: [] as string[] });
    const [editError, setEditError] = useState('');
    const [editSubmitting, setEditSubmitting] = useState(false);

    /* ── Delete confirmation state ── */
    const [deleteUser, setDeleteUser] = useState<OrgUser | null>(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);
    const [deleteIsPending, setDeleteIsPending] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: 'DATA_ENTRY',
        facilityIds: [] as string[],
    });

    /* ── Fetch ── */
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ownerApi.getUsers();
            if (res.data.success) setUsers(res.data.data as OrgUser[]);
        } catch (e) {
            console.error('Error fetching users:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFacilities = useCallback(async () => {
        try {
            const res = await ownerApi.getFacilities();
            // Only show ACTIVE facilities — INACTIVE ones cannot be assigned to users
            if (res.data.success) setFacilities(res.data.data.filter((f: any) => f.status === 'ACTIVE'));
        } catch (e) {
            console.error('Error fetching facilities:', e);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchFacilities();
    }, [fetchUsers, fetchFacilities]);

    /* ── Invite ── */
    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError('');
        setSubmitting(true);
        try {
            const res = await ownerApi.inviteUser({ ...formData, role: formData.role });
            if (res.data.success) {
                setIsInviteModalOpen(false);
                setFormData({ fullName: '', email: '', role: 'DATA_ENTRY', facilityIds: [] });
                await fetchUsers();
                showSuccess('Invitation sent! The user will receive an email to set their password.');
            }
        } catch (err: any) {
            setInviteError(err.response?.data?.message || 'Failed to invite user. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Role Change ── */
    const handleRoleChange = async (userId: string, newRole: string, currentRole: string) => {
        if (newRole === currentRole) return;
        setUpdatingId(userId);
        try {
            await ownerApi.updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: [newRole] } : u));
            showSuccess('Role updated successfully.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update role.');
        } finally {
            setUpdatingId(null);
        }
    };

    /* ── Status Toggle ── */
    const handleStatusToggle = async (user: OrgUser) => {
        if (user.status === 'PENDING') {
            setError('Cannot change status of a PENDING user. They must accept the invitation first.');
            return;
        }
        const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        setUpdatingId(user.id);
        try {
            await ownerApi.updateUserStatus(user.id, newStatus);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus as OrgUser['status'] } : u));
            showSuccess(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully.`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setUpdatingId(null);
        }
    };

    /* ── Open Edit Modal ── */
    const openEditModal = (user: OrgUser, mode: 'pending' | 'active') => {
        setEditUser(user);
        setEditMode(mode);
        setEditError('');
        setEditForm({
            fullName: user.fullName,
            email: user.email,
            role: user.roles[0] ?? 'DATA_ENTRY',
            facilityIds: [],
        });
    };

    /* ── Submit Edit (Pending user) ── */
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editUser) return;
        setEditError('');
        setEditSubmitting(true);
        try {
            const res = await ownerApi.updatePendingUser(editUser.id, {
                fullName: editForm.fullName,
                email: editForm.email,
                role: editForm.role,
                facilityIds: editForm.facilityIds,
            });
            if (res.data.success) {
                setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...res.data.data } : u));
                setEditUser(null);
                showSuccess('Pending user updated successfully.');
            }
        } catch (err: any) {
            setEditError(err.response?.data?.message || 'Failed to update user.');
        } finally {
            setEditSubmitting(false);
        }
    };

    /* ── Submit Edit (Active user) ── */
    const handleActiveEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editUser) return;
        setEditError('');
        setEditSubmitting(true);
        try {
            const res = await ownerApi.updateActiveUser(editUser.id, {
                fullName: editForm.fullName,
                email: editForm.email,
                facilityIds: editForm.facilityIds,
            });
            if (res.data.success) {
                setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...res.data.data } : u));
                setEditUser(null);
                showSuccess('User updated. A notification email has been sent to them.');
            }
        } catch (err: any) {
            setEditError(err.response?.data?.message || 'Failed to update user.');
        } finally {
            setEditSubmitting(false);
        }
    };

    /* ── Confirm Delete ── */
    const handleDeleteConfirm = async () => {
        if (!deleteUser) return;
        setDeleteSubmitting(true);
        try {
            if (deleteIsPending) {
                await ownerApi.deletePendingUser(deleteUser.id);
            } else {
                await ownerApi.deleteUser(deleteUser.id);
            }
            setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
            setDeleteUser(null);
            showSuccess(`${deleteUser.fullName} has been removed.`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete user.');
            setDeleteUser(null);
        } finally {
            setDeleteSubmitting(false);
        }
    };

    const toggleFacility = (id: string, form: 'invite' | 'edit') => {
        if (form === 'invite') {
            setFormData(prev => ({
                ...prev,
                facilityIds: prev.facilityIds.includes(id)
                    ? prev.facilityIds.filter(fid => fid !== id)
                    : [...prev.facilityIds, id],
            }));
        } else {
            setEditForm(prev => ({
                ...prev,
                facilityIds: prev.facilityIds.includes(id)
                    ? prev.facilityIds.filter(fid => fid !== id)
                    : [...prev.facilityIds, id],
            }));
        }
    };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const activeCount = users.filter(u => u.status === 'ACTIVE').length;
    const pendingCount = users.filter(u => u.status === 'PENDING').length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Global notifications ── */}
            {successMsg && (
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    {successMsg}
                </div>
            )}
            {error && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
                    <span>{error}</span>
                    <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Team Members</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Manage your organization's users, roles, and access.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchUsers}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => { setIsInviteModalOpen(true); setInviteError(''); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#1a4030] text-white rounded-xl text-sm font-semibold hover:bg-[#133024] transition-colors shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add User
                    </button>
                </div>
            </div>

            {/* ── Stats rows ── */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Members', value: users.length, icon: Users, color: 'text-slate-600 bg-slate-50' },
                    { label: 'Active', value: activeCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Pending Invites', value: pendingCount, icon: Clock, color: 'text-amber-600 bg-amber-50' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-100 px-5 py-4 flex items-center gap-4 shadow-sm">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{value}</p>
                            <p className="text-xs text-slate-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                {['Name & Email', 'Role', 'Facility Assigned', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="py-3.5 px-5 text-[12px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Loader2 className="w-7 h-7 animate-spin text-[#1a4030] mx-auto" />
                                        <p className="mt-2 text-sm text-slate-400">Loading team members…</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                            <Users className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <p className="mt-3 text-slate-600 font-semibold text-sm">No users yet</p>
                                        <p className="text-slate-400 text-xs mt-1">Invite team members using the button above.</p>
                                    </td>
                                </tr>
                            ) : users.map(user => {
                                const role = user.roles[0] ?? '';
                                const isOwner = role === 'OWNER';
                                const isUpdating = updatingId === user.id;
                                const isPending = user.status === 'PENDING';

                                return (
                                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors group">
                                        {/* Name + email */}
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#1a4030]/10 flex items-center justify-center text-[#1a4030] text-xs font-bold flex-shrink-0">
                                                    {user.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">{user.fullName}</p>
                                                    <p className="text-xs text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role (static badge for PENDING, dropdown for active) */}
                                        <td className="py-4 px-5">
                                            {isOwner ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1a4030]/10 text-[#1a4030] text-[11px] font-semibold">
                                                    <Shield className="w-3 h-3" /> Owner
                                                </span>
                                            ) : isPending ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">
                                                    {role.charAt(0) + role.slice(1).toLowerCase()}
                                                </span>
                                            ) : (
                                                <div className="relative inline-block">
                                                    <select
                                                        disabled={isUpdating}
                                                        value={role}
                                                        onChange={e => handleRoleChange(user.id, e.target.value, role)}
                                                        className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-1 focus:ring-[#1a4030] focus:border-[#1a4030] py-1.5 pl-3 pr-7 cursor-pointer disabled:opacity-50 min-w-[110px]"
                                                    >
                                                        {ROLE_OPTIONS.map(r => (
                                                            <option key={r.value} value={r.value}>{r.label}</option>
                                                        ))}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                                        {isUpdating
                                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                                            : <ChevronDown className="w-3 h-3" />}
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        {/* Facility */}
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                {user.facility && user.facility !== '—' ? (
                                                    <>
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                        <span className="truncate max-w-[160px]" title={user.facility}>{user.facility}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-300 text-xs italic">None assigned</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status badge */}
                                        <td className="py-4 px-5">
                                            <StatusBadge status={user.status} />
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-5">
                                            {isOwner ? (
                                                <span className="text-xs text-slate-300 italic">—</span>
                                            ) : isPending ? (
                                                /* ── PENDING: Awaiting text + Edit + Delete ── */
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] text-amber-500 italic mr-1">Awaiting acceptance</span>
                                                    <button
                                                        onClick={() => openEditModal(user, 'pending')}
                                                        title="Edit pending user"
                                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setDeleteUser(user); setDeleteIsPending(true); }}
                                                        title="Delete pending user"
                                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                /* ── ACTIVE / INACTIVE actions ── */
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        disabled={isUpdating}
                                                        onClick={() => handleStatusToggle(user)}
                                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border disabled:opacity-50 ${user.status === 'ACTIVE'
                                                            ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                                                            : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                                            }`}
                                                    >
                                                        {isUpdating
                                                            ? <Loader2 className="w-3 h-3 animate-spin inline" />
                                                            : user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(user, 'active')}
                                                        title="Edit user"
                                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setDeleteUser(user); setDeleteIsPending(false); }}
                                                        title="Delete user permanently"
                                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                <div className="px-5 py-3.5 flex items-center justify-between border-t border-slate-50 bg-white">
                    <span className="text-xs text-slate-400">
                        {users.length} member{users.length !== 1 ? 's' : ''} total
                    </span>
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded border border-slate-200 text-slate-300 cursor-not-allowed" disabled>
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded border border-slate-200 text-slate-300 cursor-not-allowed" disabled>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Invite Modal ── */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 pt-7 pb-5 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[#1a4030]/10 flex items-center justify-center">
                                        <UserPlus className="w-4 h-4 text-[#1a4030]" />
                                    </div>
                                    <div>
                                        <h2 className="text-[17px] font-bold text-slate-800 leading-tight">Invite Team Member</h2>
                                        <p className="text-xs text-slate-400 mt-0.5">They'll receive an email to set their password.</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleInvite} className="px-8 py-6 space-y-5">
                            {inviteError && (
                                <div className="flex items-start gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                                    <X className="w-4 h-4 flex-shrink-0 mt-0.5" />{inviteError}
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-slate-700">Full Name <span className="text-rose-500">*</span></label>
                                <input type="text" required value={formData.fullName}
                                    onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                                    placeholder="e.g. Rahul Mehta"
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4030]/20 focus:border-[#1a4030] placeholder:text-slate-300 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address <span className="text-rose-500">*</span>
                                </label>
                                <input type="email" required value={formData.email}
                                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                    placeholder="rahul@company.com"
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4030]/20 focus:border-[#1a4030] placeholder:text-slate-300 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                                    <Shield className="w-3.5 h-3.5 text-slate-400" /> Role <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                                        className="appearance-none w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4030]/20 focus:border-[#1a4030] bg-white text-slate-700 cursor-pointer pr-10 transition-all">
                                        {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    {formData.role === 'DATA_ENTRY' && 'Can enter emissions data for assigned facilities only.'}
                                    {formData.role === 'AUDITOR' && 'Can review and verify submitted emission records.'}
                                    {formData.role === 'VIEWER' && 'Read-only access to emissions and reports.'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> Facility Assignment
                                    {formData.role === 'DATA_ENTRY' && <span className="text-rose-500 text-[11px] font-normal">* Required for Data Entry</span>}
                                </label>
                                {facilities.length > 0 ? (
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                        {facilities.map(f => (
                                            <label key={f.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 hover:border-slate-200 transition-all group">
                                                <div className="relative">
                                                    <input type="checkbox" checked={formData.facilityIds.includes(f.id)}
                                                        onChange={() => toggleFacility(f.id, 'invite')}
                                                        className="peer w-4 h-4 appearance-none border-2 border-slate-300 rounded focus:ring-2 focus:ring-[#1a4030]/30 cursor-pointer checked:bg-[#1a4030] checked:border-[#1a4030] transition-colors" />
                                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100">
                                                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900">{f.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <Building2 className="w-4 h-4 text-slate-300" />
                                        <p className="text-xs text-slate-400">No facilities created yet. Add facilities first.</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
                                <button type="button" onClick={() => setIsInviteModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="px-6 py-2.5 rounded-xl bg-[#1a4030] text-white text-sm font-semibold hover:bg-[#133024] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60">
                                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Mail className="w-4 h-4" /> Send Invitation</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Pending User Modal ── */}
            {editUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 pt-7 pb-5 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Pencil className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-[17px] font-bold text-slate-800 leading-tight">
                                            {editMode === 'pending' ? 'Edit Pending User' : 'Edit User'}
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {editMode === 'pending'
                                                ? 'Update details before they accept the invitation.'
                                                : 'Changes will be saved and the user will be notified by email.'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={editMode === 'pending' ? handleEditSubmit : handleActiveEditSubmit} className="px-8 py-6 space-y-5">
                            {editError && (
                                <div className="flex items-start gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                                    <X className="w-4 h-4 flex-shrink-0 mt-0.5" />{editError}
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-slate-700">Full Name <span className="text-rose-500">*</span></label>
                                <input type="text" required value={editForm.fullName}
                                    onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address <span className="text-rose-500">*</span>
                                </label>
                                <input type="email" required value={editForm.email}
                                    onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            </div>
                            {/* Role dropdown — only for PENDING users; active users use inline dropdown */}
                            {editMode === 'pending' && (
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                                        <Shield className="w-3.5 h-3.5 text-slate-400" /> Role <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                                            className="appearance-none w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-700 cursor-pointer pr-10 transition-all">
                                            {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {facilities.length > 0 && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> Facility Assignment
                                        {editForm.role === 'DATA_ENTRY' && <span className="text-rose-500 text-[11px] font-normal">* Required for Data Entry</span>}
                                    </label>
                                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                        {facilities.map(f => (
                                            <label key={f.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 hover:border-slate-200 transition-all group">
                                                <div className="relative">
                                                    <input type="checkbox" checked={editForm.facilityIds.includes(f.id)}
                                                        onChange={() => toggleFacility(f.id, 'edit')}
                                                        className="peer w-4 h-4 appearance-none border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500/30 cursor-pointer checked:bg-blue-600 checked:border-blue-600 transition-colors" />
                                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100">
                                                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900">{f.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
                                <button type="button" onClick={() => setEditUser(null)}
                                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={editSubmitting}
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60">
                                    {editSubmitting
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                        : editMode === 'pending'
                                            ? <><Pencil className="w-4 h-4" /> Save Changes</>
                                            : <><Mail className="w-4 h-4" /> Save &amp; Notify User</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Dialog ── */}
            {deleteUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
                                <AlertTriangle className="w-7 h-7 text-rose-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Delete Pending User?</h2>
                                <p className="text-sm text-slate-500 mt-1.5">
                                    This will permanently remove <span className="font-semibold text-slate-700">{deleteUser.fullName}</span> ({deleteUser.email}) and all their data from the database. This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button onClick={() => setDeleteUser(null)} disabled={deleteSubmitting}
                                    className="flex-1 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors disabled:opacity-60">
                                    Cancel
                                </button>
                                <button onClick={handleDeleteConfirm} disabled={deleteSubmitting}
                                    className="flex-1 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
                                    {deleteSubmitting
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                                        : <><Trash2 className="w-4 h-4" /> Delete User</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerUsersPage;
