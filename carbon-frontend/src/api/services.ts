import axiosInstance from './axiosInstance';
import type { ApiResponse, LoginResponse, EmissionRecord, DashboardData } from '../types';

export const authApi = {
    login: (loginData: any) =>
        axiosInstance.post<ApiResponse<LoginResponse>>('/api/auth/login', loginData),
    register: (registerData: any) =>
        axiosInstance.post<ApiResponse<string>>('/api/auth/register', registerData),
};

export const emissionApi = {
    addEmission: (data: any) =>
        axiosInstance.post<ApiResponse<EmissionRecord>>('/api/emissions', data),
    ingestRealtime: (data: any) =>
        axiosInstance.post<ApiResponse<string>>('/api/realtime/emission', data),
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
    }
};

export const referenceApi = {
    getIndustryTypes: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/industry-types'),
    getCategories: (industryTypeId: string, scope: string) =>
        axiosInstance.get<ApiResponse<any[]>>(`/api/categories?industryTypeId=${industryTypeId}&scope=${scope}`)
};
