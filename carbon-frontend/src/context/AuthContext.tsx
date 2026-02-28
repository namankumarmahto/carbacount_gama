import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, role: string, industryId: string, industryTypeId: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                // In a real app, you might want to check for expiration here
                setUser({
                    email: decoded.sub,
                    role: decoded.role.replace('ROLE_', '') as any,
                    industryId: decoded.industryId || localStorage.getItem('industryId') || '',
                    industryTypeId: localStorage.getItem('industryTypeId') || '',
                });
            } catch (e) {
                logout();
            }
        }
    }, [token]);

    const login = (newToken: string, role: string, industryId: string, industryTypeId: string) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('industryId', industryId);
        localStorage.setItem('industryTypeId', industryTypeId);
        setToken(newToken);
        // User state will be updated by useEffect
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('industryId');
        localStorage.removeItem('industryTypeId');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
