import Image from 'next/image';
import { notFound } from 'next/navigation';

import { getEventBySlug, getSimilarEventsBySlug } from '@/lib/events';
import BookEvent from './BookEvent';
import EventCard from './EventCard';

type EventDetailsProps = {
    slug: string;
};

type EventDetailsItemProps = {
    icon: string;
    alt: string;
    label: string;
};

const EventDetailsItem = ({ icon, alt, label }: EventDetailsItemProps) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div className="pill" key={tag}>{tag}</div>
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
        description,
        image,
        overview,
        date,
        time,
        location,
        mode,
        audience,
        agenda,
        organizer,
        tags
    } = event;


    const bookings = 10;

    return (
        <section id='event'>
            <div className="header">
                <h1>Event Description</h1>
                <p className="">{description}</p>
            </div>

            <div className="details">
                <div className="content">
                    <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>

                        <EventDetailsItem icon="/icons/calendar.svg" alt="Calendar Icon" label={date} />
                        <EventDetailsItem icon="/icons/clock.svg" alt="clock Icon" label={time} />
                        <EventDetailsItem icon="/icons/pin.svg" alt="pin Icon" label={location} />
                        <EventDetailsItem icon="/icons/mode.svg" alt="mode Icon" label={mode} />
                        <EventDetailsItem icon="/icons/audience.svg" alt="audience Icon" label={audience} />
                    </section>

                    <EventAgenda agendaItems={agenda} />

                    <section className="flex-col-gap-2">
                        <h2>About the Organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    <EventTags tags={tags} />

                </div>

                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot</h2>
                        {bookings > 0 ? (
                            <p className="text-sm">Join {bookings} people who have already booked their spots!</p>
                        ) : (
                            <p className="text-sm">Be the first to book your spot!</p>
                        )}
                        <BookEvent eventId={event._id} slug={event.slug} />
                    </div>
                </aside>
            </div>

            <div className="flex w-full flex-col gap-4 pt-20">
                <h2>Similar Events You Might Like</h2>
                <div className="events">
                    {similarEvents.map((similarEvent) => (
                        <EventCard key={similarEvent._id} {...similarEvent} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EventDetails;
