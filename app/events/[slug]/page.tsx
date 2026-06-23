// app/events/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import EventCard from "@/components/EventCard";
import BookEvent from "@/components/BookEvent";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Minimal IEvent type used in this file
interface IEvent {
  _id: string;
  slug: string;
  title: string;
  image: string;
  date: string;
  time: string;
  location: string;
  description: string;
  overview: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

const EventDetailsItem = ({ icon, alt, label }: { icon: string, alt: string, label: string }) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
)

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
)

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>{tag}</div>
    ))}
  </div>
)

async function getSimilarEventsBySlug(slug: string): Promise<IEvent[]> {
  try {
    const request = await fetch(`${BASE_URL || ""}/api/events`, {
      next: { revalidate: 60 }
    });

    if (!request.ok) {
      return [];
    }

    const response = await request.json();
    const events: IEvent[] = Array.isArray(response.events) ? response.events : [];

    return events
      .filter((event) => event.slug !== slug)
      .slice(0, 4);
  } catch (error) {
    return [];
  }
}


const EventDetailspage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;


  let event: IEvent | null = null;

  try {
    const request = await fetch(`${BASE_URL}/api/events/${slug}`, {
      next: { revalidate: 60 }
    });

    if (!request.ok) {
      if (request.status === 404) {
        notFound();
      }

      throw new Error(
        `Failed to fetch event details: ${request.status} ${request.statusText}`
      );
    }

    const response = await request.json();
    event = response.event;

    if (!event) return notFound();
  } catch (e) {
    console.error("Failed to fetch event", e);
    return notFound();
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

  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);


  return (
    <section id='event'>
      <div className="header">
        <h1>Event Description</h1>
        <p className="">{description}</p>
      </div>

      <div className="details">
        {/* lest side - Event Content */}
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


        {/* right side - Booking Form */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">Join {bookings} people who have already booked their spots!</p>
            ) : (
              <p className="text-sm">Be the first to book your spot!</p>
            )}
            <BookEvent />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events You Might Like</h2>
        <div className="events">
          {similarEvents?.map((similarEvent: IEvent) => (<EventCard key={String(similarEvent._id)} {...similarEvent} />))}
        </div>
      </div>
    </section>
  )
}

export default EventDetailspage



