'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as auth from '@/lib/authClient';

interface LoginFormProps {
    onLoginSuccess?: () => void;
}

/**
 * Login Form Component
 * 
 * Usage:
 * <LoginForm onLoginSuccess={() => router.push('/dashboard')} />
 */
export function LoginForm({ onLoginSuccess }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await auth.login(email, password);
            onLoginSuccess?.();
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={loading}
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={loading}
                />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}

interface RegisterFormProps {
    onRegisterSuccess?: () => void;
}

/**
 * Register Form Component
 * 
 * Usage:
 * <RegisterForm onRegisterSuccess={() => router.push('/login')} />
 */
export function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [adminSecret, setAdminSecret] = useState('');
    const [showAdminSecret, setShowAdminSecret] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            await auth.register(email, password, name, adminSecret || undefined);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                onRegisterSuccess?.();
                router.push('/login');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium">
                    Name
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={loading}
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={loading}
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium">
                    Password (min. 8 characters)
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={loading}
                />
            </div>

            <div className="border-t pt-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={showAdminSecret}
                        onChange={(e) => setShowAdminSecret(e.target.checked)}
                        className="rounded"
                    />
                    <span className="ml-2 text-sm">Register as admin</span>
                </label>

                {showAdminSecret && (
                    <div className="mt-3">
                        <label htmlFor="adminSecret" className="block text-sm font-medium">
                            Admin Secret
                        </label>
                        <input
                            id="adminSecret"
                            type="password"
                            value={adminSecret}
                            onChange={(e) => setAdminSecret(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            disabled={loading}
                            placeholder="Enter admin secret"
                        />
                    </div>
                )}
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}

            <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
            >
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
}

/**
 * Protected Route Wrapper Component
 * 
 * Usage:
 * <ProtectedRoute requiredRole="admin">
 *   <CreateEventForm />
 * </ProtectedRoute>
 */
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'user';
}

export function ProtectedRoute({ children, requiredRole = 'user' }: ProtectedRouteProps) {
    const router = useRouter();

    const isAuthorized = auth.isAuthenticated() && (
        requiredRole !== 'admin' || auth.isAdmin()
    );

    React.useEffect(() => {
        if (!auth.isAuthenticated()) {
            router.push('/login');
            return;
        }

        // Check role if required
        if (requiredRole === 'admin' && !auth.isAdmin()) {
            router.push('/unauthorized');
            return;
        }

        const checkTokenExpiry = setInterval(() => {
            if (auth.isTokenAboutToExpire(5)) {
                auth.refreshAccessToken().catch(() => {
                    router.push('/login');
                });
            }
        }, 60000); // Check every minute

        return () => clearInterval(checkTokenExpiry);
    }, [router, requiredRole]);

    if (!isAuthorized) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
}

/**
 * User Profile Display Component
 * 
 * Usage:
 * <UserProfile />
 */
export function UserProfile() {
    const user = auth.getCurrentUser();
    const router = useRouter();

    const handleLogout = async () => {
        await auth.logout();
        router.push('/login');
    };

    if (!user) {
        return <div>Not authenticated</div>;
    }

    return (
        <div className="flex items-center gap-4">
            <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-xs text-gray-500 uppercase">{user.role}</div>
            </div>
            <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded"
            >
                Logout
            </button>
        </div>
    );
}
