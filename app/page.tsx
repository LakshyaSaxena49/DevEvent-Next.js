// app/page.tsx
import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { cacheLife } from "next/cache";



//const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default async function Page() {
  'use cache';
  cacheLife('hours');
  await connectDB();

  const events = await Event.find()
    .sort({ createdAt: -1 })
    .lean();

  return (
    <section className="min-h-screen flex flex-col items-center ">
      <h1 className="text-center text-6xl font-bold">
        The Hub For Every Dev
        <br />
        Event You Wouldn't Want To Miss
      </h1>

      <p className="text-center mt-5 text-xl">
        Hackathons, Meetups, and Conferences, All In One Place
      </p>

      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events">
          {events && events.length > 0 && events.map((event: IEvent) => (
            <li key={event.title} className="list-none">
              <EventCard { ...event } />
            </li>
          ))}
        </ul>
      </div>

    </section>
  );
};
