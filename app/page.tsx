import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { getEvents } from "@/lib/events";

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

      <ExploreBtn />

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
