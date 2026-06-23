import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/database/user.model';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { email, password, name, adminSecret } = await request.json();

        // Validate input
        if (!email || !password || !name) {
            return NextResponse.json(
                { message: 'Email, password, and name are required' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return NextResponse.json(
                { message: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Determine role: admin if valid admin secret is provided
        let role: 'admin' | 'user' = 'user';
        if (adminSecret && adminSecret === process.env.ADMIN_SECRET) {
            role = 'admin';
        }

        // Create new user
        const user = await User.create({
            email: email.toLowerCase(),
            password,
            name,
            role,
            isActive: true,
        });

        return NextResponse.json(
            {
                message: 'User registered successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Registration failed', error: String(error) },
            { status: 500 }
        );
    }
}
