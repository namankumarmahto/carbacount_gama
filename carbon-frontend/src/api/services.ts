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
};

export const referenceApi = {
    getIndustryTypes: () =>
        axiosInstance.get<ApiResponse<any[]>>('/api/industry-types'),
    getCategories: (industryTypeId: string, scope: string) =>
        axiosInstance.get<ApiResponse<any[]>>(`/api/categories?industryTypeId=${industryTypeId}&scope=${scope}`)
};
