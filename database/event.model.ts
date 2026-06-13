import mongoose, { Document, Schema } from 'mongoose';

/**
 * TypeScript interface for Event document
 */
export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose schema for Event
 */
const eventSchema = new Schema<IEvent>(
    {
        title: {
            type: String,
            required: [true, 'Event title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters long'],
        },
        slug: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, 'Event description is required'],
            trim: true,
        },
        overview: {
            type: String,
            required: [true, 'Event overview is required'],
            trim: true,
        },
        image: {
            type: String,
            required: [true, 'Event image URL is required'],
            trim: true,
        },
        venue: {
            type: String,
            required: [true, 'Event venue is required'],
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Event location is required'],
            trim: true,
        },
        date: {
            type: String,
            required: [true, 'Event date is required'],
        },
        time: {
            type: String,
            required: [true, 'Event time is required'],
        },
        mode: {
            type: String,
            enum: ['online', 'offline', 'hybrid'],
            required: [true, 'Event mode is required'],
        },
        audience: {
            type: String,
            required: [true, 'Target audience is required'],
            trim: true,
        },
        agenda: {
            type: [String],
            required: [true, 'Event agenda is required'],
            validate: {
                validator: (v: string[]) => Array.isArray(v) && v.length > 0,
                message: 'Agenda must be a non-empty array',
            },
        },
        organizer: {
            type: String,
            required: [true, 'Event organizer is required'],
            trim: true,
        },
        tags: {
            type: [String],
            required: [true, 'Event tags are required'],
            validate: {
                validator: (v: string[]) => Array.isArray(v) && v.length > 0,
                message: 'Tags must be a non-empty array',
            },
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Pre-save hook: Auto-generate slug from title and normalize date/time formats
 * - Slug is only regenerated if title changes (prevents slug mutation on updates)
 * - Date is normalized to ISO format
 * - Time is stored in consistent HH:MM format
 */
eventSchema.pre('save', async function (next) {
    try {
        // Only generate slug if title is new or modified
        if (this.isModified('title')) {
            this.slug = this.title
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/[^\w\-]/g, '') // Remove special characters
                .replace(/\-+/g, '-') // Replace multiple hyphens with single hyphen
                .replace(/^\-+|\-+$/g, ''); // Remove leading/trailing hyphens
        }

        // Normalize date to ISO format (YYYY-MM-DD)
        if (this.isModified('date')) {
            const parsedDate = new Date(this.date);
            if (isNaN(parsedDate.getTime())) {
                throw new Error('Invalid date format. Please use YYYY-MM-DD or a valid date string.');
            }
            this.date = parsedDate.toISOString().split('T')[0];
        }

        // Normalize time to HH:MM format
        if (this.isModified('time')) {
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(this.time)) {
                throw new Error('Invalid time format. Please use HH:MM (24-hour format).');
            }
        }

        next();
    } catch (error) {
        next(error as Error);
    }
});

/**
 * Create or retrieve Event model
 * Prevents model recompilation in development
 */
const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

export default Event;
