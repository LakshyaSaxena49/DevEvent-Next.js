import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';

cloudinary.config(true);

interface CloudinaryUploadResult {
    secure_url: string;
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const formData = await request.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({ message: 'Invalid form data', error: e instanceof Error ? e.message : 'Unknown error' }, { status: 400 });
        }

        const file = formData.get('image') as File | null;

        // Parse JSON fields
        let tags: string[] = [];
        let agenda: string[] = [];

        try {
            tags = JSON.parse(formData.get("tags") as string);
            agenda = JSON.parse(formData.get("agenda") as string);
        } catch {
            return NextResponse.json(
                {
                    message: "Invalid tags or agenda format"
                },
                { status: 400 }
            );
        }


        if (!file) return NextResponse.json({ message: 'File is required' }, { status: 400 });

        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);


        const uploadResult = await new Promise<UploadApiResponse>(
            (resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: "image",
                        folder: "DevEvent",
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        if (!result) {
                            reject(new Error("No upload result returned"));
                            return;
                        }

                        resolve(result);
                    }
                ).end(buffer);
            }
        );
        
        event.image = uploadResult.secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });

    } catch (e) {
        console.error("FULL ERROR:", e);

        return NextResponse.json({
            message: "Event Creation Failed",
            error: String(e),
            details: e
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: 'Failed to fetch events', error: e }, { status: 500 });
    }
}

// a rote that accepts a slug as input -> returns the event details