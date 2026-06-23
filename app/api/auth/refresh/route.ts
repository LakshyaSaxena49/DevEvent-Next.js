import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        const refreshToken = request.cookies.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { message: 'Refresh token is required' },
                { status: 401 }
            );
        }

        const payload = verifyRefreshToken(refreshToken);

        if (!payload) {
            return NextResponse.json(
                { message: 'Invalid or expired refresh token', error: 'INVALID_REFRESH_TOKEN' },
                { status: 401 }
            );
        }

        // Generate new access token
        const newAccessToken = generateAccessToken({
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        });

        return NextResponse.json(
            {
                message: 'Access token refreshed',
                accessToken: newAccessToken,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json(
            { message: 'Token refresh failed', error: String(error) },
            { status: 500 }
        );
    }
}
