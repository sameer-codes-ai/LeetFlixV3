'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import { usersApi, authApi } from './api';
import { User } from './types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get('lf_token');
        if (token) {
            usersApi
                .getMe()
                .then((res) => setUser(res.data))
                .catch(() => Cookies.remove('lf_token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // identifier = username OR email — backend auto-detects based on '@' symbol
    const login = async (identifier: string, password: string) => {
        const res = await authApi.login({ identifier, password });
        Cookies.set('lf_token', res.data.access_token, { expires: 7 });
        setUser(res.data.user);
    };

    const register = async (username: string, email: string, password: string) => {
        const res = await authApi.register({ username, email, password });
        Cookies.set('lf_token', res.data.access_token, { expires: 7 });
        setUser(res.data.user);
    };

    const logout = () => {
        Cookies.remove('lf_token');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
