import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    login: string;
    avatar_url: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isLoggedIn: boolean;
    login: (token: string, refreshToken: string, user: User) => void;
    logout: () => void;
    updateTokens: (newToken: string, newRefreshToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('github_token');
        const storedRefreshToken = localStorage.getItem('github_refresh_token');
        const storedUser = localStorage.getItem('github_user');
        if (storedToken && storedRefreshToken && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setToken(storedToken);
                setRefreshToken(storedRefreshToken);
                setUser(userData);
            } catch (e) {
                localStorage.removeItem('github_token');
                localStorage.removeItem('github_refresh_token');
                localStorage.removeItem('github_user');
            }
        }
    }, []);

    const login = (newToken: string, newRefreshToken: string, newUser: User) => {
        setToken(newToken);
        setRefreshToken(newRefreshToken);
        setUser(newUser);
        localStorage.setItem('github_token', newToken);
        localStorage.setItem('github_refresh_token', newRefreshToken);
        localStorage.setItem('github_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem('github_token');
        localStorage.removeItem('github_refresh_token');
        localStorage.removeItem('github_user');
    };

    const updateTokens = (newToken: string, newRefreshToken: string) => {
        setToken(newToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem('github_token', newToken);
        localStorage.setItem('github_refresh_token', newRefreshToken);
    };

    return (
        <AuthContext.Provider value={{ user, token, refreshToken, isLoggedIn: !!token, login, logout, updateTokens }}>
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