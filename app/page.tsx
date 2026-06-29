import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { getEvents } from "@/lib/events";

export default async function HomePage() {
  const events = await getEvents();

  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] md:min-h-[65vh] py-12 md:py-20 pt-6">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="mb-4">
            The Hub for Every Dev
            <br />
            Event You Can&apos;t Miss
          </h1>

          <p className="text-light-100 text-lg sm:text-xl mb-8">
            Hackathons, Meetups, and Conferences, All In One Place
          </p>

          <ExploreBtn />
        </div>
      </section>

      {/* Featured Events Section */}
      <section id="events" className="pt-10 pb-16">
        <h3 className="mb-10 text-2xl sm:text-3xl">Featured Events</h3>

        {events.length > 0 ? (
          <ul className="events">
            {events.map((event) => (
              <li key={event._id} className="list-none">
                <EventCard {...event} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <p className="text-light-200">No events available yet. Check back soon!</p>
          </div>
        )}
      </section>
    </>
  );
}
