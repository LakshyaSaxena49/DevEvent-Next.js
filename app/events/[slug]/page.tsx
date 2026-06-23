import { Suspense } from "react";
import EventDetails from "@/components/EventDetails";

export default function EventDetailsPage({
  params,
}: PageProps<"/events/[slug]">) {
  return(
    <main>
      <Suspense fallback={<div>Loading ... </div>}>
        {params.then(({ slug }) => (
          <EventDetails slug={slug} />
        ))}
      </Suspense>
    </main>
  );
}
