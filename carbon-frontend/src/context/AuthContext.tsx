import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, industryId: string, industryTypeId: string, userName?: string, industryName?: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('industryId');
        localStorage.removeItem('industryTypeId');
        localStorage.removeItem('userName');
        localStorage.removeItem('industryName');
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        if (token) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const decoded: any = jwtDecode(token);
                // In a real app, you might want to check for expiration here
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUser({
                    email: decoded.sub,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    role: decoded.role.replace('ROLE_', '') as any,
                    industryId: decoded.industryId || localStorage.getItem('industryId') || '',
                    industryTypeId: localStorage.getItem('industryTypeId') || '',
                    userName: localStorage.getItem('userName') || '',
                    industryName: localStorage.getItem('industryName') || '',
                });
            } catch {
                logout();
            }
        }
    }, [token]);

    const login = (newToken: string, industryId: string, industryTypeId: string, userName?: string, industryName?: string) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('industryId', industryId);
        localStorage.setItem('industryTypeId', industryTypeId);
        if (userName) localStorage.setItem('userName', userName);
        if (industryName) localStorage.setItem('industryName', industryName);
        setToken(newToken);
        // Also immediately set user so DashboardSelector doesn't race with useEffect
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const decoded: any = jwtDecode(newToken);
            setUser({
                email: decoded.sub,
                role: decoded.role.replace('ROLE_', '') as any,
                industryId: industryId || decoded.industryId || '',
                industryTypeId: industryTypeId || '',
                userName: userName || '',
                industryName: industryName || '',
            });
        } catch {
            // ignore — useEffect will handle it
        }
    };



    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
