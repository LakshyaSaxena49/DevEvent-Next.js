import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getEventBySlug, getSimilarEventsBySlug } from '@/lib/events';
import BookEvent from './BookEvent';
import EventCard from './EventCard';

type EventDetailsProps = {
    slug: string;
};

const EventDetailsItem = ({ icon, label }: { icon: string; label: string }) => (
    <div className="flex items-center gap-3 text-light-100">
        <Image src={icon} alt="icon" width={16} height={16} />
        <p className="text-sm">{label}</p>
    </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-row gap-2 flex-wrap">
        {tags.map((tag) => (
            <span key={tag} className="pill">{tag}</span>
        ))}
    </div>
);

const EventDetails = async ({ slug }: EventDetailsProps) => {
    const [event, similarEvents] = await Promise.all([
        getEventBySlug(slug),
        getSimilarEventsBySlug(slug),
    ]);

    if (!event) {
        notFound();
    }

    const {
        title,
        description,
        image,
        overview,
        date,
        time,
        location,
        mode,
        audience,
        venue,
        agenda,
        organizer,
        tags,
        _id: eventId
    } = event;

    return (
        <main>
            {/* Hero Section */}
            <section id="event-hero" className="mb-10">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Image */}
                    <div className="order-2 md:order-1">
                        <Image
                            src={image}
                            alt={title}
                            width={600}
                            height={400}
                            className="rounded-lg w-full object-cover h-96 md:h-full"
                        />
                    </div>

                    {/* Content & Booking */}
                    <div className="order-1 md:order-2 flex flex-col gap-6">
                        <div>
                            <h1 className="mb-3">{title}</h1>
                            <p className="text-light-100 text-lg">{description}</p>
                        </div>

                        <div className="bg-dark-100 border border-dark-200 rounded-lg p-6 space-y-4">
                            <h3 className="text-xl font-semibold">Book Your Spot</h3>
                            <BookEvent eventId={eventId} slug={slug} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Overview Section */}
            <section className="mb-10">
                <h2 className="mb-4">Overview</h2>
                <p className="text-light-100 leading-relaxed">{overview}</p>
            </section>

            {/* Event Details Section */}
            <section className="mb-10">
                <h2 className="mb-6">Event Details</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                    <EventDetailsItem icon="/icons/calendar.svg" label={date} />
                    <EventDetailsItem icon="/icons/clock.svg" label={time} />
                    <EventDetailsItem icon="/icons/pin.svg" label={location} />
                    <EventDetailsItem icon="/icons/mode.svg" label={mode} />
                    <EventDetailsItem icon="/icons/audience.svg" label={audience} />
                    {venue && <EventDetailsItem icon="/icons/venue.svg" label={venue} />}
                </div>
            </section>

            {/* Agenda Section */}
            <section className="mb-10">
                <h2 className="mb-4">Agenda</h2>
                <ul className="space-y-2 text-light-100">
                    {agenda.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <span className="text-primary mt-1">•</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Organizer Section */}
            <section className="mb-10">
                <h2 className="mb-4">About the Organizer</h2>
                <p className="text-light-100 leading-relaxed">{organizer}</p>
            </section>

            {/* Tags Section */}
            <section className="mb-16">
                <EventTags tags={tags} />
            </section>

            {/* Similar Events Section */}
            {similarEvents.length > 0 && (
                <section>
                    <h2 className="mb-8">Similar Events You Might Like</h2>
                    <ul className="events">
                        {similarEvents.map((similarEvent) => (
                            <li key={similarEvent._id} className="list-none">
                                <EventCard {...similarEvent} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </main>
    );
};

export default EventDetails;
