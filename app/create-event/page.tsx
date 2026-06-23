'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        overview: '',
        venue: '',
        location: '',
        date: '',
        time: '',
        mode: 'online',
        audience: '',
        organizer: '',
        tags: '',
        agenda: '',
        image: null as File | null,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file,
            }));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.image) {
                throw new Error('Image is required');
            }

            if (!formData.title || !formData.description || !formData.overview) {
                throw new Error('Title, description, and overview are required');
            }

            // Parse tags and agenda
            const tags = formData.tags
                ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
                : [];

            const agenda = formData.agenda
                ? formData.agenda.split('\n').map(item => item.trim()).filter(item => item !== '')
                : [];

            // Create FormData for multipart/form-data
            const submitFormData = new FormData();
            submitFormData.append('title', formData.title);
            submitFormData.append('description', formData.description);
            submitFormData.append('overview', formData.overview);
            submitFormData.append('venue', formData.venue);
            submitFormData.append('location', formData.location);
            submitFormData.append('date', formData.date);
            submitFormData.append('time', formData.time);
            submitFormData.append('mode', formData.mode);
            submitFormData.append('audience', formData.audience);
            submitFormData.append('organizer', formData.organizer);
            submitFormData.append('tags', JSON.stringify(tags));
            submitFormData.append('agenda', JSON.stringify(agenda));
            submitFormData.append('image', formData.image);

            const response = await fetch('/api/events', {
                method: 'POST',
                body: submitFormData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create event');
            }

            setSuccess(true);
            posthog.capture('event_created', { title: formData.title });

            // Reset form
            setFormData({
                title: '',
                description: '',
                overview: '',
                venue: '',
                location: '',
                date: '',
                time: '',
                mode: 'online',
                audience: '',
                organizer: '',
                tags: '',
                agenda: '',
                image: null,
            });

            // Redirect after 2 seconds
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
            setError(errorMessage);
            posthog.captureException(new Error(`Event creation error: ${errorMessage}`));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <div className="max-w-2xl">
                <h1 className="mb-8">Create New Event</h1>

                {success && (
                    <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                        <p className="text-green-400">Event created successfully! Redirecting...</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-light-200 text-sm font-medium mb-1">
                            Event Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g., React Conference 2024"
                            required
                            className="w-full px-4 py-2 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-light-200"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-light-200 text-sm font-medium mb-1">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Detailed description of the event"
                            rows={4}
                            required
                            className="w-full px-4 py-2 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-light-200"
                        />
                    </div>

                    {/* Overview */}
                    <div>
                        <label htmlFor="overview" className="block text-light-200 text-sm font-medium mb-1">
                            Overview *
                        </label>
                        <textarea
                            id="overview"
                            name="overview"
                            value={formData.overview}
                            onChange={handleInputChange}
                            placeholder="Brief overview of the event"
                            rows={2}
                            required
                            className="w-full px-4 py-2 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-light-200"
                        />
                    </div>

                    {/* Organizer */}
                    <div>
                        <label htmlFor="organizer" className="block text-light-200 text-sm font-medium mb-1">
                            Organizer
                        </label>
                        <input
                            type="text"
                            id="organizer"
                            name="organizer"
                            value={formData.organizer}
                            onChange={handleInputChange}
                            placeholder="e.g., DevCommunity"
                            className="w-full px-4 py-2 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-light-200"
                        />
                    </div>

                    {/* Venue */}
                    <div>
                        <label htmlFor="venue" className="block text-light-200 text-sm font-medium mb-1">
                            Venue
                        </label>
                        <input
                            type="text"
                            id="venue"
                            name="venue"
                            value={formData.venue}
                            onChange={handleInputChange}
                            placeholder="e.g., Grand Ballroom, Convention Center"
                            className="w-full px-4 py-2 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-light-200"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-light-200 text-sm font-medium mb-1">
                            Location *
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="e.g., San Francisco, CA"
                            required
                            className="w-full px-4 py-2 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-light-200"
                        />
                    </div>

                    {/* Mode */}
                    <div>
                        <label htmlFor="mode" className="block text-light-200 text-sm font-medium mb-1">
                            Event Mode
                        </label>
                        <select
                            id="mode"
                            name="mode"
                            value={formData.mode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        >
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-light-200 text-sm font-medium mb-1">
                                Date *
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-light-200"
                            />
                        </div>

                        <div>
                            <label htmlFor="time" className="block text-light-200 text-sm font-medium mb-1">
                                Time *
                            </label>
                            <input
                                type="time"
                                id="time"
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-light-200"
                            />
                        </div>
                    </div>

                    {/* Audience */}
                    <div>
                        <label htmlFor="audience" className="block text-light-200 text-sm font-medium mb-1">
                            Target Audience
                        </label>
                        <input
                            type="text"
                            id="audience"
                            name="audience"
                            value={formData.audience}
                            onChange={handleInputChange}
                            placeholder="e.g., Beginner, Intermediate, Advanced"
                            className="w-full px-4 py-2 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-light-200"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label htmlFor="tags" className="block text-light-200 text-sm font-medium mb-1">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            placeholder="e.g., React, JavaScript, Web Development"
                            className="w-full px-4 py-2 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-light-200"
                        />
                    </div>

                    {/* Agenda */}
                    <div>
                        <label htmlFor="agenda" className="block text-light-200 text-sm font-medium mb-1">
                            Agenda (one item per line)
                        </label>
                        <textarea
                            id="agenda"
                            name="agenda"
                            value={formData.agenda}
                            onChange={handleInputChange}
                            placeholder="Opening keynote&#10;Panel discussion&#10;Networking break&#10;Closing remarks"
                            rows={4}
                            className="w-full px-4 py-2 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-light-200"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label htmlFor="image" className="block text-light-200 text-sm font-medium mb-1">
                            Event Image *
                        </label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleFileChange}
                            accept="image/*"
                            required
                            className="w-full px-4 py-2 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        />
                        {formData.image && (
                            <p className="mt-2 text-sm text-light-200">
                                Selected: {formData.image.name}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-black font-medium rounded-lg disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Creating Event...' : 'Create Event'}
                    </button>
                </form>
            </div>
        </main>
    );
}
