import { NextResponse } from 'next/server';

import { getEventBySlug } from '@/lib/events';

/**
 * GET /api/events/[slug]
 * Fetches a single events by its slug
 */
export async function GET(
    _request: Request,
    { params }: RouteContext<'/api/events/[slug]'>
): Promise<NextResponse> {
    try {
        const { slug } = await params;

        if (!slug || typeof slug !== 'string' || slug.trim() === '') {
            return NextResponse.json(
                { message: 'Invalid or missing slug parameter' },
                { status: 400 }
            );
        }

        const event = await getEventBySlug(slug);

        if (!event) {
            return NextResponse.json(
                { message: `Event with slug '${slug.trim().toLowerCase()}' not found` },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Event fetched successfully', event },
            { status: 200 }
        );
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching events by slug:', error);
        }

        if (error instanceof Error) {
            if (error.message.includes('MONGODB_URI')) {
                return NextResponse.json(
                    { message: 'Database configuration error' },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { message: 'Failed to fetch events', error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
