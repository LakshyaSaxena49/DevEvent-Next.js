import mongoose, { Document, Schema, Types } from 'mongoose';
import Event from './event.model';

/**
 * TypeScript interface for Booking document
 */
export interface IBooking extends Document {
    eventId: Types.ObjectId;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose schema for Booking
 */
const bookingSchema = new Schema<IBooking>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Event ID is required'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email address',
            ],
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Pre-save hook: Verify that the referenced eventId exists before saving
 * Prevents orphaned bookings for non-existent events
 */
bookingSchema.pre('save', async function (next) {
    try {
        // Skip validation if eventId hasn't changed
        if (!this.isModified('eventId')) {
            return next();
        }

        // Verify the referenced event exists
        const eventExists = await Event.findById(this.eventId).select('_id');
        if (!eventExists) {
            throw new Error(
                `Event with ID ${this.eventId} does not exist. Please provide a valid event ID.`
            );
        }

        next();
    } catch (error) {
        next(error as Error);
    }
});

/**
 * Indexes for optimized querying
 */
bookingSchema.index({ eventId: 1 });
bookingSchema.index({ eventId: 1, createdAt: -1 });
bookingSchema.index({ email: 1 });

/**
 * Create or retrieve Booking model
 * Prevents model recompilation in development
 */
const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
