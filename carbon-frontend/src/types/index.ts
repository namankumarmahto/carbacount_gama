export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export interface User {
    email: string;
    role: 'ADMIN' | 'INDUSTRY' | 'AUDITOR';
    industryId: string;
    industryTypeId: string;
}

export interface LoginResponse {
    token: string;
    role: string;
    industryId: string;
    industryTypeId: string;
}

export interface EmissionRecord {
    id: string;
    plantId: string;
    scope1: number;
    scope2: number;
    scope3: number;
    recordedAt: string;
}

export interface DashboardData {
    totalEmission: number;
    scope1Total: number;
    scope2Total: number;
    scope3Total: number;
    carbonIntensity: number;
    monthlyTrends: {
        month: string;
        emission: number;
    }[];
    categoryBreakdown: CategoryEmission[];
}

export interface CategoryEmission {
    categoryId: string | null;
    categoryName: string;
    totalEmission: number;
}

export interface IndustryType {
    id: string;
    name: string;
}

export interface EmissionCategory {
    id: string;
    industryTypeId: string;
    scope: string;
    categoryName: string;
    isCustom: boolean;
}

export interface EmissionRecordDetail {
    id: string;
    category: string;
    value: number;
    recordedAt: string;
}

export interface ScopeDashboardResponse {
    scope: string;
    totalEmission: number;
    categoryBreakdown: CategoryEmission[];
    records: EmissionRecordDetail[];
}
