'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';

const FormField = ({
    label,
    id,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-light-200 text-sm font-medium">
            {label} {props.required && <span className="text-primary">*</span>}
        </label>
        <input
            id={id}
            {...props}
            className="w-full px-4 py-2.5 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-light-200 transition-all"
        />
    </div>
);

const FormTextArea = ({
    label,
    id,
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) => (
    <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-light-200 text-sm font-medium">
            {label} {props.required && <span className="text-primary">*</span>}
        </label>
        <textarea
            id={id}
            {...props}
            className="w-full px-4 py-2.5 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-light-200 transition-all"
        />
    </div>
);

const FormSelect = ({
    label,
    id,
    options,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: Array<{ value: string; label: string }> }) => (
    <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-light-200 text-sm font-medium">
            {label} {props.required && <span className="text-primary">*</span>}
        </label>
        <select
            id={id}
            {...props}
            className="w-full px-4 py-2.5 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all"
        >
            <option value="">Select {label.toLowerCase()}</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

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
        mode: '',
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
            if (!formData.image) throw new Error('Image is required');
            if (!formData.title || !formData.description || !formData.overview) {
                throw new Error('Title, description, and overview are required');
            }

            const tags = formData.tags
                ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                : [];

            const agenda = formData.agenda
                ? formData.agenda.split('\n').map(item => item.trim()).filter(item => item)
                : [];

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
            <section className="min-h-screen flex items-center justify-center py-12">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-12">
                        <h1 className="mb-2">Create an Event</h1>
                        <p className="text-light-200">Share your event with the developer community</p>
                    </div>

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
                        <FormField
                            label="Event Title"
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter event title"
                            required
                        />

                        {/* Date & Time Row */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            <FormField
                                label="Event Date"
                                id="date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                            />

                            <FormField
                                label="Event Time"
                                id="time"
                                name="time"
                                type="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Location & Venue Row */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            <FormField
                                label="Location"
                                id="location"
                                name="location"
                                type="text"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="City, Country"
                                required
                            />

                            <FormField
                                label="Venue"
                                id="venue"
                                name="venue"
                                type="text"
                                value={formData.venue}
                                onChange={handleInputChange}
                                placeholder="Venue name"
                                required
                            />
                        </div>

                        {/* Mode Selection & Audience Row */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            <FormSelect
                                label="Event Type"
                                id="mode"
                                name="mode"
                                value={formData.mode}
                                onChange={handleInputChange}
                                options={[
                                    { value: 'online', label: 'Online' },
                                    { value: 'offline', label: 'Offline' },
                                    { value: 'hybrid', label: 'Hybrid (In-Person & Online)' }
                                ]}
                                required
                            />

                            <FormField
                                label="Target Audience"
                                id="audience"
                                name="audience"
                                type="text"
                                value={formData.audience}
                                onChange={handleInputChange}
                                placeholder="e.g., Developers, DevOps, Architects"
                                required
                            />
                        </div>

                        {/* Organizer Field */}
                        <FormTextArea
                            label="Organizer Information"
                            id="organizer"
                            name="organizer"
                            value={formData.organizer}
                            onChange={handleInputChange}
                            placeholder="Tell us about your organization or who is organizing this event"
                            rows={3}
                            required
                        />

                        {/* Image Upload */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="image" className="text-light-200 text-sm font-medium">
                                Event Image / Banner <span className="text-primary">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    required
                                    className="w-full px-4 py-2.5 bg-dark-200 border border-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-black file:font-semibold hover:file:bg-primary/90 transition-all"
                                />
                            </div>
                            {formData.image && (
                                <p className="text-sm text-light-200">Selected: {formData.image.name}</p>
                            )}
                        </div>

                        {/* Tags */}
                        <FormField
                            label="Tags"
                            id="tags"
                            name="tags"
                            type="text"
                            value={formData.tags}
                            onChange={handleInputChange}
                            placeholder="Add tags such as react, next.js"
                        />

                        {/* Overview */}
                        <FormTextArea
                            label="Event Overview"
                            id="overview"
                            name="overview"
                            value={formData.overview}
                            onChange={handleInputChange}
                            placeholder="Brief overview of the event"
                            rows={3}
                            required
                        />

                        {/* Description */}
                        <FormTextArea
                            label="Event Description"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Briefly describe the event"
                            rows={4}
                            required
                        />

                        {/* Agenda */}
                        <FormTextArea
                            label="Event Agenda"
                            id="agenda"
                            name="agenda"
                            value={formData.agenda}
                            onChange={handleInputChange}
                            placeholder="Enter agenda items, one per line (e.g., '08:30 AM - 09:30 AM | Keynote: AI-Driven Cloud')"
                            rows={4}
                            required
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Saving Event...' : 'Save Event'}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}
