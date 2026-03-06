import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import SetPasswordPage from '../pages/SetPasswordPage';

// Owner pages
import OwnerDashboardPage from '../pages/owner/OwnerDashboardPage';
import OwnerFacilitiesPage from '../pages/owner/OwnerFacilitiesPage';

import OwnerEmissionsPage from '../pages/owner/OwnerEmissionsPage';
import OwnerReportsPage from '../pages/owner/OwnerReportsPage';
import OwnerUsersPage from '../pages/owner/OwnerUsersPage';
import OwnerOrgSettingsPage from '../pages/owner/OwnerOrgSettingsPage';
import OwnerAuditLogsPage from '../pages/owner/OwnerAuditLogsPage';
import OwnerDataEntryRecordsPage from '../pages/owner/OwnerDataEntryRecordsPage';
import OwnerEmissionFactorsPage from '../pages/owner/OwnerEmissionFactorsPage';


// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminFacilitiesPage from '../pages/admin/AdminFacilitiesPage';

import AdminEmissionsPage from '../pages/admin/AdminEmissionsPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';

// Data Entry pages (dedicated folder)
import DataEntryPage from '../pages/data_entry/DataEntryPage';
import DataEntrySubmissionsPage from '../pages/data_entry/DataEntrySubmissionsPage';
import DataEntryAuditLogsPage from '../pages/data_entry/AuditLogsPage';

// Auditor pages
import AuditorVerifyPage from '../pages/auditor/AuditorVerifyPage';

// Viewer pages (dedicated folder)
import ViewerVerifyPage from '../pages/viewer/ViewerVerifyPage';
import ViewerEmissionsPage from '../pages/viewer/ViewerEmissionsPage';
import ViewerAuditLogsPage from '../pages/viewer/ViewerAuditLogsPage';

import AddEmissionPage from '../pages/AddEmissionPage';
import Layout from '../components/layout/Layout';

/** Returns the home path for a given role */
export const getHomePath = (role: User['role'] | undefined): string => {
    switch (role) {
        case 'OWNER': return '/';
        case 'ADMIN': return '/admin';
        case 'DATA_ENTRY': return '/data-entry/submit';
        case 'AUDITOR': return '/auditor/verify';
        case 'VIEWER': return '/viewer/verify';
        default: return '/login';
    }
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Layout>{children}</Layout>;
};

const RoleRoute: React.FC<{
    allowedRoles: User['role'][];
    children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user && !allowedRoles.includes(user.role)) return <Navigate to={getHomePath(user.role)} replace />;
    return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
    const { user, isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* ── Public ── */}
            <Route path="/login" element={isAuthenticated ? <Navigate to={getHomePath(user?.role)} replace /> : <LoginPage />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to={getHomePath(user?.role)} replace /> : <RegisterPage />} />
            <Route path="/set-password" element={<SetPasswordPage />} />

            {/* ── OWNER ── */}
            <Route path="/" element={<RoleRoute allowedRoles={['OWNER']}><OwnerDashboardPage /></RoleRoute>} />
            <Route path="/facilities" element={<RoleRoute allowedRoles={['OWNER']}><OwnerFacilitiesPage /></RoleRoute>} />
            <Route path="/users" element={<RoleRoute allowedRoles={['OWNER']}><OwnerUsersPage /></RoleRoute>} />
            <Route path="/org-settings" element={<RoleRoute allowedRoles={['OWNER']}><OwnerOrgSettingsPage /></RoleRoute>} />
            <Route path="/audit-logs" element={<RoleRoute allowedRoles={['OWNER']}><OwnerAuditLogsPage /></RoleRoute>} />
            <Route path="/data-entry-records" element={<RoleRoute allowedRoles={['OWNER', 'ADMIN']}><OwnerDataEntryRecordsPage /></RoleRoute>} />
            <Route path="/emission-factors" element={<RoleRoute allowedRoles={['OWNER']}><OwnerEmissionFactorsPage /></RoleRoute>} />



            <Route path="/emissions" element={<RoleRoute allowedRoles={['OWNER']}><OwnerEmissionsPage /></RoleRoute>} />
            <Route path="/reports" element={<RoleRoute allowedRoles={['OWNER']}><OwnerReportsPage /></RoleRoute>} />

            {/* ── ADMIN ── */}
            <Route path="/admin" element={<RoleRoute allowedRoles={['ADMIN']}><AdminDashboardPage /></RoleRoute>} />
            <Route path="/admin/facilities" element={<RoleRoute allowedRoles={['ADMIN']}><AdminFacilitiesPage /></RoleRoute>} />

            <Route path="/admin/emissions" element={<RoleRoute allowedRoles={['ADMIN']}><AdminEmissionsPage /></RoleRoute>} />
            <Route path="/admin/reports" element={<RoleRoute allowedRoles={['ADMIN']}><AdminReportsPage /></RoleRoute>} />

            {/* ── DATA_ENTRY ── */}
            <Route path="/data-entry/submit" element={<RoleRoute allowedRoles={['DATA_ENTRY']}><DataEntryPage /></RoleRoute>} />
            <Route path="/data-entry" element={<RoleRoute allowedRoles={['DATA_ENTRY']}><DataEntryPage /></RoleRoute>} />
            <Route path="/data-entry/submissions" element={<RoleRoute allowedRoles={['DATA_ENTRY']}><DataEntrySubmissionsPage /></RoleRoute>} />
            <Route path="/data-entry/audit-logs" element={<RoleRoute allowedRoles={['DATA_ENTRY']}><DataEntryAuditLogsPage /></RoleRoute>} />

            {/* ── AUDITOR ── */}
            <Route path="/auditor/verify" element={<RoleRoute allowedRoles={['AUDITOR']}><AuditorVerifyPage /></RoleRoute>} />

            {/* ── VIEWER ── */}
            <Route path="/viewer/verify" element={<RoleRoute allowedRoles={['VIEWER']}><ViewerVerifyPage /></RoleRoute>} />
            <Route path="/viewer/emissions" element={<RoleRoute allowedRoles={['VIEWER']}><ViewerEmissionsPage /></RoleRoute>} />
            <Route path="/viewer/audit-logs" element={<RoleRoute allowedRoles={['VIEWER']}><ViewerAuditLogsPage /></RoleRoute>} />

            {/* ── Misc ── */}
            <Route path="/add" element={<ProtectedRoute><AddEmissionPage /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to={getHomePath(user?.role)} replace />} />
        </Routes>
    );
};

export default AppRoutes;
