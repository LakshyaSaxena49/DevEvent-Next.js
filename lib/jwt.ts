import jwt, { JwtPayload, SignOptions, VerifyOptions } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
    userId: string;
    email: string;
    role: 'admin' | 'user';
    iat?: number;
    exp?: number;
}

const JWT_SECRET: string = process.env.JWT_SECRET || '';
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || '';
const ACCESS_TOKEN_EXPIRY = (process.env.ACCESS_TOKEN_EXPIRY ||
    '15m') as SignOptions['expiresIn'];
const REFRESH_TOKEN_EXPIRY = (process.env.REFRESH_TOKEN_EXPIRY ||
    '7d') as SignOptions['expiresIn'];

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables');
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const options: SignOptions = {
        expiresIn: ACCESS_TOKEN_EXPIRY,
        algorithm: 'HS256',
    };
    return jwt.sign(payload, JWT_SECRET as string, options);
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const options: SignOptions = {
        expiresIn: REFRESH_TOKEN_EXPIRY,
        algorithm: 'HS256',
    };
    return jwt.sign(payload, JWT_REFRESH_SECRET as string, options);
}

/**
 * Generate both tokens
 */
export function generateTokens(payload: Omit<TokenPayload, 'iat' | 'exp'>) {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
    try {
        const options: VerifyOptions = {
            algorithms: ['HS256'],
        };
        const decoded = jwt.verify(token, JWT_SECRET as string, options);
        return decoded as TokenPayload;
    } catch (error) {
        console.error('Access token verification failed:', error instanceof Error ? error.message : String(error));
        return null;
    }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
    try {
        const options: VerifyOptions = {
            algorithms: ['HS256'],
        };
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET as string, options);
        return decoded as TokenPayload;
    } catch (error) {
        console.error('Refresh token verification failed:', error instanceof Error ? error.message : String(error));
        return null;
    }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}
