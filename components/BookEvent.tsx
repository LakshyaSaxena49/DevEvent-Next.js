'use client';
import { useState } from 'react';
import { createBooking } from '@/lib/actions/booking.actions';
import posthog from "posthog-js";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { success } = await createBooking({ eventId, slug, email });

            if (success) {
                setSubmitted(true);
                posthog.capture('event_booked', { eventId, slug, email });
            } else {
                console.error('Booking creation failed');
                posthog.captureException('Booking creation failed');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className='text-sm text-primary font-semibold'>Thank you! Check your email for confirmation.</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Booking...' : 'Book Now'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default BookEvent;
