'use server';

import { getSimilarEventsBySlug } from '@/lib/events';

export const getSimilarEventBySlug = async (slug: string) => {
    try {
        return await getSimilarEventsBySlug(slug);
    } catch {
        return [];
    }
};
