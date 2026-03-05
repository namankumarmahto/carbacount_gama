export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export interface User {
    email: string;
    role: 'ADMIN' | 'INDUSTRY' | 'AUDITOR' | 'OWNER' | 'DATA_ENTRY' | 'VIEWER';
    industryId: string;
    industryTypeId: string;
    userName?: string;
    industryName?: string;
}

export interface LoginResponse {
    token: string;
    role: string;
    industryId: string;
    industryTypeId: string;
    userName: string;
    industryName: string;
}

export interface EmissionRecord {
    id: string;
    emissionId?: string;
    plantId: string;
    scope1: number;
    scope2: number;
    scope3: number;
    calculatedEmission?: number;
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
    activityType: string;
    activityQuantity: number;
    activityUnit: string;
    value: number;
    recordedAt: string;
}

export interface ScopeDashboardResponse {
    scope: string;
    totalEmission: number;
    categoryBreakdown: CategoryEmission[];
    records: EmissionRecordDetail[];
}
