import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { events } from "@/lib/constants";

const Page = () => {
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
          {events.map((event) => (
            <li key={event.title}>
              <EventCard { ...event } />
            </li>
          ))}
        </ul>
      </div>

    </section>
  );
};

export default Page;