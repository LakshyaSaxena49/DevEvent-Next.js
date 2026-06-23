import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { getEvents } from "@/lib/events";
import Link from "next/link";

export default async function Page() {
  const events = await getEvents();

  return (
    <section className="flex min-h-screen flex-col items-center">
      <h1 className="text-center text-6xl font-bold">
        The Hub For Every Dev
        <br />
        Event You Wouldn&apos;t Want To Miss
      </h1>

      <p className="text-center mt-5 text-xl">
        Hackathons, Meetups, and Conferences, All In One Place
      </p>

      <div className="flex gap-4 mt-7 flex-wrap justify-center">
        <ExploreBtn />
        <Link href="/create-event" className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-full transition-colors inline-flex items-center">
          Create Event
        </Link>
      </div>

      <div id="events" className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events">
          {events.map((event) => (
            <li key={event._id} className="list-none">
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
