import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader, TokenPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
    user?: TokenPayload;
}

/**
 * Authentication middleware for protecting routes
 * Verifies JWT token and attaches user payload to request
 */
export async function authenticateToken(request: NextRequest): Promise<{ user: TokenPayload | null; error: NextResponse | null }> {
    try {
        const authHeader = request.headers.get('authorization');
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return {
                user: null,
                error: NextResponse.json(
                    { message: 'Access token is required', error: 'MISSING_TOKEN' },
                    { status: 401 }
                ),
            };
        }

        const payload = verifyAccessToken(token);

        if (!payload) {
            return {
                user: null,
                error: NextResponse.json(
                    { message: 'Invalid or expired access token', error: 'INVALID_TOKEN' },
                    { status: 401 }
                ),
            };
        }

        return { user: payload, error: null };
    } catch (error) {
        return {
            user: null,
            error: NextResponse.json(
                { message: 'Authentication failed', error: String(error) },
                { status: 500 }
            ),
        };
    }
}

/**
 * Middleware to check if user is admin
 * Should be used after authenticateToken
 */
export function requireAdmin(user: TokenPayload | null | undefined): NextResponse | null {
    if (!user) {
        return NextResponse.json(
            { message: 'Unauthorized', error: 'NO_USER' },
            { status: 401 }
        );
    }

    if (user.role !== 'admin') {
        return NextResponse.json(
            { message: 'Forbidden: Admin access required', error: 'NOT_ADMIN' },
            { status: 403 }
        );
    }

    return null;
}

/**
 * Middleware to check if user is authenticated (any role)
 * Should be used after authenticateToken
 */
export function requireAuth(user: TokenPayload | null | undefined): NextResponse | null {
    if (!user) {
        return NextResponse.json(
            { message: 'Unauthorized', error: 'NO_USER' },
            { status: 401 }
        );
    }

    return null;
}
