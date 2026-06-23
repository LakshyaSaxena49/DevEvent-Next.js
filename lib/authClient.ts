/**
 * Client-side authentication utilities
 * Use these functions in your frontend components
 */

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
}

export interface AuthResponse {
    message: string;
    user: User;
    accessToken: string;
}

type TokenPayload = {
    exp?: number;
    userId?: string;
    email?: string;
    name?: string;
    role?: User['role'];
};

export type CreateEventResponse = {
    message: string;
    event: unknown;
};

/**
 * Store access token in memory (not localStorage for security)
 */
let accessToken: string | null = null;

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
    return accessToken;
}

/**
 * Set access token in memory
 */
export function setAccessToken(token: string): void {
    accessToken = token;
}

/**
 * Clear access token
 */
export function clearAccessToken(): void {
    accessToken = null;
}

/**
 * Login user and get tokens
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    setAccessToken(data.accessToken);
    return data;
}

/**
 * Register a new user
 */
export async function register(
    email: string,
    password: string,
    name: string,
    adminSecret?: string
): Promise<{ message: string; user: User }> {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            name,
            ...(adminSecret && { adminSecret }),
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
    }

    return response.json();
}

/**
 * Refresh access token using refresh token cookie
 */
export async function refreshAccessToken(): Promise<string> {
    const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Sends refresh token cookie
    });

    if (!response.ok) {
        clearAccessToken();
        const error = await response.json();
        throw new Error(error.message || 'Token refresh failed');
    }

    const data = await response.json();
    setAccessToken(data.accessToken);
    return data.accessToken;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
    clearAccessToken();

    const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Logout failed');
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getAccessToken() !== null;
}

/**
 * Decode JWT token (without verification - client-side only)
 * Never trust client-side token data in production
 */
export function decodeToken(token: string): TokenPayload | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload) as TokenPayload;
    } catch {
        return null;
    }
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
    const token = getAccessToken();
    if (!token) return false;

    const payload = decodeToken(token);
    return payload?.role === 'admin';
}

/**
 * Get current user info from token
 */
export function getCurrentUser(): User | null {
    const token = getAccessToken();
    if (!token) return null;

    const payload = decodeToken(token);
    if (!payload) return null;

    return {
        id: payload.userId,
        email: payload.email,
        name: payload.name || payload.email,
        role: payload.role,
    } as User;
}

/**
 * Fetch with automatic token refresh on 401
 * Use this instead of direct fetch for protected endpoints
 */
export async function fetchWithAuth(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    let token = getAccessToken();

    if (!token) {
        throw new Error('No access token available');
    }

    // Add token to headers
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
    });

    // If 401, try to refresh token and retry
    if (response.status === 401) {
        try {
            token = await refreshAccessToken();
            headers.Authorization = `Bearer ${token}`;

            response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include',
            });
        } catch {
            // Refresh failed, user needs to login again
            clearAccessToken();
            throw new Error('Session expired. Please login again.');
        }
    }

    return response;
}

/**
 * Create event with automatic auth header
 */
export async function createEvent(formData: FormData): Promise<CreateEventResponse> {
    const response = await fetchWithAuth('/api/events', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create event');
    }

    return response.json();
}

/**
 * Check if token is about to expire (within 2 minutes)
 */
export function isTokenAboutToExpire(bufferMinutes: number = 2): boolean {
    const token = getAccessToken();
    if (!token) return true;

    const payload = decodeToken(token);
    if (!payload?.exp) return true;

    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    const bufferTime = bufferMinutes * 60 * 1000;
    return Date.now() >= expiryTime - bufferTime;
}
