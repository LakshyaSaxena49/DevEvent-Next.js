import 'server-only';

import { cacheLife } from 'next/cache';

import Event from '@/database/event.model';
import connectDB from '@/lib/mongodb';

export type EventDto = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue?: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
};

type LeanEvent = Omit<EventDto, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: { toString(): string };
  createdAt?: Date;
  updatedAt?: Date;
};

const normalizeSlug = (slug: string) => slug.trim().toLowerCase();

const serializeEvent = (event: LeanEvent): EventDto => ({
  ...event,
  _id: event._id.toString(),
  createdAt: event.createdAt?.toISOString(),
  updatedAt: event.updatedAt?.toISOString(),
});

export async function getEvents(): Promise<EventDto[]> {
  'use cache';
  cacheLife('hours');

  await connectDB();

  const events = await Event.find().sort({ createdAt: -1 }).lean<LeanEvent[]>();
  return events.map(serializeEvent);
}

export async function getEventBySlug(slug: string): Promise<EventDto | null> {
  'use cache';
  cacheLife('hours');

  const sanitizedSlug = normalizeSlug(slug);
  if (!sanitizedSlug) {
    return null;
  }

  await connectDB();

  const event = await Event.findOne({ slug: sanitizedSlug }).lean<LeanEvent>();
  return event ? serializeEvent(event) : null;
}

export async function getSimilarEventsBySlug(
  slug: string,
  limit = 4
): Promise<EventDto[]> {
  'use cache';
  cacheLife('hours');

  const event = await getEventBySlug(slug);
  if (!event) {
    return [];
  }

  await connectDB();

  const events = await Event.find({
    _id: { $ne: event._id },
    tags: { $in: event.tags },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<LeanEvent[]>();

  return events.map(serializeEvent);
}
