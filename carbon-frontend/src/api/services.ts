/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from './axiosInstance';
import type { ApiResponse, LoginResponse, EmissionRecord, DashboardData } from '../types';

export const authApi = {
    login: (loginData: any) =>
        axiosInstance.post<ApiResponse<LoginResponse>>('/api/auth/login', loginData),
    register: (registerData: any) =>
        axiosInstance.post<ApiResponse<string>>('/api/auth/register', registerData),
    setPassword: (data: { token: string; password: string }) =>
        axiosInstance.post<ApiResponse<string>>('/api/auth/set-password', data),
};

export const emissionApi = {
    addEmission: (data: any) =>
        axiosInstance.post<ApiResponse<EmissionRecord>>('/api/emissions', data),
    ingestRealtime: (data: any) =>
        axiosInstance.post<ApiResponse<string>>('/api/realtime/emission', data),
};

export const ingestionApi = {
    uploadEvidence: (formData: FormData) =>
        axiosInstance.post<ApiResponse<{ url: string, filename: string }>>('/api/ingestion/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    bulkUpload: (formData: FormData) =>
        axiosInstance.post<ApiResponse<{ summary: string, details: string[] }>>('/api/ingestion/bulk', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
};

export const draftApi = {
    createDraft: (data: any) =>
        axiosInstance.post<ApiResponse<EmissionRecord>>('/api/emission/draft/facility', data),
    updateClassification: (id: string, data: any) =>
        axiosInstance.put<ApiResponse<EmissionRecord>>(`/api/emission/draft/${id}/classification`, data),
    updateActivity: (id: string, data: any) =>
        axiosInstance.put<ApiResponse<EmissionRecord>>(`/api/emission/draft/${id}/activity`, data),
    commitDraft: (id: string) =>
        axiosInstance.post<ApiResponse<EmissionRecord>>(`/api/emission/draft/${id}/commit`)
};

export const plantApi = {
    getPlants: () => axiosInstance.get<ApiResponse<any[]>>('/api/plants')
};

export const dashboardApi = {
    getDashboard: () =>
        axiosInstance.get<ApiResponse<DashboardData>>('/api/dashboard'),
    getScopeDashboard: (scope: string, startDate?: string, endDate?: string) => {
        let url = `/api/dashboard/scope/${scope}`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        return axiosInstance.get<ApiResponse<import('../types').ScopeDashboardResponse>>(url);
    },
    getAllEmissions: (startDate?: string, endDate?: string) => {
        let url = `/api/dashboard/all-emissions`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        return axiosInstance.get<ApiResponse<any>>(url);
    }
};

export const ownerApi = {
    inviteUser: (data: any) =>
        axiosInstance.post<ApiResponse<any>>('/api/owner/users/invite', data),
    getUsers: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/owner/users'),
    updateUserRole: (userId: string, role: string) =>
        axiosInstance.put<ApiResponse<string>>(`/api/owner/users/${userId}/role?role=${role}`),
    updateUserStatus: (userId: string, status: string) =>
        axiosInstance.put<ApiResponse<string>>(`/api/owner/users/${userId}/status?status=${status}`),
    getFacilities: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/owner/facilities'),
    createFacility: (data: any) =>
        axiosInstance.post<ApiResponse<any>>('/api/owner/facilities', data),
    deletePendingUser: (userId: string) =>
        axiosInstance.delete<ApiResponse<string>>(`/api/owner/users/${userId}/pending`),
    updatePendingUser: (userId: string, data: any) =>
        axiosInstance.put<ApiResponse<any>>(`/api/owner/users/${userId}/pending`, data),
    deleteUser: (userId: string) =>
        axiosInstance.delete<ApiResponse<string>>(`/api/owner/users/${userId}/delete`),
    archiveFacility: (facilityId: string) =>
        axiosInstance.delete<ApiResponse<string>>(`/api/owner/facilities/${facilityId}`),
    updateFacility: (facilityId: string, data: any) =>
        axiosInstance.put<ApiResponse<any>>(`/api/owner/facilities/${facilityId}`, data),
    toggleFacilityStatus: (facilityId: string) =>
        axiosInstance.put<ApiResponse<any>>(`/api/owner/facilities/${facilityId}/status`),
    deleteFacilityPermanently: (facilityId: string) =>
        axiosInstance.delete<ApiResponse<string>>(`/api/owner/facilities/${facilityId}/permanent`),
    updateActiveUser: (userId: string, data: any) =>
        axiosInstance.put<ApiResponse<any>>(`/api/owner/users/${userId}/active`, data),
};

export const reportingYearApi = {
    getAll: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/reporting-years'),
    create: (data: { yearLabel: string; startDate: string; endDate: string }) =>
        axiosInstance.post<ApiResponse<any>>('/api/reporting-years', data),
};


export const reportApi = {
    downloadReport: (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const url = `/api/report/download?${params.toString()}`;
        return axiosInstance.get(url, { responseType: 'blob' });
    }
};

export const referenceApi = {
    getIndustryTypes: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/industry-types'),
    getCategories: (industryTypeId: string, scope: string) =>
        axiosInstance.get<ApiResponse<any[]>>(`/api/categories?industryTypeId=${industryTypeId}&scope=${scope}`),
    getEmissionFactors: (scope: string) =>
        axiosInstance.get<ApiResponse<any[]>>(`/api/emission-factors?scope=${scope}`),
    getCountries: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/countries'),
    getStates: (countryId: string) =>
        axiosInstance.get<ApiResponse<any[]>>(`/api/states?countryId=${countryId}`),
    getActivities: (industryTypeId: string, categoryId: string) =>
        axiosInstance.get<ApiResponse<any[]>>(`/api/activities?industryTypeId=${industryTypeId}&categoryId=${categoryId}`),
    getFuelType: (id: string) =>
        axiosInstance.get<ApiResponse<any>>(`/api/fuels/${id}`)
};
export const dataEntryApi = {
    submit: (data: any) =>
        axiosInstance.post<ApiResponse<number>>('/api/data-entry/emission/submit', data),
    getMySubmissions: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/data-entry/emission/my-submissions'),
    getApproved: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/data-entry/emission/approved'),
    getAll: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/data-entry/emission/all'),
    getMyFacilities: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/data-entry/facilities'),
};

export const viewerApi = {
    getPending: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/viewer/pending'),
    getAll: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/viewer/all'),
    verify: (recordId: string, type: string, action: string, reason?: string) =>
        axiosInstance.put<ApiResponse<string>>(`/api/viewer/verify/${recordId}`, { type, action, reason }),
};

export const auditApi = {
    getLogs: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/audit/logs'),
};

export const platformApi = {
    getOrganizations: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/platform/organizations'),
    enterOrganization: (orgId: string, data: { ownerEmail: string; ownerPassword: string }) =>
        axiosInstance.post<ApiResponse<any>>(`/api/platform/organizations/${orgId}/enter`, data),
};

export const auditorApi = {
    getPending: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/auditor/pending'),
    verify: (recordId: string, data: { type: string; action: string; reason?: string }) =>
        axiosInstance.put<ApiResponse<string>>(`/api/auditor/verify/${recordId}`, data),
};
